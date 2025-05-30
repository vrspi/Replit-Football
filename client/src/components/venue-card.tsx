import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Calendar } from "lucide-react";
import type { Venue } from "@/lib/types";

interface VenueCardProps {
  venue: Venue;
  onViewCalendar: (venue: Venue) => void;
}

export default function VenueCard({ venue, onViewCalendar }: VenueCardProps) {
  const defaultImage = "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300";
  
  return (
    <Card className="overflow-hidden hover:shadow-material-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        <img 
          src={venue.images[0] || defaultImage}
          alt={venue.name}
          className="w-full md:w-80 h-60 object-cover"
        />
        <CardContent className="p-6 flex-1">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-semibold">{venue.name}</h3>
              <p className="text-gray-600 flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-2" />
                {venue.address}, {venue.city}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-yellow-500 mb-1">
                <Star className="h-4 w-4 fill-current" />
                <span className="ml-1 font-medium">{Number(venue.rating).toFixed(1)}</span>
                <span className="text-gray-500 text-sm ml-1">({venue.reviewCount} reviews)</span>
              </div>
              <div className="text-2xl font-bold text-blue-500">
                Starting at $25/hr
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="default" className="bg-blue-50 text-blue-700">Football</Badge>
            {venue.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                {amenity}
              </Badge>
            ))}
          </div>

          <p className="text-gray-600 mb-4">
            {venue.description || "Premium sports facility with professional-grade equipment and amenities."}
          </p>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <Calendar className="h-4 w-4 inline mr-1" />
              Next available: Today 6:00 PM
            </div>
            <Button 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => onViewCalendar(venue)}
            >
              View Calendar
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
