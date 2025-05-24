import { 
  users, type User, type InsertUser, 
  songs, type Song, type InsertSong,
  plays, type Play, type InsertPlay
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Song methods
  getSong(id: number): Promise<Song | undefined>;
  getSongsByUserId(userId: number): Promise<Song[]>;
  getSongByTokenAddress(tokenAddress: string): Promise<Song | undefined>;
  createSong(song: InsertSong): Promise<Song>;
  updateSong(id: number, updates: Partial<Song>): Promise<Song | undefined>;
  
  // Play methods
  getPlays(songId: number): Promise<Play[]>;
  getPlayCount(songId: number): Promise<number>;
  recordPlay(play: InsertPlay): Promise<Play>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private songs: Map<number, Song>;
  private plays: Map<number, Play>;
  private userIdCounter: number;
  private songIdCounter: number;
  private playIdCounter: number;

  constructor() {
    this.users = new Map();
    this.songs = new Map();
    this.plays = new Map();
    this.userIdCounter = 1;
    this.songIdCounter = 1;
    this.playIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Song methods
  async getSong(id: number): Promise<Song | undefined> {
    return this.songs.get(id);
  }

  async getSongsByUserId(userId: number): Promise<Song[]> {
    return Array.from(this.songs.values()).filter(
      (song) => song.userId === userId
    );
  }

  async getSongByTokenAddress(tokenAddress: string): Promise<Song | undefined> {
    return Array.from(this.songs.values()).find(
      (song) => song.tokenAddress === tokenAddress
    );
  }

  async createSong(insertSong: InsertSong): Promise<Song> {
    const id = this.songIdCounter++;
    const createdAt = new Date();
    const song: Song = { 
      ...insertSong, 
      id, 
      createdAt,
      status: "pending",
      tokenAddress: null,
      frameUrl: null
    };
    this.songs.set(id, song);
    return song;
  }

  async updateSong(id: number, updates: Partial<Song>): Promise<Song | undefined> {
    const song = this.songs.get(id);
    if (!song) return undefined;
    
    const updatedSong: Song = { ...song, ...updates };
    this.songs.set(id, updatedSong);
    return updatedSong;
  }

  // Play methods
  async getPlays(songId: number): Promise<Play[]> {
    return Array.from(this.plays.values()).filter(
      (play) => play.songId === songId
    );
  }

  async getPlayCount(songId: number): Promise<number> {
    return Array.from(this.plays.values()).filter(
      (play) => play.songId === songId
    ).length;
  }

  async recordPlay(insertPlay: InsertPlay): Promise<Play> {
    const id = this.playIdCounter++;
    const playedAt = new Date();
    const play: Play = { ...insertPlay, id, playedAt };
    this.plays.set(id, play);
    return play;
  }
}

export const storage = new MemStorage();
