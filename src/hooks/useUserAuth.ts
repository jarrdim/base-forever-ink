import { useState, useEffect, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { userApi, activityApi, userSession, User } from '@/lib/api';
import { toast } from 'sonner';

export interface UseUserAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authenticateUser: (username?: string) => Promise<void>;
  logActivity: (type: 'sign_in' | 'message_posted' | 'reaction_added' | 'wallet_connected', data?: any) => Promise<void>;
  updateUserStats: (messageCount?: number, reactionCount?: number) => void;
  logout: () => void;
}

export const useUserAuth = (): UseUserAuthReturn => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = userSession.getUser();
    if (savedUser && savedUser.walletAddress === address) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }
  }, [address]);

  // Authenticate user when wallet connects
  useEffect(() => {
    if (isConnected && address && !isAuthenticated) {
      authenticateUser();
    } else if (!isConnected && isAuthenticated) {
      logout();
    }
  }, [isConnected, address, isAuthenticated]);

  const authenticateUser = useCallback(async (username?: string) => {
    if (!address) {
      toast.error('No wallet address found');
      return;
    }

    setIsLoading(true);
    try {
      // First try to get existing user
      const existingUserResponse = await userApi.get(address);
      
      if (existingUserResponse.data?.user) {
        // User exists, update last active time
        const existingUser = existingUserResponse.data.user;
        setUser(existingUser);
        setIsAuthenticated(true);
        userSession.setUser(existingUser);
        
        // Log sign-in activity
        await logActivity('sign_in', { 
          previousLogin: existingUser.lastActiveAt,
          chainId,
          network: getNetworkName(chainId)
        });
        
        toast.success(`Welcome back, ${existingUser.username || 'User'}!`);
      } else {
        // User doesn't exist, create new user
        const authResponse = await userApi.authenticate(address, username);
        
        if (authResponse.data?.user) {
          const newUser = authResponse.data.user;
          setUser(newUser);
          setIsAuthenticated(true);
          userSession.setUser(newUser);
          
          // Log wallet connection and sign-in activity
          await logActivity('wallet_connected', { 
            isNewUser: true,
            chainId,
            network: getNetworkName(chainId)
          });
          
          await logActivity('sign_in', { 
            isFirstLogin: true,
            chainId,
            network: getNetworkName(chainId)
          });
          
          toast.success(`Welcome to Base Forever Ink, ${newUser.username || 'User'}!`);
        } else {
          throw new Error(authResponse.error || 'Failed to authenticate user');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Failed to authenticate user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId]);

  const logActivity = useCallback(async (
    type: 'sign_in' | 'message_posted' | 'reaction_added' | 'wallet_connected',
    data: any = {}
  ) => {
    if (!user || !address) return;

    try {
      const blockchainData = {
        chainId,
        network: getNetworkName(chainId),
      };

      const response = await activityApi.log(
        user.userId,
        address,
        type,
        data,
        blockchainData
      );

      if (response.error) {
        console.error('Failed to log activity:', response.error);
      }
    } catch (error) {
      console.error('Activity logging error:', error);
    }
  }, [user, address, chainId]);

  const updateUserStats = useCallback((messageCount?: number, reactionCount?: number) => {
    if (!user) return;

    const updates: Partial<User> = {};
    if (messageCount !== undefined) {
      updates.totalMessages = user.totalMessages + messageCount;
    }
    if (reactionCount !== undefined) {
      updates.totalReactions = user.totalReactions + reactionCount;
    }

    if (Object.keys(updates).length > 0) {
      const updatedUser = userSession.updateUser(updates);
      if (updatedUser) {
        setUser(updatedUser);
      }
    }
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    userSession.clearUser();
    toast.info('Logged out successfully');
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    authenticateUser,
    logActivity,
    updateUserStats,
    logout,
  };
};

// Helper function to get network name from chain ID
function getNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    8453: 'Base Mainnet',
    84532: 'Base Sepolia',
    11155111: 'Sepolia',
    5: 'Goerli',
    137: 'Polygon',
    80001: 'Mumbai',
  };
  
  return networks[chainId] || `Chain ${chainId}`;
}