import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PrivyClient } from "@/lib/privy";

interface User {
  walletAddress: string | null;
  isConnected: boolean;
  farcasterUsername?: string;
  fid?: number;
}

interface PrivyContextType {
  user: User;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const PrivyContext = createContext<PrivyContextType | undefined>(undefined);

export function usePrivy() {
  const context = useContext(PrivyContext);
  if (!context) {
    throw new Error("usePrivy must be used within a PrivyProvider");
  }
  return context;
}

interface PrivyProviderProps {
  children: ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const [user, setUser] = useState<User>({
    walletAddress: null,
    isConnected: false,
  });

  // Initialize Privy client
  useEffect(() => {
    const initializePrivy = async () => {
      try {
        // In a real app, we would check for an existing session
        const cachedUser = localStorage.getItem("soundtoken_user");
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }
      } catch (error) {
        console.error("Error initializing Privy:", error);
      }
    };

    initializePrivy();
  }, []);

  // Login function
  const login = async () => {
    try {
      // In a real app, this would use the Privy SDK to authenticate
      const walletAddress = PrivyClient.generateRandomWalletAddress();
      
      // Create a mock user
      const newUser = {
        walletAddress,
        isConnected: true,
        farcasterUsername: `user_${Date.now().toString().slice(-4)}`,
        fid: Math.floor(Math.random() * 10000),
      };
      
      setUser(newUser);
      localStorage.setItem("soundtoken_user", JSON.stringify(newUser));
      
      // In a real app, we would register the user on the backend
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // In a real app, this would use the Privy SDK to logout
      setUser({ walletAddress: null, isConnected: false });
      localStorage.removeItem("soundtoken_user");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <PrivyContext.Provider value={{ user, login, logout }}>
      {children}
    </PrivyContext.Provider>
  );
}
