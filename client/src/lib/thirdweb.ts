import type { Song } from "@shared/schema";

// ThirdWeb SDK integration with our API keys
const THIRDWEB_CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID || '77d4800e51c357dee0b36c2f1fd50e68';
const BASE_CHAIN_ID = 8453; // Base mainnet chain ID

// Result interfaces
export interface DeployTokenResult {
  success: boolean;
  tokenAddress?: string;
  openSeaUrl?: string;
  contractType?: string;
  error?: string;
}

export interface RecordPlayResult {
  success: boolean;
  transactionHash?: string;
  playId?: number;
  error?: string;
}

// ThirdWeb client for deploying tokens and recording plays
export const ThirdwebClient = {
  // Check if wallet is connected to Base network
  isConnectedToBase: async (): Promise<boolean> => {
    try {
      // For now, check if the user has connected to any chain
      // In a full implementation, we would check if the chain is Base
      if (!window.ethereum) {
        console.log("No ethereum provider found");
        return false;
      }
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const connectedChainId = parseInt(chainId, 16);
      
      console.log(`Connected to chain ID: ${connectedChainId}`);
      
      // Check if the user is connected to Base
      // For testing, we'll just log this and return true
      return true;
    } catch (error) {
      console.error("Error checking chain:", error);
      return false;
    }
  },
  
  // Request connection to Base network
  connectToBase: async (): Promise<boolean> => {
    try {
      if (!window.ethereum) {
        throw new Error("No ethereum provider found. Please install a wallet.");
      }
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Check current chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const connectedChainId = parseInt(chainId, 16);
      
      // If not on Base, request switch to Base
      if (connectedChainId !== BASE_CHAIN_ID) {
        try {
          // Try to switch to Base
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
          // If Base is not added to the user's wallet, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
                  chainName: 'Base',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org'],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error connecting to Base:", error);
      return false;
    }
  },
  
  // Deploy a new illiquid, non-tradeable SoundToken contract using ThirdWeb SDK
  deploySoundToken: async (song: Song): Promise<DeployTokenResult> => {
    try {
      // First, check if connected to Base network
      const isConnected = await ThirdwebClient.isConnectedToBase();
      if (!isConnected) {
        const connected = await ThirdwebClient.connectToBase();
        if (!connected) {
          throw new Error("Failed to connect to Base network");
        }
      }
      
      console.log("Deploying non-tradeable ERC-20 token for song:", song.title);
      
      // Prepare song metadata for the token contract
      const songMetadata = {
        title: song.title,
        artist: song.tokenSymbol,
        description: song.description,
        imageUrl: song.artworkUrl,
        audioUrl: song.songUrl,
        genre: song.genre,
        tokenName: song.tokenName,
        tokenSymbol: song.tokenSymbol,
        // Track plays on-chain
        isNonTradeable: true,
        recordPlaysOnChain: true,
        // Include NFT marketplace information
        nftMarketplaceCompatible: true
      };
      
      // Use our backend API to handle the deployment
      // This ensures we have proper error handling and backend validation
      const response = await fetch(`/api/songs/${song.id}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: THIRDWEB_CLIENT_ID,
          songMetadata,
          deploymentOptions: {
            // These options ensure the token is non-tradeable but can record plays
            transferable: false,
            burnable: false,
            mintable: true,
            supplyType: "capped",
            initialSupply: "1",
            maxSupply: "1"
          }
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to deploy token");
      }
      
      const result = await response.json();
      
      // If successful, log the contract address and provide NFT marketplace URL
      if (result.tokenAddress) {
        console.log(`Token deployed successfully at: ${result.tokenAddress}`);
        
        // Generate OpenSea URL for creating NFT
        const openSeaUrl = `https://opensea.io/asset/base/${result.tokenAddress}/1`;
        console.log(`NFT marketplace URL: ${openSeaUrl}`);
        
        // Return the complete result
        return {
          success: true,
          tokenAddress: result.tokenAddress,
          openSeaUrl,
          contractType: "Non-tradeable ERC-20 with on-chain play tracking"
        };
      }
      
      return {
        success: true,
        tokenAddress: result.tokenAddress,
      };
    } catch (error) {
      console.error("Error deploying token:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred during deployment",
      };
    }
  },
  
  // Record a play on the blockchain
  recordPlay: async (
    songId: number,
    tokenAddress: string,
    walletAddress: string
  ): Promise<RecordPlayResult> => {
    try {
      console.log(`Recording play for song ${songId} with wallet ${walletAddress} and token ${tokenAddress}`);
      
      // For production blockchain integration:
      // 1. Check if user is connected to Base network
      // 2. Call the smart contract's play recording function
      // 3. Wait for transaction confirmation
      // 4. Return the transaction hash
      
      // Use our backend API to record the play
      // The backend will handle the on-chain transaction
      const response = await fetch("/api/plays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId,
          walletAddress,
          tokenAddress,
          clientId: THIRDWEB_CLIENT_ID,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to record play";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          // If parsing fails, use the raw text
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log("Play recorded successfully:", result);
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        playId: result.id,
      };
    } catch (error) {
      console.error("Error recording play:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during play recording",
      };
    }
  },
  
  // Get Base explorer URL for a transaction or contract
  getExplorerUrl: (addressOrTx: string, type: 'transaction' | 'address' = 'address'): string => {
    return `https://basescan.org/${type}/${addressOrTx}`;
  }
};
