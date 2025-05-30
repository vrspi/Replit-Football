import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { authService } from "./lib/auth";
import { useQuery } from "@tanstack/react-query";

import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import VenueSearch from "@/pages/venue-search";
import Auth from "@/pages/auth";
import VenueDashboard from "@/pages/venue-dashboard";
import PlayerProfile from "@/pages/player-profile";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

// Protected Route component
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: authService.isAuthenticated(),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!authService.isAuthenticated() || !user) {
    window.location.href = '/auth';
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={VenueSearch} />
        <Route path="/auth" component={Auth} />
        
        {/* Protected Routes */}
        <Route path="/profile">
          <ProtectedRoute>
            <PlayerProfile />
          </ProtectedRoute>
        </Route>
        
        <Route path="/bookings">
          <ProtectedRoute>
            <PlayerProfile />
          </ProtectedRoute>
        </Route>
        
        <Route path="/venue-dashboard">
          <ProtectedRoute requiredRole="venue_owner">
            <VenueDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/admin-dashboard">
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth service and check for existing token
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          await authService.getCurrentUser();
        } catch (error) {
          console.error('Failed to initialize user:', error);
          authService.logout();
        }
      }
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing PlayHub...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
