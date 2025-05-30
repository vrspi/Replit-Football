import { apiRequest } from "./queryClient";

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
    const response = await apiRequest('POST', '/api/auth/register', userData);
    const data = await response.json();
    
    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('auth_token', data.token);
    
    return data;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      this.user = await response.json();
      return this.user;
    } catch (error) {
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
