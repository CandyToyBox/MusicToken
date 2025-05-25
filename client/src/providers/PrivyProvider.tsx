import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PrivyProvider as PrivyAuthProvider, usePrivy as usePrivyAuth } from '@privy-io/react-auth';

// Privy configuration with our app ID
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'cmb2y1isj00tbjv0mi8pil9dy';

// Define user interface
interface User {
  walletAddress: string | null;
  isConnected: boolean;
  farcasterUsername?: string;
  fid?: number;
}

// Define the context type
interface PrivyContextType {
  user: User;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

// Create the context
const PrivyContext = createContext<PrivyContextType | undefined>(undefined);

// Custom hook to use the Privy context
export function usePrivy() {
  const context = useContext(PrivyContext);
  if (!context) {
    throw new Error("usePrivy must be used within a PrivyProvider");
  }
  return context;
}

// Wrapper component for the Privy provider
interface PrivyWrapperProps {
  children: ReactNode;
}

// This component handles the actual Privy integration
function PrivyWrapper({ children }: PrivyWrapperProps) {
  // Use the Privy SDK hook
  const privy = usePrivyAuth();
  
  const [user, setUser] = useState<User>({
    walletAddress: null,
    isConnected: false,
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Privy client
  useEffect(() => {
    const initializePrivy = async () => {
      try {
        setIsLoading(true);
        
        // Check if the user is already authenticated with Privy
        if (privy.authenticated) {
          const walletAddress = privy.user?.wallet?.address || null;
          
          // Get Farcaster info if available
          const farcasterData = privy.user?.linkedAccounts?.find(
            account => account.type === 'farcaster'
          );
          
          const newUser = {
            walletAddress,
            isConnected: true,
            farcasterUsername: farcasterData?.displayName,
            fid: farcasterData ? Number(farcasterData.id) : undefined,
          };
          
          setUser(newUser);
          
          // Register the user on the backend
          if (walletAddress) {
            await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newUser),
            });
          }
        }
      } catch (error) {
        console.error("Error initializing Privy:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePrivy();
  }, [privy.authenticated, privy.user]);

  // Login function - connects wallet with Privy
  const login = async () => {
    try {
      setIsLoading(true);
      await privy.login();
      
      // The user state will be updated in the useEffect above
      // when privy.authenticated changes
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function - disconnects wallet
  const logout = async () => {
    try {
      setIsLoading(true);
      await privy.logout();
      
      // Update local state
      setUser({ walletAddress: null, isConnected: false });
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PrivyContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </PrivyContext.Provider>
  );
}

// Main Privy Provider component
export function PrivyProvider({ children }: PrivyWrapperProps) {
  return (
    <PrivyAuthProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#6366f1', // Primary indigo color
          logo: 'https://soundtoken.app/logo.png',
        },
        loginMethods: ['wallet', 'email', 'farcaster'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          noPromptOnSignature: false,
        },
      }}
    >
      <PrivyWrapper>{children}</PrivyWrapper>
    </PrivyAuthProvider>
  );
}
