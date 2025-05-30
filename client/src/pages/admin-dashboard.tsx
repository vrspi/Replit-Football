import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Building2, 
  CalendarCheck, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp,
  Check,
  X,
  Eye,
  BarChart3,
  Activity,
  Shield
} from "lucide-react";
import { authService } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Venue, PlatformStats } from "@/lib/types";

export default function AdminDashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/admin/stats', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const { data: pendingVenues = [], isLoading: venuesLoading } = useQuery({
    queryKey: ['/api/dashboard/admin/venues/pending'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/admin/venues/pending', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch pending venues');
      return response.json();
    },
  });

  const { data: allVenues = [] } = useQuery({
    queryKey: ['/api/venues', { status: 'all' }],
    queryFn: async () => {
      const response = await fetch('/api/venues?status=approved', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch venues');
      return response.json();
    },
  });

  const venueActionMutation = useMutation({
    mutationFn: async ({ venueId, action }: { venueId: number; action: 'approve' | 'reject' }) => {
      const status = action === 'approve' ? 'approved' : 'rejected';
      return apiRequest('PUT', `/api/venues/${venueId}`, { status });
    },
    onSuccess: (_, { action }) => {
      toast({
        title: action === 'approve' ? "Venue Approved" : "Venue Rejected",
        description: `The venue has been ${action}d successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/admin/venues/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to update venue status.",
        variant: "destructive",
      });
    },
  });

  const handleVenueAction = (venueId: number, action: 'approve' | 'reject') => {
    const confirmMessage = action === 'approve' 
      ? 'Are you sure you want to approve this venue?' 
      : 'Are you sure you want to reject this venue?';
    
    if (window.confirm(confirmMessage)) {
      venueActionMutation.mutate({ venueId, action });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock system health data (would come from monitoring services in production)
  const systemHealth = {
    apiResponseTime: '145ms',
    databasePerformance: 'Good',
    activeSessions: 1247,
    errorRate: '0.02%',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform management and monitoring</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : (stats?.totalUsers || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <Building2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Venues</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : (stats?.activeVenues || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full mr-4">
                  <CalendarCheck className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : (stats?.totalBookings || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full mr-4">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : `$${(stats?.platformRevenue || 0).toLocaleString()}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full mr-4">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : (stats?.pendingReviews || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="venues" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="venues" className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Venue Management
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              System Health
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Venue Management Tab */}
          <TabsContent value="venues" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Venue Verification Queue */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Venue Verification Queue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {venuesLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : pendingVenues.length === 0 ? (
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No pending venues to review</p>
                      </div>
                    ) : (
                      pendingVenues.map((venue: Venue) => (
                        <div key={venue.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium">{venue.name}</h3>
                              <p className="text-sm text-gray-600">{venue.address}, {venue.city}</p>
                              <p className="text-xs text-gray-500">
                                Submitted {formatDate(venue.createdAt || '')}
                              </p>
                            </div>
                            <Badge className={getStatusColor(venue.status)}>
                              {venue.status.charAt(0).toUpperCase() + venue.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleVenueAction(venue.id, 'approve')}
                              disabled={venueActionMutation.isPending}
                              className="flex-1 bg-green-500 hover:bg-green-600"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleVenueAction(venue.id, 'reject')}
                              disabled={venueActionMutation.isPending}
                              className="flex-1"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button size="sm" variant="outline" className="px-3">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* All Venues List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Venues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {allVenues.map((venue: Venue) => (
                      <div key={venue.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium">{venue.name}</h4>
                          <p className="text-sm text-gray-600">{venue.city}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(venue.status)}>
                            {venue.status}
                          </Badge>
                          <div className="text-sm text-gray-500 mt-1">
                            {Number(venue.rating).toFixed(1)} ★ ({venue.reviewCount})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="monitoring" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  System Health Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">API Response Time</span>
                      <div className="flex items-center">
                        <span className="text-sm text-green-600 mr-2">{systemHealth.apiResponseTime}</span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div className="w-3/4 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Database Performance</span>
                      <div className="flex items-center">
                        <span className="text-sm text-green-600 mr-2">{systemHealth.databasePerformance}</span>
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Sessions</span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">{systemHealth.activeSessions.toLocaleString()}</span>
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Error Rate</span>
                      <div className="flex items-center">
                        <span className="text-sm text-green-600 mr-2">{systemHealth.errorRate}</span>
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Activity className="h-4 w-4 mr-2" />
                        View Detailed Logs
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Performance Metrics
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Alert Configuration
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Growth Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">User Growth (30 days)</span>
                      <span className="text-sm font-semibold text-green-600">+15.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Venue Growth (30 days)</span>
                      <span className="text-sm font-semibold text-green-600">+8.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Booking Growth (30 days)</span>
                      <span className="text-sm font-semibold text-green-600">+23.1%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue Growth (30 days)</span>
                      <span className="text-sm font-semibold text-green-600">+18.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Most Popular Sport</p>
                      <p className="font-semibold">Football (62% of bookings)</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Peak Booking Hours</p>
                      <p className="font-semibold">6:00 PM - 9:00 PM</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Booking Value</p>
                      <p className="font-semibold">$38.50</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customer Satisfaction</p>
                      <p className="font-semibold">4.7/5 ⭐</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
