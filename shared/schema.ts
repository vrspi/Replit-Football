import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, pgEnum, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum('user_role', ['player', 'venue_owner', 'admin']);
export const venueStatusEnum = pgEnum('venue_status', ['pending', 'approved', 'rejected']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed']);
export const fieldStatusEnum = pgEnum('field_status', ['active', 'inactive', 'maintenance']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default('player'),
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  amenities: json("amenities").$type<string[]>().default([]),
  images: json("images").$type<string[]>().default([]),
  verificationDocs: json("verification_docs").$type<string[]>().default([]),
  status: venueStatusEnum("status").default('pending'),
  rating: decimal("rating", { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fields = pgTable("fields", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").notNull().references(() => venues.id),
  name: text("name").notNull(),
  description: text("description"),
  sportType: text("sport_type").notNull(),
  capacity: integer("capacity"),
  surface: text("surface"),
  length: decimal("length", { precision: 5, scale: 2 }),
  width: decimal("width", { precision: 5, scale: 2 }),
  status: fieldStatusEnum("status").default('active'),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }).notNull(),
  peakHourRate: decimal("peak_hour_rate", { precision: 8, scale: 2 }),
  amenities: json("amenities").$type<string[]>().default([]),
  images: json("images").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id").notNull().references(() => fields.id),
  date: text("date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  isAvailable: boolean("is_available").default(true),
  isPeakHour: boolean("is_peak_hour").default(false),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  adminBlocked: boolean("admin_blocked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fieldId: integer("field_id").notNull().references(() => fields.id),
  timeSlotId: integer("time_slot_id").notNull().references(() => timeSlots.id),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  totalAmount: decimal("total_amount", { precision: 8, scale: 2 }).notNull(),
  status: bookingStatusEnum("status").default('pending'),
  paymentIntentId: text("payment_intent_id"),
  cancellationReason: text("cancellation_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  venueId: integer("venue_id").notNull().references(() => venues.id),
  fieldId: integer("field_id").references(() => fields.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isModerated: boolean("is_moderated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  venues: many(venues),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const venuesRelations = relations(venues, ({ one, many }) => ({
  owner: one(users, {
    fields: [venues.ownerId],
    references: [users.id],
  }),
  fields: many(fields),
  reviews: many(reviews),
}));

export const fieldsRelations = relations(fields, ({ one, many }) => ({
  venue: one(venues, {
    fields: [fields.venueId],
    references: [venues.id],
  }),
  timeSlots: many(timeSlots),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const timeSlotsRelations = relations(timeSlots, ({ one, many }) => ({
  field: one(fields, {
    fields: [timeSlots.fieldId],
    references: [fields.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  field: one(fields, {
    fields: [bookings.fieldId],
    references: [fields.id],
  }),
  timeSlot: one(timeSlots, {
    fields: [bookings.timeSlotId],
    references: [timeSlots.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  venue: one(venues, {
    fields: [reviews.venueId],
    references: [venues.id],
  }),
  field: one(fields, {
    fields: [reviews.fieldId],
    references: [fields.id],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  reviewCount: true,
});

export const insertFieldSchema = createInsertSchema(fields).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Field = typeof fields.$inferSelect;
export type InsertField = z.infer<typeof insertFieldSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
