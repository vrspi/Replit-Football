import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, MapPin, Calendar, Star, Users, Shield, Clock, ChevronRight,
  Smartphone, Sparkles, Award, Play, Download, Instagram, Twitter, 
  Facebook, Mail, Apple, Globe, Check, Trophy, Zap, Heart, Menu, X
} from "lucide-react";

export default function Home() {
  const [searchForm, setSearchForm] = useState({
    sportType: '',
    location: '',
    date: '',
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchForm.sportType) params.set('sportType', searchForm.sportType);
    if (searchForm.location) params.set('city', searchForm.location);
    if (searchForm.date) params.set('date', searchForm.date);
    window.location.href = `/search?${params.toString()}`;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      
      const hero = document.getElementById('hero-bg');
      if (hero) {
        hero.style.setProperty('--mouse-x', `${x}%`);
        hero.style.setProperty('--mouse-y', `${y}%`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Enhanced Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-xl border-b border-yellow-500/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center mr-3">
                <Sparkles className="h-6 w-6 text-black" />
              </div>
              <span className="text-2xl font-bold text-white">PlayHub</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/venues" className="text-white hover:text-yellow-400 transition-colors font-medium">
                Find Venues
              </Link>
              <Link href="/my-venues" className="text-white hover:text-yellow-400 transition-colors font-medium">
                My Venues
              </Link>
              <Link href="/how-it-works" className="text-white hover:text-yellow-400 transition-colors font-medium">
                How it Works
              </Link>
              <Link href="/pricing" className="text-white hover:text-yellow-400 transition-colors font-medium">
                Pricing
              </Link>
              <div className="flex items-center space-x-4 ml-8">
                <Link href="/login">
                  <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 font-bold">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-yellow-400"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-black/98 backdrop-blur-xl border-b border-yellow-500/20">
              <div className="px-4 py-6 space-y-4">
                <Link href="/venues" className="block text-white hover:text-yellow-400 transition-colors font-medium py-2">
                  Find Venues
                </Link>
                <Link href="/my-venues" className="block text-white hover:text-yellow-400 transition-colors font-medium py-2">
                  My Venues
                </Link>
                <Link href="/how-it-works" className="block text-white hover:text-yellow-400 transition-colors font-medium py-2">
                  How it Works
                </Link>
                <Link href="/pricing" className="block text-white hover:text-yellow-400 transition-colors font-medium py-2">
                  Pricing
                </Link>
                <div className="pt-4 space-y-3">
                  <Link href="/login">
                    <Button variant="outline" className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 font-bold">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero-bg"
        className="relative min-h-screen flex items-center overflow-hidden bg-black pt-16"
        style={{
          background: `
            radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(251, 191, 36, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)
          `
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/3 w-72 h-72 bg-yellow-400/8 rounded-full blur-3xl animate-pulse delay-2000"></div>
          
          {/* SVG Pattern Overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#fbbf24" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Floating lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <line x1="0%" y1="20%" x2="100%" y2="80%" stroke="url(#goldGradient)" strokeWidth="2">
              <animate attributeName="opacity" values="0.1;0.3;0.1" dur="4s" repeatCount="indefinite" />
            </line>
            <line x1="100%" y1="30%" x2="0%" y2="70%" stroke="url(#goldGradient2)" strokeWidth="2">
              <animate attributeName="opacity" values="0.1;0.25;0.1" dur="5s" repeatCount="indefinite" />
            </line>
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Hero Text */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-400/20 backdrop-blur-xl rounded-full text-yellow-400 text-sm font-semibold mb-6 border border-yellow-400/30">
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                #1 Sports Venue Platform
                <div className="ml-3 px-2 py-1 bg-yellow-400 text-black rounded-full text-xs font-bold">
                  NEW
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
                <span className="text-white">Book Sports</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  Venues
                </span>
                <br />
                <span className="text-white text-3xl lg:text-4xl font-bold">
                  Anytime, Anywhere
                </span>
              </h1>
              
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <p className="text-lg lg:text-xl text-white leading-relaxed">
                  Connect with premium sports facilities and book your perfect playing time in minutes. 
                  <span className="text-yellow-400 font-semibold"> Join the future of sports venue booking.</span>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start mb-8">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 rounded-full font-bold shadow-2xl hover:scale-105"
                >
                  Get Started Free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Link href="#how-it-works" className="text-lg font-semibold text-white flex items-center hover:text-yellow-400 transition-all duration-300 group">
                  <div className="p-3 bg-yellow-400/20 rounded-full mr-3 group-hover:bg-yellow-400/30 transition-all">
                    <Play className="h-5 w-5" />
                  </div>
                  How it works
                </Link>
              </div>
              
              {/* Social Proof */}
              <div className="flex items-center justify-center lg:justify-start bg-black/40 backdrop-blur-sm rounded-xl p-4">
                <div className="flex -space-x-2 mr-4">
                  {[
                    'bg-gradient-to-r from-yellow-400 to-yellow-600',
                    'bg-gradient-to-r from-yellow-500 to-yellow-700',
                    'bg-gradient-to-r from-yellow-300 to-yellow-500',
                    'bg-gradient-to-r from-yellow-600 to-yellow-800',
                    'bg-gradient-to-r from-yellow-400 to-yellow-700'
                  ].map((gradient, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-black ${gradient} flex items-center justify-center text-black font-bold text-sm`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-white">
                  <div className="font-bold">5,000+ Active Users</div>
                  <div className="text-yellow-400 text-sm">across 100+ cities worldwide</div>
                </div>
              </div>
            </div>

            {/* Enhanced Search Form */}
            <div className="lg:w-1/2 w-full max-w-md">
              <Card className="backdrop-blur-xl bg-black/80 border border-yellow-400/30 shadow-2xl rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Find Your Perfect Venue</h3>
                    <p className="text-yellow-400/80 text-sm">Search verified sports facilities</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-yellow-400 mb-2">Sport Type</label>
                      <Select value={searchForm.sportType} onValueChange={(value) => setSearchForm(prev => ({ ...prev, sportType: value }))}>
                        <SelectTrigger className="h-12 bg-black/60 border-yellow-400/40 text-white backdrop-blur-sm rounded-lg hover:border-yellow-400 transition-all">
                          <SelectValue placeholder="Select your sport" className="text-white" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/95 backdrop-blur-xl rounded-lg border-yellow-400/30">
                          <SelectItem value="football" className="text-white hover:bg-yellow-400/20 py-2">⚽ Football</SelectItem>
                          <SelectItem value="basketball" className="text-white hover:bg-yellow-400/20 py-2">🏀 Basketball</SelectItem>
                          <SelectItem value="tennis" className="text-white hover:bg-yellow-400/20 py-2">🎾 Tennis</SelectItem>
                          <SelectItem value="badminton" className="text-white hover:bg-yellow-400/20 py-2">🏸 Badminton</SelectItem>
                          <SelectItem value="swimming" className="text-white hover:bg-yellow-400/20 py-2">🏊 Swimming</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="relative">
                      <label className="block text-sm font-semibold text-yellow-400 mb-2">Location</label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="City or venue name"
                          value={searchForm.location}
                          onChange={(e) => setSearchForm(prev => ({ ...prev, location: e.target.value }))}
                          className="h-12 pl-10 bg-black/60 border-yellow-400/40 text-white placeholder-white/40 backdrop-blur-sm rounded-lg hover:border-yellow-400 transition-all"
                        />
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-yellow-400/70" />
                      </div>
                    </div>
                    
                    <div className="relative">
                      <label className="block text-sm font-semibold text-yellow-400 mb-2">Date</label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={searchForm.date}
                          onChange={(e) => setSearchForm(prev => ({ ...prev, date: e.target.value }))}
                          className="h-12 pl-10 bg-black/60 border-yellow-400/40 text-white backdrop-blur-sm rounded-lg hover:border-yellow-400 transition-all"
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-yellow-400/70" />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSearch}
                      className="w-full h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold rounded-lg shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Search Venues
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900" id="how-it-works">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-400/20 rounded-full text-yellow-400 font-semibold mb-6 border border-yellow-400/30">
              <Zap className="h-4 w-4 mr-2" />
              How It Works
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Simple. Fast. Secure.
            </h2>
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 inline-block">
              <p className="text-lg text-white max-w-2xl">
                Book your perfect sports venue in three easy steps
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: "Find Your Venue",
                description: "Search verified sports facilities by location, sport type, and availability.",
                step: "01"
              },
              {
                icon: Calendar,
                title: "Book Instantly",
                description: "Check real-time availability and book your slot with secure payment.",
                step: "02"
              },
              {
                icon: Users,
                title: "Play & Connect",
                description: "Show up and play! Connect with other players and build community.",
                step: "03"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:scale-105 transition-all duration-300 bg-black/60 border border-yellow-400/30 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <feature.icon className="h-8 w-8 text-black" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold">
                      {feature.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <div className="bg-black/40 rounded-lg p-3">
                    <p className="text-white/80 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-yellow-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              Trusted by Sports Enthusiasts Worldwide
            </h2>
            <p className="text-lg text-black/80">Join thousands of players who found their perfect venues</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { number: "1,500+", label: "Active Venues", icon: "🏟️" },
              { number: "25K+", label: "Happy Players", icon: "👥" },
              { number: "50K+", label: "Bookings Made", icon: "📅" },
              { number: "4.9", label: "Average Rating", icon: "⭐" }
            ].map((stat, index) => (
              <div key={index} className="group bg-black/10 backdrop-blur-sm rounded-xl p-4 hover:bg-black/20 transition-all">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl lg:text-4xl font-bold text-black mb-1 group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-black/80 font-medium text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-yellow-400/20 rounded-full text-yellow-400 font-semibold mb-6 border border-yellow-400/30">
                <Award className="h-4 w-4 mr-2" />
                Why Choose PlayHub
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                The Future of Sports Venue Booking
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Shield,
                    title: "100% Verified Venues",
                    description: "All venues are thoroughly verified and meet our strict quality standards."
                  },
                  {
                    icon: Clock,
                    title: "Real-time Availability",
                    description: "See live availability and book instantly without waiting for confirmations."
                  },
                  {
                    icon: Star,
                    title: "Best Price Guarantee",
                    description: "Compare prices and find the most competitive rates available."
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4 group bg-black/40 backdrop-blur-sm rounded-xl p-4 hover:bg-black/60 transition-all">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <benefit.icon className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-white">{benefit.title}</h3>
                      <p className="text-white/80 text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-2xl blur-2xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                alt="Modern sports facility" 
                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover border border-yellow-400/30"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-yellow-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cta-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="2" fill="black"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-pattern)" />
          </svg>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-black">
            Ready to Start Playing?
          </h2>
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 mb-8 inline-block">
            <p className="text-lg lg:text-xl text-black max-w-2xl leading-relaxed">
              Join thousands of players who have found their perfect venues through PlayHub. 
              Start your sports journey today!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link href="/search">
              <Button size="lg" className="px-8 py-6 bg-black text-yellow-400 hover:bg-gray-900 font-bold text-lg rounded-full shadow-2xl hover:scale-105 transition-all">
                Find Venues Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth?mode=register&role=venue_owner">
              <Button size="lg" variant="outline" className="px-8 py-6 text-black border-2 border-black hover:bg-black hover:text-yellow-400 font-bold text-lg rounded-full transition-all">
                List Your Venue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-black text-white relative overflow-hidden border-t border-yellow-400/20">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-yellow-600/5"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Footer Content */}
          <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center mr-3">
                  <Sparkles className="h-6 w-6 text-black" />
                </div>
                <span className="text-2xl font-bold">PlayHub</span>
              </div>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 mb-6">
                <p className="text-white/80 leading-relaxed text-sm">
                  The future of sports venue booking. Connect, play, and grow your sports community with ease.
                </p>
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-3">
                {[
                  { icon: Facebook, href: "#", label: "Facebook" },
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Instagram, href: "#", label: "Instagram" },
                  { icon: Mail, href: "#", label: "Email" }
                ].map((social, index) => (
                  <a key={index} href={social.href} className="p-3 bg-yellow-400/20 rounded-lg hover:bg-yellow-400 hover:text-black transition-all hover:scale-110 group" title={social.label}>
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-yellow-400">Quick Links</h3>
              <ul className="space-y-3">
                {[
                  { name: "Find Venues", href: "/search" },
                  { name: "How it Works", href: "#how-it-works" },
                  { name: "Pricing", href: "/pricing" },
                  { name: "About Us", href: "/about" },
                  { name: "Contact", href: "/contact" }
                ].map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-white/80 hover:text-yellow-400 transition-colors flex items-center group text-sm">
                      <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-yellow-400">Support</h3>
              <ul className="space-y-3">
                {[
                  { name: "Help Center", href: "/help" },
                  { name: "Safety Guidelines", href: "/safety" },
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Terms of Service", href: "/terms" },
                  { name: "Venue Owners", href: "/venue-owners" }
                ].map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-white/80 hover:text-yellow-400 transition-colors flex items-center group text-sm">
                      <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile Apps */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-yellow-400">Download Our Apps</h3>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 mb-6">
                <p className="text-white/80 text-sm">Get the PlayHub mobile app for the ultimate booking experience</p>
              </div>
              
              <div className="space-y-3">
                {/* iOS App */}
                <a href="#" className="flex items-center p-3 bg-yellow-400/20 rounded-lg hover:bg-yellow-400/30 transition-all group hover:scale-105 border border-yellow-400/30">
                  <Apple className="h-6 w-6 mr-3 text-yellow-400" />
                  <div>
                    <div className="text-xs text-white/60">Download on the</div>
                    <div className="font-bold text-white text-sm">App Store</div>
                  </div>
                </a>
                
                {/* Android App */}
                <a href="#" className="flex items-center p-3 bg-yellow-400/20 rounded-lg hover:bg-yellow-400/30 transition-all group hover:scale-105 border border-yellow-400/30">
                  <div className="h-6 w-6 mr-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-black" />
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Get it on</div>
                    <div className="font-bold text-white text-sm">Google Play</div>
                  </div>
                </a>
              </div>
              
              {/* QR Code */}
              <div className="mt-4 p-3 bg-yellow-400 rounded-lg">
                <div className="w-16 h-16 bg-black rounded-lg mx-auto flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-1">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-black mt-2 text-center font-medium">Scan to download</p>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-yellow-400/20 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-white/80 mb-4 md:mb-0 text-sm">
                © 2024 PlayHub. All rights reserved. Made with ❤️ for sports enthusiasts worldwide.
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-white/80 text-sm">
                  <Globe className="h-4 w-4 mr-2 text-yellow-400" />
                  Available in 50+ countries
                </div>
                <div className="flex items-center text-white/80 text-sm">
                  <Shield className="h-4 w-4 mr-2 text-yellow-400" />
                  SSL Secured
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}