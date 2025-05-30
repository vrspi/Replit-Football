import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Calendar, Star, Users, Shield, Clock } from "lucide-react";

export default function Home() {
  const [searchForm, setSearchForm] = useState({
    sportType: '',
    location: '',
    date: '',
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchForm.sportType) params.set('sportType', searchForm.sportType);
    if (searchForm.location) params.set('city', searchForm.location);
    if (searchForm.date) params.set('date', searchForm.date);
    
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-500 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Book Sports Venues<br />Anytime, Anywhere
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Connect with local sports facilities and book your perfect playing time in minutes
            </p>
          </div>
          
          {/* Search Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-material-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sport Type</label>
                <Select value={searchForm.sportType} onValueChange={(value) => setSearchForm(prev => ({ ...prev, sportType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                    <SelectItem value="badminton">Badminton</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="City or venue name"
                    value={searchForm.location}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, location: e.target.value }))}
                    className="pl-10"
                  />
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={searchForm.date}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, date: e.target.value }))}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  className="w-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center space-x-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Search Venues</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How PlayHub Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, fast, and secure booking process for all your sports venue needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Find Your Perfect Venue</h3>
                <p className="text-gray-600">
                  Search through hundreds of verified sports facilities by location, sport type, and availability.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Book Instantly</h3>
                <p className="text-gray-600">
                  Check real-time availability and book your slot instantly with our secure payment system.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Play & Connect</h3>
                <p className="text-gray-600">
                  Show up and play! Connect with other players and build your local sports community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Sports Enthusiasts
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-500 mb-2">500+</div>
              <div className="text-gray-600">Active Venues</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-500 mb-2">15K+</div>
              <div className="text-gray-600">Happy Players</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">25K+</div>
              <div className="text-gray-600">Bookings Made</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-500 mb-2">4.8</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose PlayHub?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Verified Venues</h3>
                    <p className="text-gray-600">All venues are verified and meet our quality standards for safety and facilities.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Real-time Availability</h3>
                    <p className="text-gray-600">See live availability and book instantly without waiting for confirmations.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Best Prices</h3>
                    <p className="text-gray-600">Compare prices across venues and find the best deals for your budget.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                alt="Sports facility" 
                className="rounded-2xl shadow-material-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Playing?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of players who have found their perfect venues through PlayHub
          </p>
          <div className="space-x-4">
            <Link href="/search">
              <Button size="lg" className="bg-white text-blue-500 hover:bg-gray-100">
                Find Venues Now
              </Button>
            </Link>
            <Link href="/auth?mode=register&role=venue_owner">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-500">
                List Your Venue
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
