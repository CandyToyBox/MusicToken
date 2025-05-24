import { useState, useEffect } from "react";
import { Song } from "@shared/schema";
import AudioPlayer from "./AudioPlayer";
import { OnchainKitClient } from "@/lib/onchainkit";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface SongCardProps {
  song: Song;
}

export default function SongCard({ song }: SongCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [songData, setSongData] = useState(song);
  const { toast } = useToast();
  
  // Fetch the latest play count for this song
  const { data: playData } = useQuery({
    queryKey: ['/api/songs/plays', song.id],
    queryFn: async () => {
      const response = await fetch(`/api/songs/${song.id}/plays`);
      if (!response.ok) {
        throw new Error('Failed to fetch play count');
      }
      return response.json();
    },
    refetchInterval: isPlaying ? 10000 : false, // Refetch every 10 seconds if playing
  });
  
  // Update song data when play count changes
  useEffect(() => {
    if (playData) {
      const newMetadata = { 
        ...(songData.metadata || {}), 
        playCount: playData.playCount 
      };
      
      setSongData({
        ...songData,
        metadata: newMetadata
      });
    }
  }, [playData]);
  
  // Handle play state change
  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };
  
  // Share song on Farcaster
  const handleShare = () => {
    if (songData.status !== "live") {
      toast({
        title: "Cannot share yet",
        description: "This song is still being processed. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      OnchainKitClient.shareSong(songData);
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
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="group relative bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
      {/* Artwork */}
      <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-t-lg overflow-hidden">
        <img src={songData.artworkUrl} alt={`${songData.title} artwork`} className="w-full h-full object-center object-cover" />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {songData.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{songData.genre} • {Math.floor(songData.duration! / 60)}:{(songData.duration! % 60).toString().padStart(2, "0")}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            songData.status === "live" 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}>
            {songData.status === "live" ? "Live" : "Pending"}
          </span>
        </div>
        
        {/* Player Component */}
        <div className="mt-4">
          <AudioPlayer
            songId={songData.id}
            tokenAddress={songData.tokenAddress}
            audioUrl={songData.songUrl}
            isPlaying={isPlaying}
            onPlayStateChange={handlePlayStateChange}
          />
        </div>
        
        {/* Token Info */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Token:</span>
              <span className="font-medium ml-1 dark:text-white">{songData.tokenSymbol}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Plays:</span>
              <span className="font-medium ml-1 dark:text-white">{songData.metadata && typeof songData.metadata === 'object' ? (songData.metadata as any).playCount || 0 : 0}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <i className="fas fa-link mr-1"></i>
            <span className="truncate">{formatAddress(songData.tokenAddress)}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 flex space-x-2">
          <button 
            className={`flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
              songData.status === "live" 
                ? "text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600" 
                : "text-gray-400 bg-gray-50 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600"
            }`}
            onClick={handleShare}
            disabled={songData.status !== "live"}
          >
            <i className="fas fa-share-nodes mr-2"></i>
            Share
          </button>
          <Link href={`/songs/${songData.id}`} className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-indigo-600 dark:hover:bg-indigo-700">
            <i className="fas fa-info-circle mr-2"></i>
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
