import { Request, Response } from 'express';
import { log } from '../vite';
import { nebulaClient } from '../ai/nebula';
import { StorageFactory } from '../storage-factory';

/**
 * Register AI-related routes
 * These routes provide AI-powered features using ThirdWeb's Nebula AI
 * 
 * @param app Express application
 */
export function registerAIRoutes(app: any) {
  log('Registering AI routes', 'routes');
  
  /**
   * Generate music token metadata using AI
   * POST /api/ai/generate-metadata
   */
  app.post('/api/ai/generate-metadata', async (req: Request, res: Response) => {
    try {
      const { title, description } = req.body;
      
      if (!title && !description) {
        return res.status(400).json({ 
          success: false, 
          error: 'Please provide either a title or description for the song' 
        });
      }
      
      // Combine title and description for better context
      const songInfo = title 
        ? (description ? `${title} - ${description}` : title)
        : description;
      
      log(`Generating metadata for song: ${songInfo}`, 'ai');
      const metadata = await nebulaClient.generateMusicMetadata(songInfo);
      
      if (metadata.error) {
        return res.status(500).json({
          success: false,
          error: metadata.error
        });
      }
      
      return res.json({
        success: true,
        metadata
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Error in generate-metadata endpoint: ${errorMessage}`, 'ai');
      
      return res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  });
  
  /**
   * Analyze blockchain data for a song
   * GET /api/ai/analyze-song/:id
   */
  app.get('/api/ai/analyze-song/:id', async (req: Request, res: Response) => {
    try {
      const songId = parseInt(req.params.id);
      
      if (isNaN(songId)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid song ID' 
        });
      }
      
      // Get the song from storage
      const storage = StorageFactory.getStorage();
      const song = await storage.getSong(songId);
      
      if (!song) {
        return res.status(404).json({ 
          success: false, 
          error: 'Song not found' 
        });
      }
      
      // Get play data for the song
      const plays = await storage.getPlays(songId);
      const playCount = await storage.getPlayCount(songId);
      
      // Prepare data for analysis
      const analysisData = {
        song: {
          id: song.id,
          title: song.title,
          tokenAddress: song.tokenAddress,
          tokenSymbol: song.tokenSymbol,
          tokenName: song.tokenName,
          status: song.status
        },
        plays: {
          count: playCount,
          records: plays
        }
      };
      
      log(`Analyzing blockchain data for song ${songId}: ${song.title}`, 'ai');
      const analysis = await nebulaClient.analyzeBlockchainData(analysisData);
      
      if (analysis.error) {
        return res.status(500).json({
          success: false,
          error: analysis.error
        });
      }
      
      return res.json({
        success: true,
        songId,
        songTitle: song.title,
        tokenAddress: song.tokenAddress,
        analysis
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Error in analyze-song endpoint: ${errorMessage}`, 'ai');
      
      return res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  });
  
  /**
   * General AI chat endpoint
   * POST /api/ai/chat
   */
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Please provide a message' 
        });
      }
      
      log(`Chat request: "${message}"`, 'ai');
      const response = await nebulaClient.chat(message);
      
      if (response.error) {
        return res.status(500).json({
          success: false,
          error: response.error
        });
      }
      
      return res.json({
        success: true,
        answer: response.answer,
        sources: response.sources
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Error in chat endpoint: ${errorMessage}`, 'ai');
      
      return res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  });
}