import { log } from '../vite';

/**
 * Interface for Nebula Chat API responses
 */
interface NebulaChatResponse {
  answer: string;
  sources?: Array<{
    title: string;
    url: string;
    content: string;
  }>;
  error?: string;
}

/**
 * Client for interacting with ThirdWeb's Nebula AI
 * Provides AI-powered features for the music platform
 */
export class NebulaClient {
  private secretKey: string | undefined;
  private baseUrl = "https://nebula-api.thirdweb.com";
  
  constructor() {
    this.secretKey = process.env.THIRDWEB_SECRET_KEY;
    
    if (!this.secretKey) {
      log('ThirdWeb Nebula AI client initialized in simulation mode - missing secret key', 'ai');
    } else {
      log('ThirdWeb Nebula AI client initialized successfully', 'ai');
    }
  }
  
  /**
   * Send a message to Nebula AI and get a response
   * 
   * @param message The user's message to the AI
   * @param stream Whether to stream the response or not
   * @returns The AI's response
   */
  async chat(message: string, stream = false): Promise<NebulaChatResponse> {
    try {
      // Check if we have a secret key for ThirdWeb
      if (!this.secretKey) {
        // Simulation mode response
        log(`Simulating Nebula AI chat: "${message}"`, 'ai');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          answer: `This is a simulated response from Nebula AI. In production, with a valid THIRDWEB_SECRET_KEY, you would receive an actual AI response about: "${message}"`
        };
      }
      
      // Real API call to Nebula
      log(`Sending message to Nebula AI: "${message}"`, 'ai');
      
      const response = await fetch(
        `${this.baseUrl}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-secret-key": this.secretKey,
          },
          body: JSON.stringify({
            message,
            stream
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Nebula API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Error calling Nebula AI: ${errorMessage}`, 'ai');
      
      return {
        answer: "Sorry, I encountered an error while processing your request.",
        error: errorMessage
      };
    }
  }
  
  /**
   * Generate music metadata recommendations based on a song title or description
   * 
   * @param songInfo Basic song information like title or description
   * @returns AI-generated metadata recommendations
   */
  async generateMusicMetadata(songInfo: string): Promise<{
    tokenName?: string;
    tokenSymbol?: string;
    description?: string;
    tags?: string[];
    error?: string;
  }> {
    try {
      const prompt = `Generate music token metadata for a song with the following information: "${songInfo}". 
      Please provide a token name, token symbol (3-4 characters), description (2-3 sentences), and 3-5 tags.
      Format the response in JSON with fields: tokenName, tokenSymbol, description, and tags (array).`;
      
      const response = await this.chat(prompt);
      
      if (response.error) {
        return { error: response.error };
      }
      
      // Try to extract JSON from the response
      try {
        // First attempt to find JSON-like content in the response
        const jsonMatch = response.answer.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          return JSON.parse(jsonStr);
        }
        
        // If no JSON found, provide a simulated response
        return {
          tokenName: `${songInfo} Token`,
          tokenSymbol: songInfo.substring(0, 3).toUpperCase(),
          description: `This token represents the song "${songInfo}". It tracks plays and engagement on the blockchain.`,
          tags: ["music", "blockchain", "onchain"]
        };
      } catch (parseError) {
        // If parsing fails, return a formatted response
        return {
          tokenName: `${songInfo} Token`,
          tokenSymbol: songInfo.substring(0, 3).toUpperCase(),
          description: response.answer.substring(0, 150),
          tags: ["music", "blockchain", "onchain"]
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Error generating music metadata: ${errorMessage}`, 'ai');
      
      return {
        error: errorMessage
      };
    }
  }
  
  /**
   * Analyze blockchain data for insights about a song's performance
   * 
   * @param playData Play data from the blockchain
   * @returns AI-generated analysis and insights
   */
  async analyzeBlockchainData(playData: any): Promise<{
    insights: string;
    recommendations?: string;
    error?: string;
  }> {
    try {
      const dataStr = JSON.stringify(playData);
      const prompt = `Analyze this blockchain play data for a music token and provide insights: ${dataStr}. 
      Focus on patterns in play count, unique listeners, and engagement trends. 
      Also suggest ways the artist could increase engagement.`;
      
      const response = await this.chat(prompt);
      
      if (response.error) {
        return { 
          insights: "Unable to analyze data at this time.",
          error: response.error 
        };
      }
      
      // Split the response into insights and recommendations
      const parts = response.answer.split('\n\n');
      
      return {
        insights: parts[0] || response.answer,
        recommendations: parts.length > 1 ? parts.slice(1).join('\n\n') : undefined
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Error analyzing blockchain data: ${errorMessage}`, 'ai');
      
      return {
        insights: "Unable to analyze blockchain data due to an error.",
        error: errorMessage
      };
    }
  }
}

// Export a singleton instance
export const nebulaClient = new NebulaClient();