import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Song } from "@shared/schema";
import AudioPlayer from "@/components/AudioPlayer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { OnchainKitClient } from "@/lib/onchainkit";

// Define types for play data
interface PlayRecord {
  id: number;
  timestamp: string;
  walletAddress: string;
  transactionHash: string;
}

interface PlayData {
  songId: number;
  playCount: string;
  tokenAddress: string;
  status: string;
  recentPlays: PlayRecord[];
}

export default function SongDetails() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Fetch song details
  const { data: song, isLoading, error } = useQuery({
    queryKey: ['/api/songs', id],
    queryFn: async () => {
      const response = await fetch(`/api/songs/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch song details');
      }
      return response.json() as Promise<Song>;
    },
  });

  // Fetch play count with more frequent updates when playing
  const { data: playData, refetch: refetchPlays } = useQuery<PlayData>({
    queryKey: ['/api/songs/plays', id],
    queryFn: async () => {
      console.log(`Fetching play count for song ${id}`);
      const response = await fetch(`/api/songs/${id}/plays`);
      if (!response.ok) {
        throw new Error('Failed to fetch play count');
      }
      const data = await response.json();
      console.log(`Received play data:`, data);
      return data;
    },
    refetchInterval: isPlaying ? 5000 : 30000, // Refetch more frequently if playing
  });
  
  // Trigger refetch after play state changes
  useEffect(() => {
    if (isPlaying) {
      // Set up an interval to refetch plays while playing
      const interval = setInterval(() => {
        refetchPlays();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, refetchPlays]);

  // Handle play state change
  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };
  
  // Deploy token to blockchain
  const [isDeploying, setIsDeploying] = useState(false);
  
  const handleDeploy = async () => {
    if (!song) return;
    
    setIsDeploying(true);
    
    try {
      const response = await fetch(`/api/songs/${song.id}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to deploy token');
      }
      
      const updatedSong = await response.json();
      
      toast({
        title: "Token Deployed Successfully",
        description: "Your song token is now live on the Base blockchain",
      });
      
      // Force refetch of song data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error deploying token:", error);
      toast({
        title: "Deployment Failed",
        description: "There was an error deploying your token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };
  
  // Share song on Farcaster
  const handleShare = () => {
    if (!song || song.status !== "live") {
      toast({
        title: "Cannot share yet",
        description: "This song is still being processed. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      OnchainKitClient.shareSong(song);
      toast({
        title: "Song shared",
        description: "Your song has been shared to Farcaster.",
      });
    } catch (error) {
      console.error("Error sharing song:", error);
      toast({
        title: "Share failed",
        description: "Failed to share song. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Format wallet address
  const formatAddress = (address: string | null): string => {
    if (!address) return "Deploying...";
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading song details...</p>
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Song Not Found</h2>
          <p className="text-gray-600 mb-6 dark:text-gray-400">
            The song you are looking for does not exist or has been removed.
          </p>
          <Button onClick={() => navigate("/my-songs")}>
            Back to My Songs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800">
        <div className="md:flex">
          {/* Left side - Artwork */}
          <div className="md:w-1/3 bg-gray-200 dark:bg-gray-700">
            {/* Use a placeholder image since we're using mock URLs */}
            <div className="w-full h-full aspect-w-1 aspect-h-1 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900">
              <div className="text-center p-8">
                <i className="fas fa-music text-8xl text-indigo-500 dark:text-indigo-400 mb-4"></i>
                <div className="text-2xl text-indigo-700 dark:text-indigo-300 font-medium">{song.title}</div>
                <div className="text-indigo-600 dark:text-indigo-400 mt-2">{song.tokenSymbol}</div>
              </div>
            </div>
          </div>
          
          {/* Right side - Details */}
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{song.title}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                song.status === "live" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              }`}>
                {song.status === "live" ? "Live" : "Pending"}
              </span>
            </div>
            
            <div className="text-gray-600 dark:text-gray-300 mb-8">
              <div className="mb-2"><span className="font-medium">Genre:</span> {song.genre}</div>
              <div className="mb-2"><span className="font-medium">Duration:</span> {Math.floor(song.duration! / 60)}:{(song.duration! % 60).toString().padStart(2, "0")}</div>
              
              {/* Token Information Section with improved UI */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mt-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  <i className="fas fa-coins mr-2 text-indigo-500"></i>
                  Token Information
                </h3>
                
                <div className="flex flex-col space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 font-medium">Token Name:</div>
                    <div className="col-span-2 text-indigo-600 dark:text-indigo-400">{song.tokenName}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 font-medium">Token Symbol:</div>
                    <div className="col-span-2 text-indigo-600 dark:text-indigo-400">{song.tokenSymbol}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 font-medium">Token Status:</div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        song.status === "live" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}>
                        {song.status === "live" ? "Live on Blockchain" : "Pending Deployment"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 font-medium">Token Address:</div>
                    <div className="col-span-2">
                      {song.tokenAddress ? (
                        <div className="flex items-center">
                          <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400 break-all">
                            {song.tokenAddress}
                          </span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(song.tokenAddress || "");
                              toast({
                                title: "Address Copied",
                                description: "Token address copied to clipboard",
                              });
                            }}
                            className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-yellow-600 dark:text-yellow-400">
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Waiting for deployment...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 font-medium">Blockchain:</div>
                    <div className="col-span-2 flex items-center">
                      <img src="https://assets.coingecko.com/coins/images/26949/small/base.png" alt="Base" className="w-5 h-5 mr-2" />
                      Base Blockchain (Ethereum L2)
                    </div>
                  </div>
                  
                  {song.tokenAddress && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1 font-medium">Explorer:</div>
                      <div className="col-span-2">
                        <a 
                          href={`https://basescan.org/address/${song.tokenAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                        >
                          View on BaseScan <i className="fas fa-external-link-alt text-xs ml-1"></i>
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {song.tokenAddress && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1 font-medium">NFT Marketplace:</div>
                      <div className="col-span-2">
                        <a 
                          href={`https://opensea.io/asset/base/${song.tokenAddress}/1`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                        >
                          Create NFT on OpenSea <i className="fas fa-external-link-alt text-xs ml-1"></i>
                        </a>
                        <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                          Your non-tradeable token can be wrapped as an NFT for display
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* On-chain Play Stats Section */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  <i className="fas fa-chart-line mr-2 text-indigo-500"></i>
                  On-chain Analytics
                </h3>
                
                {/* Analytics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Play Count Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="text-gray-500 dark:text-gray-400 text-sm">Total Plays</div>
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <i className="fas fa-headphones text-green-600 dark:text-green-400"></i>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {playData ? playData.playCount : 0}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                      <i className="fas fa-check-circle mr-1"></i> Verified on Base blockchain
                    </div>
                  </div>
                  
                  {/* Unique Listeners Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="text-gray-500 dark:text-gray-400 text-sm">Unique Listeners</div>
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <i className="fas fa-users text-blue-600 dark:text-blue-400"></i>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {playData && playData.recentPlays ? 
                          new Set(playData.recentPlays.map(play => play.walletAddress)).size : 0}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                      <i className="fas fa-wallet mr-1"></i> Unique wallet addresses
                    </div>
                  </div>
                  
                  {/* Token Age Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="text-gray-500 dark:text-gray-400 text-sm">Token Age</div>
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                        <i className="fas fa-clock text-purple-600 dark:text-purple-400"></i>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {song.createdAt ? Math.floor((new Date().getTime() - new Date(song.createdAt).getTime()) / (1000 * 3600 * 24)) : 0}
                      </span>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">days</span>
                    </div>
                    <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                      <i className="fas fa-calendar-alt mr-1"></i> Since token creation
                    </div>
                  </div>
                </div>
                
                {/* Play History Graph - Visual Representation */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600 mb-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Play Activity Timeline
                  </div>
                  
                  {/* Simple visual timeline representation */}
                  <div className="relative h-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    {playData && playData.recentPlays && playData.recentPlays.length > 0 ? (
                      <>
                        {playData.recentPlays.map((play: PlayRecord, index: number) => {
                          const position = (new Date(play.timestamp).getTime() - new Date(playData.recentPlays[0].timestamp).getTime()) / 
                            (new Date().getTime() - new Date(playData.recentPlays[0].timestamp).getTime() + 1) * 100;
                          
                          return (
                            <div 
                              key={index} 
                              className="absolute w-2 h-2 rounded-full bg-indigo-500 transform -translate-y-1/2"
                              style={{ 
                                top: '50%', 
                                left: `${Math.min(Math.max(position, 0), 100)}%`,
                                zIndex: 10 + index
                              }}
                              title={new Date(play.timestamp).toLocaleString()}
                            />
                          );
                        })}
                        <div className="absolute left-0 top-0 h-full bg-indigo-200 dark:bg-indigo-900" 
                          style={{ width: '100%' }} />
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-xs">
                        No play data available
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <div>
                      {playData && playData.recentPlays && playData.recentPlays.length > 0 ? 
                        new Date(playData.recentPlays[0].timestamp).toLocaleDateString() : 'Start'}
                    </div>
                    <div>Now</div>
                  </div>
                </div>
                
                {/* Recent Transactions */}
                {playData && playData.recentPlays && playData.recentPlays.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Blockchain Transactions
                      </div>
                      <a 
                        href={song.tokenAddress ? `https://basescan.org/address/${song.tokenAddress}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        View All <i className="fas fa-external-link-alt ml-1"></i>
                      </a>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto pr-2">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Wallet</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {playData.recentPlays.map((play: PlayRecord, index: number) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-300">
                                {new Date(play.timestamp).toLocaleString()}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs">
                                <span className="text-gray-500 dark:text-gray-400 font-mono">
                                  {formatAddress(play.walletAddress)}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs">
                                <a 
                                  href={`https://basescan.org/tx/${play.transactionHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-mono"
                                >
                                  {play.transactionHash.substring(0, 10)}...
                                  <i className="fas fa-external-link-alt text-xs ml-1"></i>
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {song.description && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-300">{song.description}</p>
              </div>
            )}
            
            {/* Player */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Listen</h3>
              <AudioPlayer
                songId={song.id}
                tokenAddress={song.tokenAddress}
                audioUrl={song.songUrl}
                isPlaying={isPlaying}
                onPlayStateChange={handlePlayStateChange}
              />
            </div>
            
            {/* Actions */}
            <div className="flex flex-col space-y-4">
              {/* First row of buttons */}
              <div className="flex space-x-4">
                {song.status === "pending" ? (
                  <Button 
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    variant="default"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isDeploying ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Deploying Token...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-rocket mr-2"></i>
                        Deploy to Blockchain
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleShare}
                    disabled={song.status !== "live"}
                    variant="default"
                    className="flex-1"
                  >
                    <i className="fas fa-share-nodes mr-2"></i>
                    Share on Farcaster
                  </Button>
                )}
                
                <Button 
                  onClick={() => navigate("/my-songs")}
                  variant="outline"
                  className="flex-1"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to My Songs
                </Button>
              </div>
              
              {/* Deployment information */}
              {song.status === "pending" && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg text-sm">
                  <div className="flex items-start">
                    <i className="fas fa-info-circle text-yellow-500 mt-1 mr-2"></i>
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        Your song token needs to be deployed
                      </p>
                      <p className="mt-1 text-yellow-700 dark:text-yellow-300">
                        Deploy your song to the Base blockchain to enable on-chain play tracking
                        and share functionality. This process is free and only takes a few seconds.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}