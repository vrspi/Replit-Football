import { 
  users, venues, fields, timeSlots, bookings, reviews,
  type User, type InsertUser, type Venue, type InsertVenue, 
  type Field, type InsertField, type TimeSlot, type InsertTimeSlot,
  type Booking, type InsertBooking, type Review, type InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql, desc, asc, like, inArray } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Venue operations
  getVenue(id: number): Promise<Venue | undefined>;
  getVenues(filters?: {
    status?: string;
    city?: string;
    ownerId?: number;
    limit?: number;
    offset?: number;
  }): Promise<Venue[]>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  updateVenue(id: number, updates: Partial<Venue>): Promise<Venue>;
  
  // Field operations
  getField(id: number): Promise<Field | undefined>;
  getFieldsByVenue(venueId: number): Promise<Field[]>;
  createField(field: InsertField): Promise<Field>;
  updateField(id: number, updates: Partial<Field>): Promise<Field>;
  
  // Time slot operations
  getTimeSlot(id: number): Promise<TimeSlot | undefined>;
  getTimeSlots(fieldId: number, date: string): Promise<TimeSlot[]>;
  createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;
  updateTimeSlot(id: number, updates: Partial<TimeSlot>): Promise<TimeSlot>;
  
  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByVenue(venueId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, updates: Partial<Booking>): Promise<Booking>;
  
  // Search operations
  searchVenues(params: {
    sportType?: string;
    city?: string;
    date?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    priceMin?: number;
    priceMax?: number;
    amenities?: string[];
  }): Promise<Venue[]>;
  
  // Analytics
  getVenueStats(venueId: number): Promise<{
    totalBookings: number;
    totalRevenue: number;
    occupancyRate: number;
    activeFields: number;
  }>;
  
  getPlatformStats(): Promise<{
    totalUsers: number;
    activeVenues: number;
    totalBookings: number;
    platformRevenue: number;
    pendingReviews: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getVenue(id: number): Promise<Venue | undefined> {
    const [venue] = await db.select().from(venues).where(eq(venues.id, id));
    return venue || undefined;
  }

  async getVenues(filters: {
    status?: string;
    city?: string;
    ownerId?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<Venue[]> {
    let query = db.select().from(venues);
    
    const conditions = [];
    if (filters.status) conditions.push(eq(venues.status, filters.status as any));
    if (filters.city) conditions.push(like(venues.city, `%${filters.city}%`));
    if (filters.ownerId) conditions.push(eq(venues.ownerId, filters.ownerId));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(venues.rating));
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }

  async createVenue(venue: InsertVenue): Promise<Venue> {
    const [newVenue] = await db
      .insert(venues)
      .values(venue)
      .returning();
    return newVenue;
  }

  async updateVenue(id: number, updates: Partial<Venue>): Promise<Venue> {
    const [venue] = await db
      .update(venues)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(venues.id, id))
      .returning();
    return venue;
  }

  async getField(id: number): Promise<Field | undefined> {
    const [field] = await db.select().from(fields).where(eq(fields.id, id));
    return field || undefined;
  }

  async getFieldsByVenue(venueId: number): Promise<Field[]> {
    return await db.select().from(fields).where(eq(fields.venueId, venueId));
  }

  async createField(field: InsertField): Promise<Field> {
    const [newField] = await db
      .insert(fields)
      .values(field)
      .returning();
    return newField;
  }

  async updateField(id: number, updates: Partial<Field>): Promise<Field> {
    const [field] = await db
      .update(fields)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fields.id, id))
      .returning();
    return field;
  }

  async getTimeSlot(id: number): Promise<TimeSlot | undefined> {
    const [timeSlot] = await db.select().from(timeSlots).where(eq(timeSlots.id, id));
    return timeSlot || undefined;
  }

  async getTimeSlots(fieldId: number, date: string): Promise<TimeSlot[]> {
    return await db
      .select()
      .from(timeSlots)
      .where(and(eq(timeSlots.fieldId, fieldId), eq(timeSlots.date, date)))
      .orderBy(asc(timeSlots.startTime));
  }

  async createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const [newTimeSlot] = await db
      .insert(timeSlots)
      .values(timeSlot)
      .returning();
    return newTimeSlot;
  }

  async updateTimeSlot(id: number, updates: Partial<TimeSlot>): Promise<TimeSlot> {
    const [timeSlot] = await db
      .update(timeSlots)
      .set(updates)
      .where(eq(timeSlots.id, id))
      .returning();
    return timeSlot;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByVenue(venueId: number): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .innerJoin(fields, eq(bookings.fieldId, fields.id))
      .where(eq(fields.venueId, venueId))
      .orderBy(desc(bookings.createdAt));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async updateBooking(id: number, updates: Partial<Booking>): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async searchVenues(params: {
    sportType?: string;
    city?: string;
    date?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    priceMin?: number;
    priceMax?: number;
    amenities?: string[];
  }): Promise<Venue[]> {
    // This is a simplified search implementation
    // In production, you'd want more sophisticated geospatial queries and full-text search
    let query = db.select().from(venues).where(eq(venues.status, 'approved'));
    
    const conditions = [eq(venues.status, 'approved')];
    
    if (params.city) {
      conditions.push(like(venues.city, `%${params.city}%`));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(venues.rating));
  }

  async getVenueStats(venueId: number): Promise<{
    totalBookings: number;
    totalRevenue: number;
    occupancyRate: number;
    activeFields: number;
  }> {
    const venueFields = await this.getFieldsByVenue(venueId);
    const fieldIds = venueFields.map(f => f.id);
    
    const totalBookings = fieldIds.length > 0 ? 
      await db.select({ count: sql<number>`count(*)` })
        .from(bookings)
        .where(inArray(bookings.fieldId, fieldIds)) : [{ count: 0 }];
    
    const totalRevenue = fieldIds.length > 0 ?
      await db.select({ sum: sql<number>`sum(${bookings.totalAmount})` })
        .from(bookings)
        .where(and(
          inArray(bookings.fieldId, fieldIds),
          eq(bookings.status, 'completed')
        )) : [{ sum: 0 }];
    
    const activeFields = venueFields.filter(f => f.status === 'active').length;
    
    return {
      totalBookings: totalBookings[0].count || 0,
      totalRevenue: Number(totalRevenue[0].sum) || 0,
      occupancyRate: 0.78, // This would require more complex calculation
      activeFields
    };
  }

  async getPlatformStats(): Promise<{
    totalUsers: number;
    activeVenues: number;
    totalBookings: number;
    platformRevenue: number;
    pendingReviews: number;
  }> {
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const activeVenues = await db.select({ count: sql<number>`count(*)` })
      .from(venues)
      .where(eq(venues.status, 'approved'));
    const totalBookings = await db.select({ count: sql<number>`count(*)` }).from(bookings);
    const platformRevenue = await db.select({ sum: sql<number>`sum(${bookings.totalAmount})` })
      .from(bookings)
      .where(eq(bookings.status, 'completed'));
    const pendingReviews = await db.select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.isModerated, false));
    
    return {
      totalUsers: totalUsers[0].count || 0,
      activeVenues: activeVenues[0].count || 0,
      totalBookings: totalBookings[0].count || 0,
      platformRevenue: Number(platformRevenue[0].sum) || 0,
      pendingReviews: pendingReviews[0].count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
