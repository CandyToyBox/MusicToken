import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { insertSongSchema, insertPlaySchema } from "@shared/schema";
import { deploySoundToken } from "./contracts/SoundToken";
import { generateFarcasterFrame } from "./contracts/SoundToken";
import { StorageFactory } from "./storage-factory";

// Get the appropriate storage implementation
const getStorage = () => StorageFactory.getStorage();

export async function registerRoutes(app: Express): Promise<Server> {
  // User authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      
      // Check if user already exists
      const existingUser = await getStorage().getUserByWalletAddress(userData.walletAddress);
      if (existingUser) {
        return res.status(200).json(existingUser);
      }
      
      // Create new user
      const newUser = await getStorage().createUser({
        username: userData.username || `user_${Date.now()}`,
        password: userData.password || `pass_${Date.now()}`, // In a real app, we'd use Privy for auth
        walletAddress: userData.walletAddress,
        farcasterUsername: userData.farcasterUsername,
        fid: userData.fid
      });
      
      return res.status(201).json(newUser);
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Song routes
  app.get("/api/songs", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const songs = await getStorage().getSongsByUserId(userId);
      return res.json(songs);
    } catch (error) {
      console.error("Error fetching songs:", error);
      return res.status(500).json({ message: "Failed to fetch songs" });
    }
  });

  app.get("/api/songs/:id", async (req: Request, res: Response) => {
    try {
      const songId = parseInt(req.params.id);
      const song = await getStorage().getSong(songId);
      
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }
      
      return res.json(song);
    } catch (error) {
      console.error("Error fetching song:", error);
      return res.status(500).json({ message: "Failed to fetch song" });
    }
  });

  app.post("/api/songs", async (req: Request, res: Response) => {
    try {
      const songData = insertSongSchema.parse(req.body);
      const song = await getStorage().createSong(songData);
      
      // In a real app, we would handle file uploads to IPFS here
      // and then call deployToken after successful upload
      
      return res.status(201).json(song);
    } catch (error) {
      console.error("Error creating song:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid song data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create song" });
    }
  });

  app.post("/api/songs/:id/deploy", async (req: Request, res: Response) => {
    try {
      const songId = parseInt(req.params.id);
      const song = await getStorage().getSong(songId);
      
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }
      
      // Deploy token contract
      const result = await deploySoundToken(song);
      
      if (!result.success) {
        return res.status(500).json({ message: "Failed to deploy token contract", error: result.error });
      }
      
      // Update song with token address
      const updatedSong = await getStorage().updateSong(songId, {
        tokenAddress: result.tokenAddress,
        status: "live"
      });
      
      // Create Farcaster frame if enabled
      if (song.enableFarcaster) {
        const frameUrl = await generateFarcasterFrame(updatedSong!);
        await getStorage().updateSong(songId, { frameUrl });
      }
      
      return res.json(updatedSong);
    } catch (error) {
      console.error("Error deploying token:", error);
      return res.status(500).json({ message: "Failed to deploy token" });
    }
  });

  // Play tracking routes
  app.post("/api/plays", async (req: Request, res: Response) => {
    try {
      const playData = insertPlaySchema.parse(req.body);
      const play = await getStorage().recordPlay(playData);
      
      // In a real app, we would record this play on the blockchain
      // by calling the song's token contract
      
      return res.status(201).json(play);
    } catch (error) {
      console.error("Error recording play:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid play data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to record play" });
    }
  });

  app.get("/api/songs/:id/plays", async (req: Request, res: Response) => {
    try {
      const songId = parseInt(req.params.id);
      const song = await getStorage().getSong(songId);
      
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }
      
      const playCount = await getStorage().getPlayCount(songId);
      return res.json({ songId, playCount });
    } catch (error) {
      console.error("Error fetching play count:", error);
      return res.status(500).json({ message: "Failed to fetch play count" });
    }
  });

  // File upload routes (in a real app, this would upload to IPFS)
  app.post("/api/upload/song", (req: Request, res: Response) => {
    // Mock implementation - in a real app, this would upload to IPFS
    const fileUrl = `https://ipfs.example.com/song-${Date.now()}`;
    return res.json({ url: fileUrl });
  });

  app.post("/api/upload/artwork", (req: Request, res: Response) => {
    // Mock implementation - in a real app, this would upload to IPFS
    const fileUrl = `https://ipfs.example.com/artwork-${Date.now()}`;
    return res.json({ url: fileUrl });
  });

  const httpServer = createServer(app);
  return httpServer;
}
