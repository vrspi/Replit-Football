import { apiRequest } from "./queryClient";
import { config } from "../config";

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'player' | 'venue_owner' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: 'player' | 'venue_owner';
}

class AuthService {
  private token: string | null = null;
  private user: AuthUser | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    const data = await response.json();
    
    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('auth_token', data.token);
    
    return data;
  }

  async register(userData: RegisterData): Promise<{ user: AuthUser; token: string }> {
    console.log('Register request data:', JSON.stringify(userData));
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const data = await response.json();
      console.log('Registration response:', data);
      
      if (data.token) {
        console.log('Token received, setting auth token');
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('auth_token', data.token);
        
        // Log the current state after registration
        console.log('Auth state after registration:', {
          token: this.token ? 'Token exists' : 'No token',
          user: this.user,
          localStorageToken: localStorage.getItem('auth_token') ? 'Token in localStorage' : 'No token in localStorage'
        });
      } else {
        console.error('No token received in registration response');
      }
      
      return data;
    } catch (error) {
      console.error('Registration request failed:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    // Try to load token from localStorage if not already in memory
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
      console.log('Loading token from localStorage:', this.token ? 'Token found' : 'No token found');
    }

    if (!this.token) {
      console.log('No auth token available, cannot get current user');
      return null;
    }

    try {
      console.log('Making request to /api/auth/me with token');
      const response = await fetch(`${config.apiBaseUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        credentials: 'include',
      });

      console.log('Auth response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Auth error:', response.status, errorText);
        if (response.status === 401) {
          console.log('Unauthorized - clearing invalid token');
          this.logout();
        }
        return null;
      }

      this.user = await response.json();
      console.log('Current user loaded:', this.user);
      return this.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      this.logout();
      return null;
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): AuthUser | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  isVenueOwner(): boolean {
    return this.user?.role === 'venue_owner';
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }
}

export const authService = new AuthService();
