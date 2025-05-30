import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, DollarSign, TrendingUp, Building2, Plus, Edit, Pause, Calendar, User } from "lucide-react";
import { authService } from "@/lib/auth";
import type { VenueStats } from "@/lib/types";

export default function VenueDashboard() {
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);

  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: authService.isAuthenticated(),
  });

  const { data: venues = [] } = useQuery({
    queryKey: ['/api/venues', { ownerId: user?.id }],
    queryFn: async () => {
      const response = await fetch(`/api/venues?ownerId=${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });
      return response.json();
    },
    enabled: !!user?.id,
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

  const currentVenue = venues.find((v: any) => v.id === (selectedVenueId || venues[0]?.id)) || venues[0];

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
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Venue
            </Button>
          </div>
        ) : (
          <>
            {/* Venue Selector */}
            {venues.length > 1 && (
              <div className="mb-8">
                <div className="flex space-x-4">
                  {venues.map((venue: any) => (
                    <Button
                      key={venue.id}
                      variant={venue.id === (selectedVenueId || venues[0]?.id) ? "default" : "outline"}
                      onClick={() => setSelectedVenueId(venue.id)}
                    >
                      {venue.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

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
                                <User className="h-4 w-4 mr-1" />
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
    </div>
  );
}
