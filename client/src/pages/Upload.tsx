import SongUploadForm from "@/components/SongUploadForm";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Upload() {
  // Temporary mock implementation while we fix the Privy provider
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
  
  const login = async () => {
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
  };

  // If user is not connected, show login prompt
  if (!user.isConnected) {
    return (
      <div className="bg-white py-16 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 dark:bg-gray-700 dark:border-gray-600">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center dark:text-white">
                <i className="fas fa-music text-primary mr-2 dark:text-blue-400"></i>
                Connect to Upload
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Please connect your wallet to upload songs.
              </p>
            </div>
            <div className="p-6 text-center">
              <div className="inline-block p-6 rounded-full bg-gray-100 mb-4 dark:bg-gray-700">
                <i className="fas fa-wallet text-gray-400 text-5xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Wallet Connection Required</h3>
              <p className="mt-2 mb-6 text-sm text-gray-500 dark:text-gray-400">
                Connect your wallet to create song tokens on Base blockchain.
              </p>
              <Button 
                className="bg-primary hover:bg-indigo-700 text-white"
                onClick={login}
              >
                <i className="fas fa-wallet mr-2"></i>
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="upload-section" className="bg-white py-16 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 dark:bg-gray-700 dark:border-gray-600">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center dark:text-white">
              <i className="fas fa-music text-primary mr-2 dark:text-blue-400"></i>
              Upload Your Song
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create a non-tradeable ERC-20 token for your song on Base blockchain.
            </p>
          </div>
          
          <div className="px-4 py-6 sm:p-6">
            <SongUploadForm />
          </div>
        </div>
      </div>
    </div>
  );
}
