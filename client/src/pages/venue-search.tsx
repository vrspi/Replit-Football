import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VenueCard from "@/components/venue-card";
import Filters from "@/components/filters";
import BookingCalendar from "@/components/booking-calendar";
import type { Venue, SearchFilters } from "@/lib/types";

export default function VenueSearch() {
  const [location] = useLocation();
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [filters, setFilters] = useState<SearchFilters>({});

  // Parse URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters: SearchFilters = {};
    
    if (urlParams.get('sportType')) initialFilters.sportType = urlParams.get('sportType')!;
    if (urlParams.get('city')) initialFilters.city = urlParams.get('city')!;
    if (urlParams.get('date')) initialFilters.date = urlParams.get('date')!;
    
    setFilters(initialFilters);
  }, [location]);

  const { data: venues = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/venues/search', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            params.set(key, value.join(','));
          } else {
            params.set(key, value.toString());
          }
        }
      });
      
      const response = await fetch(`/api/venues/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }
      return response.json();
    },
  });

  const handleViewCalendar = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsCalendarOpen(true);
  };

  const handleApplyFilters = () => {
    refetch();
  };

  const sortedVenues = [...venues].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return 25 - 35; // Mock price comparison
      case 'rating':
        return Number(b.rating) - Number(a.rating);
      case 'distance':
      default:
        return 0; // Would implement actual distance sorting
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Filters 
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={handleApplyFilters}
            />
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {isLoading ? 'Searching...' : `${venues.length} Available Venues`}
              </h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Sort by Distance</SelectItem>
                  <SelectItem value="price">Sort by Price</SelectItem>
                  <SelectItem value="rating">Sort by Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-material h-64 animate-pulse" />
                ))}
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏟️</div>
                <h3 className="text-xl font-semibold mb-2">No venues found</h3>
                <p className="text-gray-600">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedVenues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    onViewCalendar={handleViewCalendar}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BookingCalendar
        venue={selectedVenue}
        isOpen={isCalendarOpen}
        onClose={() => {
          setIsCalendarOpen(false);
          setSelectedVenue(null);
        }}
      />
    </div>
  );
}
