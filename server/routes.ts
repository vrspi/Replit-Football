import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertVenueSchema, insertFieldSchema, insertBookingSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  console.log('authenticateToken middleware called');
  console.log('Headers:', JSON.stringify(req.headers));
  
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token extracted:', token ? 'Token present' : 'No token');

  if (!token) {
    console.log('No token provided, returning 401');
    return res.status(401).json({ message: 'No authentication token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    console.log('Token verified successfully for user:', user.id);
    req.user = user;
    next();
  });
};

// Middleware to check user role
const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.sendStatus(403);
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log('Registration request body:', JSON.stringify(req.body));
      console.log('Request headers:', JSON.stringify(req.headers));
      
      // Check if request body is empty
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Empty request body" });
      }

      // Create a user object with default role if missing
      const registrationData = {
        ...req.body,
        role: req.body.role || 'player' // Default to player if role is not provided
      };
      
      console.log('Processed registration data:', JSON.stringify(registrationData));

      try {
        // Manually validate required fields before schema validation
        if (!registrationData.email) {
          return res.status(400).json({ message: "Email is required" });
        }
        
        if (!registrationData.username) {
          return res.status(400).json({ message: "Username is required" });
        }
        
        if (!registrationData.password) {
          return res.status(400).json({ message: "Password is required" });
        }
        
        const userData = insertUserSchema.parse(registrationData);
        console.log('Validated user data:', JSON.stringify(userData));
        
        // Check if user already exists
        const existingUser = await storage.getUserByEmail(userData.email);
        if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
        }
        
        // Check if username is taken
        const existingUsername = await storage.getUserByUsername(userData.username);
        if (existingUsername) {
          return res.status(400).json({ message: "Username already taken" });
        }
        
        const user = await storage.createUser(userData);
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
        
        res.json({ 
          user: { ...user, password: undefined }, 
          token 
        });
      } catch (validationError: any) {
        console.error('Validation error:', validationError);
        return res.status(400).json({ 
          message: "Validation error", 
          details: validationError.errors || validationError.message 
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    console.log('GET /api/auth/me called, user ID from token:', req.user?.id);
    
    try {
      console.log('Looking up user in database, ID:', req.user.id);
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        console.log('User not found in database, ID:', req.user.id);
        return res.status(404).json({ message: "User not found in database" });
      }
      
      console.log('User found:', user.id, user.email);
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      console.error('Error in /api/auth/me:', error.message);
      res.status(400).json({ message: error.message });
    }
  });

  // Venue routes
  app.get("/api/venues", async (req, res) => {
    try {
      const { city, status, limit = 20, offset = 0 } = req.query;
      const venues = await storage.getVenues({
        city: city as string,
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(venues);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/venues/search", async (req, res) => {
    try {
      const {
        sportType,
        city,
        date,
        latitude,
        longitude,
        radius,
        priceMin,
        priceMax,
        amenities
      } = req.query;
      
      const venues = await storage.searchVenues({
        sportType: sportType as string,
        city: city as string,
        date: date as string,
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
        radius: radius ? parseFloat(radius as string) : undefined,
        priceMin: priceMin ? parseFloat(priceMin as string) : undefined,
        priceMax: priceMax ? parseFloat(priceMax as string) : undefined,
        amenities: amenities ? (amenities as string).split(',') : undefined,
      });
      
      res.json(venues);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/venues/:id", async (req, res) => {
    try {
      const venue = await storage.getVenue(parseInt(req.params.id));
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      res.json(venue);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/venues", authenticateToken, requireRole(['venue_owner']), async (req: any, res) => {
    try {
      const venueData = insertVenueSchema.parse({
        ...req.body,
        ownerId: req.user.id
      });
      
      const venue = await storage.createVenue(venueData);
      res.json(venue);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/venues/:id", authenticateToken, async (req: any, res) => {
    try {
      const venueId = parseInt(req.params.id);
      const venue = await storage.getVenue(venueId);
      
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      
      // Check if user owns venue or is admin
      if (venue.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedVenue = await storage.updateVenue(venueId, req.body);
      res.json(updatedVenue);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Field routes
  app.get("/api/venues/:venueId/fields", async (req, res) => {
    try {
      const fields = await storage.getFieldsByVenue(parseInt(req.params.venueId));
      res.json(fields);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/venues/:venueId/fields", authenticateToken, async (req: any, res) => {
    try {
      const venueId = parseInt(req.params.venueId);
      const venue = await storage.getVenue(venueId);
      
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      
      if (venue.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const fieldData = insertFieldSchema.parse({
        ...req.body,
        venueId
      });
      
      const field = await storage.createField(fieldData);
      res.json(field);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Time slots routes
  app.get("/api/fields/:fieldId/slots", async (req, res) => {
    try {
      const { date } = req.query;
      const slots = await storage.getTimeSlots(parseInt(req.params.fieldId), date as string);
      res.json(slots);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Booking routes
  app.get("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const bookings = await storage.getBookingsByUser(req.user.id);
      res.json(bookings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if time slot is available
      const timeSlot = await storage.getTimeSlot(bookingData.timeSlotId);
      if (!timeSlot || !timeSlot.isAvailable) {
        return res.status(400).json({ message: "Time slot not available" });
      }
      
      const booking = await storage.createBooking(bookingData);
      
      // Mark time slot as unavailable
      await storage.updateTimeSlot(bookingData.timeSlotId, { isAvailable: false });
      
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/bookings/:id", authenticateToken, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedBooking = await storage.updateBooking(bookingId, req.body);
      res.json(updatedBooking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/venue/:venueId/stats", authenticateToken, async (req: any, res) => {
    try {
      const venueId = parseInt(req.params.venueId);
      const venue = await storage.getVenue(venueId);
      
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      
      if (venue.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const stats = await storage.getVenueStats(venueId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/admin/stats", authenticateToken, requireRole(['admin']), async (req: any, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/admin/venues/pending", authenticateToken, requireRole(['admin']), async (req: any, res) => {
    try {
      const venues = await storage.getVenues({ status: 'pending' });
      res.json(venues);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
