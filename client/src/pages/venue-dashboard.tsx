import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, DollarSign, TrendingUp, Building2, Plus, Edit, Pause, Calendar, User as UserIcon } from "lucide-react";
import { authService } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { VenueStats, User, Venue } from "@/lib/types";

export default function VenueDashboard() {
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);
  const [venueDialogOpen, setVenueDialogOpen] = useState(false);
  const [newVenue, setNewVenue] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    email: '',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create venue mutation
  const createVenueMutation = useMutation({
    mutationFn: async (venueData: Omit<Venue, 'id' | 'ownerId' | 'amenities' | 'images' | 'verificationDocs' | 'status' | 'rating' | 'reviewCount'>) => {
      const res = await apiRequest('POST', '/api/venues', {
        ...venueData,
        amenities: [],
        images: [],
        verificationDocs: []
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Venue Created",
        description: "Your venue has been created successfully.",
      });
      setVenueDialogOpen(false);
      // Reset form
      setNewVenue({
        name: '',
        description: '',
        address: '',
        city: '',
        phone: '',
        email: '',
      });
      // Refresh venues list
      queryClient.invalidateQueries({ queryKey: ['/api/venues'] });
    },
    onError: (error: any) => {
      toast({
        title: "Venue Creation Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: user } = useQuery<any>({
    queryKey: ['/api/auth/me'],
    enabled: authService.isAuthenticated(),
  });

  const { data: venues = [], isLoading: venuesLoading, isError: venuesError, refetch: refetchVenues } = useQuery<any[]>({
    queryKey: ['/api/venues', { ownerId: user?.id }],
    queryFn: async () => {
      // Use apiRequest for consistency with token handling
      const response = await apiRequest('GET', '/api/venues', undefined);
      const data = await response.json();
      console.log('Fetched venues:', data);
      return data;
    },
    enabled: !!user?.id,
    staleTime: 0, // Don't cache this data
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gets focus
  });

  const { data: fields = [] } = useQuery({
    queryKey: ['/api/venues', selectedVenueId || venues[0]?.id, 'fields'],
    queryFn: async () => {
      const venueId = selectedVenueId || venues[0]?.id;
      if (!venueId) return [];
      const response = await fetch(`/api/venues/${venueId}/fields`);
      return response.json();
    },
    enabled: !!(selectedVenueId || venues[0]?.id),
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/venue', selectedVenueId || venues[0]?.id, 'stats'],
    queryFn: async () => {
      const venueId = selectedVenueId || venues[0]?.id;
      if (!venueId) return null;
      const response = await fetch(`/api/dashboard/venue/${venueId}/stats`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });
      return response.json();
    },
    enabled: !!(selectedVenueId || venues[0]?.id),
  });

  // Debug venues data
  console.log('Current venues data:', venues);
  
  // Get current venue (more safely)
  const currentVenue = venues.length > 0 
    ? (venues.find((v: any) => v.id === (selectedVenueId || venues[0]?.id)) || venues[0]) 
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Venue Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your facilities and bookings</p>
        </div>

        {venues.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No venues yet</h3>
            <p className="text-gray-600 mb-6">Create your first venue to start accepting bookings</p>
            <Button 
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => setVenueDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Venue
            </Button>
          </div>
        ) : (
          <>
            {/* Venue Header with Add Button */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold">Your Venues</h2>
              <Button 
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => setVenueDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Venue
              </Button>
            </div>
            
            {/* Venue Selector/Cards */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {venues.map((venue: any) => (
                  <Card 
                    key={venue.id} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${venue.id === (selectedVenueId || venues[0]?.id) ? 'border-2 border-blue-500' : ''}`}
                    onClick={() => setSelectedVenueId(venue.id)}
                  >
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{venue.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{venue.address}, {venue.city}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={venue.status === 'approved' ? 'default' : 'secondary'}>
                          {venue.status || 'pending'}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <CalendarCheck className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    12% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">${(stats?.totalRevenue || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    8% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                      <p className="text-3xl font-bold text-gray-900">{Math.round((stats?.occupancyRate || 0) * 100)}%</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <TrendingUp className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    5% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Fields</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.activeFields || 0}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Building2 className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    {fields.filter((f: any) => f.status === 'active').length} online, {fields.filter((f: any) => f.status === 'maintenance').length} maintenance
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Fields Management */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Your Fields</CardTitle>
                      <Button className="bg-blue-500 hover:bg-blue-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {fields.length === 0 ? (
                        <div className="text-center py-8">
                          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">No fields added yet</p>
                        </div>
                      ) : (
                        fields.map((field: any) => (
                          <div key={field.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{field.name}</h3>
                                <p className="text-gray-600 text-sm">{field.description || `${field.sportType} field`}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                  <Badge variant={field.status === 'active' ? 'default' : 'secondary'}>
                                    {field.status === 'active' ? (
                                      <>
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                        Active
                                      </>
                                    ) : (
                                      field.status
                                    )}
                                  </Badge>
                                  <span className="text-sm text-gray-500">Rate: ${field.hourlyRate}/hr</span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Calendar className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Pause className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Bookings */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { player: "John Smith", field: "Football Field A", time: "Today, 2:00 PM - 3:00 PM", amount: 35 },
                        { player: "Sarah Wilson", field: "Basketball Court", time: "Today, 4:00 PM - 5:00 PM", amount: 30 },
                        { player: "Mike Johnson", field: "Football Field B", time: "Tomorrow, 6:00 PM - 7:00 PM", amount: 45 },
                      ].map((booking, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium flex items-center">
                                <UserIcon className="h-4 w-4 mr-1" />
                                {booking.player}
                              </p>
                              <p className="text-sm text-gray-600">{booking.field}</p>
                              <p className="text-xs text-gray-500">{booking.time}</p>
                            </div>
                            <span className="text-sm font-medium text-green-600">${booking.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="link" className="w-full mt-6 text-blue-500 hover:text-blue-600">
                      View All Bookings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Venue Creation Dialog */}
      <Dialog open={venueDialogOpen} onOpenChange={setVenueDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Venue</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            createVenueMutation.mutate(newVenue);
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Venue Name*</Label>
                <Input 
                  id="name" 
                  value={newVenue.name}
                  onChange={(e) => setNewVenue({...newVenue, name: e.target.value})}
                  placeholder="Enter venue name"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={newVenue.description}
                  onChange={(e) => setNewVenue({...newVenue, description: e.target.value})}
                  placeholder="Describe your venue"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address">Address*</Label>
                <Input 
                  id="address" 
                  value={newVenue.address}
                  onChange={(e) => setNewVenue({...newVenue, address: e.target.value})}
                  placeholder="Full address"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="city">City*</Label>
                <Input 
                  id="city" 
                  value={newVenue.city}
                  onChange={(e) => setNewVenue({...newVenue, city: e.target.value})}
                  placeholder="City"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={newVenue.phone}
                    onChange={(e) => setNewVenue({...newVenue, phone: e.target.value})}
                    placeholder="Contact phone"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newVenue.email}
                    onChange={(e) => setNewVenue({...newVenue, email: e.target.value})}
                    placeholder="Contact email"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setVenueDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-500 hover:bg-blue-600"
                disabled={createVenueMutation.isPending}
              >
                {createVenueMutation.isPending ? 'Creating...' : 'Create Venue'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
