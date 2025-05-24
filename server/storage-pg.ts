import { 
  users, type User, type InsertUser, 
  songs, type Song, type InsertSong,
  plays, type Play, type InsertPlay
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import { IStorage } from "./storage";

export class PostgresStorage implements IStorage {
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return results.length > 0 ? results[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return results.length > 0 ? results[0] : undefined;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.walletAddress, walletAddress)).limit(1);
    return results.length > 0 ? results[0] : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const results = await db.insert(users).values({
      username: user.username,
      password: user.password,
      walletAddress: user.walletAddress || null,
      farcasterUsername: user.farcasterUsername || null,
      fid: user.fid || null
    }).returning();
    
    return results[0];
  }
  
  // Song methods
  async getSong(id: number): Promise<Song | undefined> {
    const results = await db.select().from(songs).where(eq(songs.id, id)).limit(1);
    return results.length > 0 ? results[0] : undefined;
  }

  async getSongsByUserId(userId: number): Promise<Song[]> {
    return await db.select().from(songs).where(eq(songs.userId, userId));
  }

  async getSongByTokenAddress(tokenAddress: string): Promise<Song | undefined> {
    const results = await db.select().from(songs).where(eq(songs.tokenAddress, tokenAddress)).limit(1);
    return results.length > 0 ? results[0] : undefined;
  }

  async createSong(song: InsertSong): Promise<Song> {
    const results = await db.insert(songs).values({
      userId: song.userId,
      title: song.title,
      description: song.description || null,
      genre: song.genre,
      duration: song.duration || null,
      songUrl: song.songUrl,
      artworkUrl: song.artworkUrl,
      tokenName: song.tokenName,
      tokenSymbol: song.tokenSymbol,
      enableFarcaster: song.enableFarcaster || true,
      status: "pending",
      tokenAddress: null,
      frameUrl: null,
      metadata: {}
    }).returning();
    
    return results[0];
  }

  async updateSong(id: number, updates: Partial<Song>): Promise<Song | undefined> {
    const results = await db
      .update(songs)
      .set(updates)
      .where(eq(songs.id, id))
      .returning();
    
    return results.length > 0 ? results[0] : undefined;
  }
  
  // Play methods
  async getPlays(songId: number): Promise<Play[]> {
    return await db.select().from(plays).where(eq(plays.songId, songId));
  }

  async getPlayCount(songId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(plays)
      .where(eq(plays.songId, songId));
    
    return result[0].count;
  }

  async recordPlay(play: InsertPlay): Promise<Play> {
    const results = await db.insert(plays).values({
      songId: play.songId,
      userId: play.userId || null,
      walletAddress: play.walletAddress || null,
      transactionHash: play.transactionHash || null
    }).returning();
    
    return results[0];
  }
}