import { useState, useRef, useEffect } from "react";
import { ThirdwebClient } from "@/lib/thirdweb";
import { useToast } from "@/hooks/use-toast";

interface AudioPlayerProps {
  songId: number;
  tokenAddress?: string | null;
  audioUrl: string;
  isPlaying?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export default function AudioPlayer({ 
  songId, 
  tokenAddress, 
  audioUrl, 
  isPlaying = false, 
  onPlayStateChange 
}: AudioPlayerProps) {
  const [playing, setPlaying] = useState(isPlaying);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Using local state for user data since we removed the Privy provider
  const [user, setUser] = useState<{walletAddress: string | null}>({walletAddress: null});
  
  // Load user data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("soundtoken_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
  const { toast } = useToast();

  // Initialize audio element with mock functionality
  useEffect(() => {
    // In a real app, we would use the actual audio URL
    // For the mock implementation, we'll simulate audio playback
    
    // Create a mock audio object since we don't have real audio files
    const mockAudio = {
      play: () => Promise.resolve(),
      pause: () => {},
      duration: 180, // 3 minutes mock duration
      currentTime: 0,
      addEventListener: (event: string, callback: any) => {
        if (event === "loadedmetadata") {
          // Simulate metadata loaded
          setTimeout(() => callback(), 100);
        }
      },
      removeEventListener: () => {}
    };
    
    // Set initial duration
    setDuration(mockAudio.duration);
    
    // Store reference to our mock audio object
    audioRef.current = mockAudio as any;
    
    // Simulate timeupdate events when playing
    let interval: number | null = null;
    
    if (playing) {
      interval = window.setInterval(() => {
        if (mockAudio.currentTime < mockAudio.duration) {
          mockAudio.currentTime += 1;
          setCurrentTime(mockAudio.currentTime);
          setProgress((mockAudio.currentTime / mockAudio.duration) * 100);
        } else {
          // Ended
          setPlaying(false);
          setProgress(0);
          mockAudio.currentTime = 0;
          setCurrentTime(0);
          if (onPlayStateChange) onPlayStateChange(false);
          if (interval) clearInterval(interval);
        }
      }, 1000);
    }
    
    // Clean up
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [audioUrl, playing, onPlayStateChange]);

  // Handle external playing state changes
  useEffect(() => {
    if (isPlaying !== playing) {
      togglePlay();
    }
  }, [isPlaying]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (playing) {
      audioRef.current.pause();
    } else {
      // Record play on the blockchain if not already playing
      if (tokenAddress && user.walletAddress && progress === 0) {
        recordPlay();
      }
      
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        toast({
          title: "Playback Error",
          description: "Could not play the audio. Please try again.",
          variant: "destructive",
        });
      });
    }
    
    setPlaying(!playing);
    if (onPlayStateChange) onPlayStateChange(!playing);
  };

  // Record play on the blockchain
  const recordPlay = async () => {
    // For development, we'll accept recording plays even without a token address
    // This allows us to test the play counting functionality
    if (!user.walletAddress) {
      // Use a mock wallet address for testing if none is available
      user.walletAddress = "0xMockWalletAddress";
    }
    
    try {
      console.log(`Recording play for song ${songId}...`);
      
      // Use the ThirdWeb client to record the play
      const result = await ThirdwebClient.recordPlay(
        songId,
        tokenAddress || "pending",
        user.walletAddress
      );
      
      if (result.success) {
        console.log(`Play recorded successfully! Transaction: ${result.transactionHash}`);
        toast({
          title: "Play Recorded",
          description: "Your play has been recorded on the blockchain",
        });
      } else {
        console.error("Failed to record play:", result.error);
        toast({
          title: "Play Recording Failed",
          description: result.error || "Could not record play on the blockchain",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error recording play:", error);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="bg-gray-50 rounded p-3 dark:bg-gray-800">
      <div className="flex items-center space-x-2">
        <button
          className="text-primary hover:text-indigo-700 focus:outline-none dark:text-blue-400 dark:hover:text-blue-300"
          onClick={togglePlay}
        >
          <i className={`fas ${playing ? "fa-pause" : "fa-play"}`}></i>
        </button>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-primary h-2.5 rounded-full dark:bg-blue-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatTime(currentTime)}
        </span>
      </div>
    </div>
  );
}
