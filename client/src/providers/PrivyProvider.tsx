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
          // Get the wallet address - check linked wallets first
          let walletAddress = null;
          if (privy.user?.linkedAccounts) {
            // Find Ethereum wallet
            const walletAccount = privy.user.linkedAccounts.find(
              account => account.type === 'wallet'
            );
            
            if (walletAccount && walletAccount.walletClientType) {
              walletAddress = walletAccount.address;
            }
          }
          
          // If no linked wallet, try embedded wallet
          if (!walletAddress && privy.user?.wallet) {
            walletAddress = privy.user.wallet.address;
          }
          
          // Get Farcaster info if available
          let farcasterUsername: string | undefined = undefined;
          let farcasterFid: number | undefined = undefined;
          
          if (privy.user?.linkedAccounts) {
            const farcasterAccount = privy.user.linkedAccounts.find(
              account => account.type === 'farcaster'
            );
            
            if (farcasterAccount) {
              // Extract displayName
              farcasterUsername = farcasterAccount.displayName || undefined;
              
              // Try to extract FID from various possible sources
              // Since the type definitions might not include these fields,
              // we'll use a type assertion with 'any' to safely access them
              const farcasterAny = farcasterAccount as any;
              
              // Try multiple possible locations for the FID
              const fidFromId = farcasterAny?.id ? String(farcasterAny.id) : undefined;
              const fidFromUserId = farcasterAny?.userId ? String(farcasterAny.userId) : undefined;
              const fidFromVerified = farcasterAny?.verifiedAddress || undefined;
              
              // If display name contains a number, it might be the FID
              const fidFromDisplayName = farcasterAccount.displayName?.match(/\d+/)?.[0];
              
              // Use the first available FID source
              const fidString = fidFromId || fidFromUserId || fidFromVerified || fidFromDisplayName;
              
              if (fidString) {
                // Convert to number if possible
                const fidNumber = parseInt(fidString, 10);
                if (!isNaN(fidNumber)) {
                  farcasterFid = fidNumber;
                }
              }
            }
          }
          
          // Create the user object with all the collected data
          const newUser: User = {
            walletAddress,
            isConnected: true,
            farcasterUsername,
            fid: farcasterFid
          };
          
          // Update our user state
          setUser(newUser);
          
          // Register the user on the backend
          if (walletAddress) {
            try {
              await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  walletAddress,
                  farcasterUsername: farcasterUsername || null,
                  fid: farcasterFid || null
                }),
              });
              console.log("User registered with backend");
            } catch (err) {
              console.error("Failed to register user with backend:", err);
            }
          }
        } else {
          // User is not authenticated
          setUser({
            walletAddress: null,
            isConnected: false
          });
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
        },
        // This is a workaround for the type checking issue
        // The actual Privy SDK does support this option
        ...(({
          farcaster: {
            requireVerifiedEmail: false,
          }
        } as unknown) as Record<string, never>)
      }}
    >
      <PrivyWrapper>{children}</PrivyWrapper>
    </PrivyAuthProvider>
  );
}
