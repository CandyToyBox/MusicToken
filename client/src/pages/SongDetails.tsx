import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Song } from "@shared/schema";
import AudioPlayer from "@/components/AudioPlayer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { OnchainKitClient } from "@/lib/onchainkit";

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

  // Fetch play count
  const { data: playData } = useQuery({
    queryKey: ['/api/songs/plays', id],
    queryFn: async () => {
      const response = await fetch(`/api/songs/${id}/plays`);
      if (!response.ok) {
        throw new Error('Failed to fetch play count');
      }
      return response.json();
    },
    refetchInterval: isPlaying ? 10000 : false, // Refetch every 10 seconds if playing
  });

  // Handle play state change
  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
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
              <div className="mb-2"><span className="font-medium">Token Name:</span> {song.tokenName} ({song.tokenSymbol})</div>
              <div className="mb-2">
                <span className="font-medium">Token Address:</span> 
                <span className="ml-2 text-indigo-600 dark:text-indigo-400 break-all">
                  {song.tokenAddress || "Deploying..."}
                </span>
              </div>
              {song.tokenAddress && (
                <div className="mb-2">
                  <span className="font-medium">NFT Marketplace:</span> 
                  <a 
                    href={`https://opensea.io/asset/base/${song.tokenAddress}/1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                  >
                    Create NFT on OpenSea
                  </a>
                  <p className="text-xs text-gray-500 mt-1 ml-2 dark:text-gray-400">
                    Your non-tradeable token can be wrapped as an NFT for display
                  </p>
                </div>
              )}
              <div className="mb-2">
                <span className="font-medium">Play Count:</span> 
                <span className="ml-2 text-indigo-600 dark:text-indigo-400">
                  {playData ? playData.playCount : 0}
                </span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  (Recorded on Base blockchain)
                </span>
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
            <div className="flex space-x-4">
              <Button 
                onClick={handleShare}
                disabled={song.status !== "live"}
                variant={song.status === "live" ? "default" : "outline"}
                className="flex-1"
              >
                <i className="fas fa-share-nodes mr-2"></i>
                Share on Farcaster
              </Button>
              <Button 
                onClick={() => navigate("/my-songs")}
                variant="outline"
                className="flex-1"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to My Songs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}