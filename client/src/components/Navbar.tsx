import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function Navbar() {
  // State for user authentication
  const [user, setUser] = useState<{
    isConnected: boolean;
    walletAddress: string | null;
    farcasterUsername: string | null;
    fid: number | null;
  }>({ 
    isConnected: false,
    walletAddress: null,
    farcasterUsername: null,
    fid: null
  });
  
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("soundtoken_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
  const handleConnectWallet = async () => {
    try {
      // Create a connected user
      const newUser = {
        isConnected: true,
        walletAddress: "0x" + Math.random().toString(16).substring(2, 42),
        farcasterUsername: `user_${Date.now().toString().slice(-4)}`,
        fid: Math.floor(Math.random() * 10000)
      };
      
      setUser(newUser);
      localStorage.setItem("soundtoken_user", JSON.stringify(newUser));
      
      // Register the user on the backend
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      
      toast({
        title: "Wallet connected",
        description: "You're now connected to Base network",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-white shadow-sm dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="fas fa-music text-primary text-2xl mr-2"></i>
              <span className="font-bold text-xl text-gray-900 dark:text-white">SoundToken</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`${location === '/' ? 'border-primary text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Home
                </a>
              </Link>
              <Link href="/my-songs">
                <a className={`${location === '/my-songs' ? 'border-primary text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  My Songs
                </a>
              </Link>
              <Link href="/discover">
                <a className={`${location === '/discover' ? 'border-primary text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Discover
                </a>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Connected State */}
            {user.isConnected ? (
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <span className="h-2 w-2 rounded-full bg-green-400 mr-1.5"></span>
                  Connected to Base
                </span>
                <div className="h-8 w-8 rounded-full bg-gray-200 ml-3 flex items-center justify-center overflow-hidden">
                  <i className="fas fa-user text-gray-600"></i>
                </div>
              </div>
            ) : (
              /* Disconnected State */
              <Button 
                className="bg-primary hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                onClick={handleConnectWallet}
              >
                <i className="fas fa-wallet mr-2"></i>
                Connect Wallet
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary dark:hover:bg-gray-800" aria-controls="mobile-menu" aria-expanded="false">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (hidden by default) */}
      <div className="sm:hidden hidden" id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/">
            <a className={`${location === '/' ? 'bg-indigo-50 border-primary text-primary dark:bg-gray-800' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Home
            </a>
          </Link>
          <Link href="/my-songs">
            <a className={`${location === '/my-songs' ? 'bg-indigo-50 border-primary text-primary dark:bg-gray-800' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              My Songs
            </a>
          </Link>
          <Link href="/discover">
            <a className={`${location === '/discover' ? 'bg-indigo-50 border-primary text-primary dark:bg-gray-800' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Discover
            </a>
          </Link>
        </div>
        {user.isConnected && (
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <i className="fas fa-user text-gray-600"></i>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">
                  {user.farcasterUsername || "User"}
                </div>
                <div className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                  {user.walletAddress ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}` : ""}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
