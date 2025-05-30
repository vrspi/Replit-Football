import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Calendar, 
  Star, 
  MapPin, 
  Clock, 
  Settings, 
  Heart,
  Trophy,
  TrendingUp,
  Edit,
  Save,
  X
} from "lucide-react";
import { authService } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Booking, Venue } from "@/lib/types";

const profileUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

export default function PlayerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: authService.isAuthenticated(),
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: async () => {
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
    enabled: authService.isAuthenticated(),
  });

  // Mock data for favorites and stats since we don't have this implemented yet
  const userStats = {
    totalBookings: bookings.length,
    hoursPlayed: bookings.length * 1, // Assuming 1 hour per booking
    favoriteVenues: 3, // Mock data
  };

  const favorites: Venue[] = []; // Would be fetched from API

  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateForm) => {
      return apiRequest('PUT', `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return apiRequest('PUT', `/api/bookings/${bookingId}`, {
        status: 'cancelled',
        cancellationReason: 'Cancelled by user',
      });
    },
    onSuccess: () => {
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel booking.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileUpdateForm) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancelBooking = (bookingId: number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-blue-500" />
              </div>
              <div className="text-white flex-1">
                <h1 className="text-2xl font-bold">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.username
                  }
                </h1>
                <p className="opacity-90">{user?.email}</p>
                <p className="text-sm opacity-75">
                  Member since {new Date(user?.createdAt || '').toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-500"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Profile Content */}
          <CardContent className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                  <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
                  {userStats.totalBookings}
                </div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                  <Clock className="h-6 w-6 mr-2 text-blue-500" />
                  {userStats.hoursPlayed}
                </div>
                <div className="text-sm text-gray-600">Hours Played</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                  <Heart className="h-6 w-6 mr-2 text-red-500" />
                  {userStats.favoriteVenues}
                </div>
                <div className="text-sm text-gray-600">Favorite Venues</div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bookings" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Booking History
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorites
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Profile Settings
                </TabsTrigger>
              </TabsList>

              {/* Booking History Tab */}
              <TabsContent value="bookings" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Bookings</h3>
                  {bookingsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                      <p className="text-gray-600 mb-6">Start exploring venues and make your first booking!</p>
                      <Button className="bg-blue-500 hover:bg-blue-600">
                        Find Venues
                      </Button>
                    </div>
                  ) : (
                    bookings.map((booking: Booking) => (
                      <Card key={booking.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">Field #{booking.fieldId}</h4>
                              <p className="text-sm text-gray-600 flex items-center mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                Booking for {formatDate(booking.date)}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center mt-1">
                                <Clock className="h-4 w-4 mr-1" />
                                {booking.startTime} - {booking.endTime}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">${booking.totalAmount}</div>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-between items-center">
                            {booking.status === 'confirmed' || booking.status === 'pending' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={cancelBookingMutation.isPending}
                                className="text-red-600 hover:text-red-700"
                              >
                                Cancel Booking
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Book Again
                              </Button>
                            )}
                            {booking.status === 'completed' && (
                              <Button variant="ghost" size="sm">
                                Leave Review
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Favorites Tab */}
              <TabsContent value="favorites" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Favorite Venues</h3>
                  {favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
                      <p className="text-gray-600">Heart venues you love to save them here!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favorites.map((venue) => (
                        <Card key={venue.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <h4 className="font-medium">{venue.name}</h4>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {venue.address}, {venue.city}
                            </p>
                            <div className="flex items-center mt-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="ml-1 text-sm">{Number(venue.rating).toFixed(1)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Profile Settings Tab */}
              <TabsContent value="profile" className="mt-6">
                <div className="max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
                  
                  {isEditing ? (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...form.register('firstName')}
                          placeholder="Enter your first name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...form.register('lastName')}
                          placeholder="Enter your last name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          {...form.register('phone')}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button 
                          type="submit" 
                          disabled={updateProfileMutation.isPending}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <p className="text-gray-900">{user?.email}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Username</Label>
                        <p className="text-gray-900">{user?.username}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Name</Label>
                        <p className="text-gray-900">
                          {user?.firstName && user?.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : 'Not provided'
                          }
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Phone</Label>
                        <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Account Type</Label>
                        <p className="text-gray-900 capitalize">{user?.role?.replace('_', ' ')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
