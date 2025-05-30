export interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'player' | 'venue_owner' | 'admin';
  isEmailVerified: boolean;
}

export interface Venue {
  id: number;
  ownerId: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  latitude?: string;
  longitude?: string;
  phone?: string;
  email?: string;
  website?: string;
  amenities: string[];
  images: string[];
  verificationDocs: string[];
  status: 'pending' | 'approved' | 'rejected';
  rating: string;
  reviewCount: number;
}

export interface Field {
  id: number;
  venueId: number;
  name: string;
  description?: string;
  sportType: string;
  capacity?: number;
  surface?: string;
  length?: string;
  width?: string;
  status: 'active' | 'inactive' | 'maintenance';
  hourlyRate: string;
  peakHourRate?: string;
  amenities: string[];
  images: string[];
}

export interface TimeSlot {
  id: number;
  fieldId: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isPeakHour: boolean;
  price: string;
  adminBlocked: boolean;
}

export interface Booking {
  id: number;
  userId: number;
  fieldId: number;
  timeSlotId: number;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentIntentId?: string;
  cancellationReason?: string;
  notes?: string;
}

export interface SearchFilters {
  sportType?: string;
  city?: string;
  date?: string;
  priceMin?: number;
  priceMax?: number;
  amenities?: string[];
  distance?: number;
}

export interface VenueStats {
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  activeFields: number;
}

export interface PlatformStats {
  totalUsers: number;
  activeVenues: number;
  totalBookings: number;
  platformRevenue: number;
  pendingReviews: number;
}
