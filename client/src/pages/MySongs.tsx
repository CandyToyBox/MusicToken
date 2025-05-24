import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Song } from "@shared/schema";
import SongCard from "@/components/SongCard";
import { Button } from "@/components/ui/button";

export default function MySongs() {
  // Temporary solution - get user from localStorage if available
  const [user, setUser] = useState<{
    isConnected: boolean;
    walletAddress: string | null;
  }>({
    isConnected: false,
    walletAddress: null
  });
  
  useEffect(() => {
    const savedUser = localStorage.getItem("soundtoken_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
  const userId = user.walletAddress ? parseInt(user.walletAddress.substring(2, 10), 16) % 1000 : null;
  
  // Fetch songs only if user is connected
  const { data: songs, isLoading, error } = useQuery<Song[]>({
    queryKey: ['/api/songs', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/songs?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch songs");
      return response.json();
    },
    enabled: !!userId,
  });

  if (!user.isConnected) {
    return (
      <div className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block p-6 rounded-full bg-gray-100 dark:bg-gray-800">
              <i className="fas fa-lock text-gray-400 text-5xl"></i>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Connect your wallet</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Please connect your wallet to view your songs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-16 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold leading-6 text-gray-900 flex items-center dark:text-white">
            <i className="fas fa-compact-disc text-primary mr-2 dark:text-blue-400"></i>
            My Songs
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your tokenized songs on Base blockchain
          </p>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="py-12 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-blue-400"></div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading your songs...</p>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="py-12 text-center">
            <div className="inline-block p-6 rounded-full bg-red-100 dark:bg-red-900">
              <i className="fas fa-exclamation-triangle text-red-500 text-5xl"></i>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Error loading songs</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Something went wrong. Please try again later.
            </p>
          </div>
        )}
        
        {/* Song List */}
        {!isLoading && !error && songs && songs.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && !error && (!songs || songs.length === 0) && (
          <div className="py-12 text-center">
            <div className="inline-block p-6 rounded-full bg-gray-100 dark:bg-gray-800">
              <i className="fas fa-music text-gray-400 text-5xl"></i>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No songs yet</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Upload your first song to create a token on Base blockchain.
            </p>
            <div className="mt-6">
              <Link href="/upload">
                <Button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-indigo-600 dark:hover:bg-indigo-700">
                  <i className="fas fa-plus mr-2"></i>
                  Upload Your First Song
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
