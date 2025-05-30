import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { authService } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User, LogOut, Settings, Calendar } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: authService.isAuthenticated(),
    retry: false,
  });

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <i className="fas fa-futbol text-blue-500 text-2xl"></i>
              <span className="text-xl font-bold text-gray-900">PlayHub</span>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/search" 
                className={`font-medium transition-colors ${
                  location === '/search' 
                    ? 'text-blue-500' 
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                Find Venues
              </Link>
              {user?.role === 'venue_owner' && (
                <Link 
                  href="/venue-dashboard" 
                  className={`font-medium transition-colors ${
                    location === '/venue-dashboard' 
                      ? 'text-blue-500' 
                      : 'text-gray-600 hover:text-blue-500'
                  }`}
                >
                  My Venues
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link 
                  href="/admin-dashboard" 
                  className={`font-medium transition-colors ${
                    location === '/admin-dashboard' 
                      ? 'text-blue-500' 
                      : 'text-gray-600 hover:text-blue-500'
                  }`}
                >
                  Admin
                </Link>
              )}
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-500 font-medium transition-colors">
                How it Works
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="hidden md:inline">{user.username}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="w-full flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/bookings" className="w-full flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          My Bookings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="w-full flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Link href="/auth">
                      <Button variant="ghost">Sign In</Button>
                    </Link>
                    <Link href="/auth?mode=register">
                      <Button className="bg-blue-500 hover:bg-blue-600">Get Started</Button>
                    </Link>
                  </>
                )}
              </>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link href="/search" className="text-gray-600 hover:text-blue-500 font-medium py-2">
                Find Venues
              </Link>
              {user?.role === 'venue_owner' && (
                <Link href="/venue-dashboard" className="text-gray-600 hover:text-blue-500 font-medium py-2">
                  My Venues
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin-dashboard" className="text-gray-600 hover:text-blue-500 font-medium py-2">
                  Admin
                </Link>
              )}
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-500 font-medium py-2">
                How it Works
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
