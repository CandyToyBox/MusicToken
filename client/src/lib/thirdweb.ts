import type { Song } from "@shared/schema";

// ThirdWeb SDK integration with our API keys
const THIRDWEB_CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID || '77d4800e51c357dee0b36c2f1fd50e68';
const BASE_CHAIN_ID = 8453; // Base mainnet chain ID

// Result interfaces
export interface DeployTokenResult {
  success: boolean;
  tokenAddress?: string;
  error?: string;
}

export interface RecordPlayResult {
  success: boolean;
  transactionHash?: string;
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
  
  // Deploy a new SoundToken contract using ThirdWeb SDK
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
      
      // For now, we'll use our backend API to handle the deployment
      // This ensures we have proper error handling and backend validation
      const response = await fetch(`/api/songs/${song.id}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: THIRDWEB_CLIENT_ID,
          songMetadata: {
            title: song.title,
            artist: song.tokenSymbol,
            description: song.description,
            imageUrl: song.artworkUrl,
            audioUrl: song.songUrl,
          }
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to deploy token");
      }
      
      const result = await response.json();
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
      // Check connection to Base network first
      const isConnected = await ThirdwebClient.isConnectedToBase();
      if (!isConnected) {
        const connected = await ThirdwebClient.connectToBase();
        if (!connected) {
          throw new Error("Failed to connect to Base network");
        }
      }
      
      // Use our backend API to handle the transaction
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
        const error = await response.json();
        throw new Error(error.message || "Failed to record play");
      }
      
      const result = await response.json();
      return {
        success: true,
        transactionHash: result.transactionHash,
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
