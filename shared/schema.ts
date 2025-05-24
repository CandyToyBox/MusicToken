import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  farcasterUsername: text("farcaster_username"),
  fid: integer("fid"),
});

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  genre: text("genre").notNull(),
  duration: integer("duration"),
  songUrl: text("song_url").notNull(),
  artworkUrl: text("artwork_url").notNull(),
  tokenName: text("token_name").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  tokenAddress: text("token_address"),
  status: text("status").notNull().default("pending"),
  enableFarcaster: boolean("enable_farcaster").default(true),
  frameUrl: text("frame_url"),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata"),
});

export const plays = pgTable("plays", {
  id: serial("id").primaryKey(),
  songId: integer("song_id").notNull(),
  userId: integer("user_id"),
  walletAddress: text("wallet_address"),
  playedAt: timestamp("played_at").defaultNow(),
  transactionHash: text("transaction_hash"),
});

// Schemas for insertion
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
  farcasterUsername: true,
  fid: true,
});

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
  createdAt: true,
  tokenAddress: true,
  frameUrl: true,
  status: true,
});

export const insertPlaySchema = createInsertSchema(plays).omit({
  id: true,
  playedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof songs.$inferSelect;

export type InsertPlay = z.infer<typeof insertPlaySchema>;
export type Play = typeof plays.$inferSelect;
