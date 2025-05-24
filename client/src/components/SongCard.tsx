import { useState, useEffect } from "react";
import { Song } from "@shared/schema";
import AudioPlayer from "./AudioPlayer";
import { OnchainKitClient } from "@/lib/onchainkit";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface SongCardProps {
  song: Song;
}

export default function SongCard({ song }: SongCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  
  // Handle play state change
  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };
  
  // Share song on Farcaster
  const handleShare = () => {
    if (song.status !== "live") {
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
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="group relative bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
      {/* Artwork */}
      <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-t-lg overflow-hidden">
        <img src={song.artworkUrl} alt={`${song.title} artwork`} className="w-full h-full object-center object-cover" />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {song.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{song.genre} • {Math.floor(song.duration! / 60)}:{(song.duration! % 60).toString().padStart(2, "0")}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            song.status === "live" 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}>
            {song.status === "live" ? "Live" : "Pending"}
          </span>
        </div>
        
        {/* Player Component */}
        <div className="mt-4">
          <AudioPlayer
            songId={song.id}
            tokenAddress={song.tokenAddress}
            audioUrl={song.songUrl}
            isPlaying={isPlaying}
            onPlayStateChange={handlePlayStateChange}
          />
        </div>
        
        {/* Token Info */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Token:</span>
              <span className="font-medium ml-1 dark:text-white">{song.tokenSymbol}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Plays:</span>
              <span className="font-medium ml-1 dark:text-white">{song.metadata?.playCount || 0}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <i className="fas fa-link mr-1"></i>
            <span className="truncate">{formatAddress(song.tokenAddress)}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 flex space-x-2">
          <button 
            className={`flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
              song.status === "live" 
                ? "text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600" 
                : "text-gray-400 bg-gray-50 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600"
            }`}
            onClick={handleShare}
            disabled={song.status !== "live"}
          >
            <i className="fas fa-share-nodes mr-2"></i>
            Share
          </button>
          <Link href={`/songs/${song.id}`}>
            <a className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-indigo-600 dark:hover:bg-indigo-700">
              <i className="fas fa-info-circle mr-2"></i>
              Details
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
