import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SearchFilters } from "@/lib/types";

interface FiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onApplyFilters: () => void;
}

export default function Filters({ filters, onFiltersChange, onApplyFilters }: FiltersProps) {
  const amenitiesList = [
    "Parking Available",
    "Changing Rooms", 
    "Equipment Rental",
    "Floodlights",
    "Shower Facilities",
    "Food & Beverages",
    "Air Conditioning",
    "WiFi"
  ];

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    updateFilter('amenities', updatedAmenities);
  };

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-6">Filters</h3>
        
        {/* Price Range */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Price Range</Label>
          <div className="flex items-center space-x-3">
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ''}
              onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)}
              className="text-sm"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceMax || ''}
              onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Sport Type */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Sport Type</Label>
          <Select 
            value={filters.sportType || ''} 
            onValueChange={(value) => updateFilter('sportType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sports</SelectItem>
              <SelectItem value="football">Football</SelectItem>
              <SelectItem value="basketball">Basketball</SelectItem>
              <SelectItem value="tennis">Tennis</SelectItem>
              <SelectItem value="badminton">Badminton</SelectItem>
              <SelectItem value="volleyball">Volleyball</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amenities */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Amenities</Label>
          <div className="space-y-2">
            {amenitiesList.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={filters.amenities?.includes(amenity) || false}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <Label htmlFor={amenity} className="text-sm cursor-pointer">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Distance */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Distance</Label>
          <Select 
            value={filters.distance?.toString() || ''} 
            onValueChange={(value) => updateFilter('distance', value ? Number(value) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any distance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any distance</SelectItem>
              <SelectItem value="5">Within 5km</SelectItem>
              <SelectItem value="10">Within 10km</SelectItem>
              <SelectItem value="25">Within 25km</SelectItem>
              <SelectItem value="50">Within 50km</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={onApplyFilters}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}
