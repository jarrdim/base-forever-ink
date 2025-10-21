// API client for database operations

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface User {
  _id?: string;
  userId: string;
  walletAddress: string;
  username?: string;
  createdAt: Date;
  lastActiveAt: Date;
  totalMessages: number;
  totalReactions: number;
}

export interface Activity {
  _id?: string;
  activityId: string;
  userId: string;
  walletAddress: string;
  type: 'sign_in' | 'message_posted' | 'reaction_added' | 'wallet_connected';
  data: any;
  timestamp: Date;
  blockchainData?: {
    chainId: number;
    network: string;
    gasUsed?: string;
    gasPrice?: string;
  };
}

export interface GuestbookMessage {
  _id?: string;
  messageId: string;
  userId: string;
  walletAddress: string;
  username: string;
  message: string;
  tag?: string;
  txHash: string;
  timestamp: Date;
  reactions: {
    heart: number;
    thumbsUp: number;
    fire: number;
    hundred: number;
  };
  userReactions: string[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API client class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // User Management
  async authenticateUser(walletAddress: string, username?: string): Promise<ApiResponse<{ user: User }>> {
    return this.request('/users/auth', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, username }),
    });
  }

  async getUser(walletAddress: string): Promise<ApiResponse<{ user: User }>> {
    return this.request(`/users/${walletAddress}`);
  }

  async getUsers(page: number = 1, limit: number = 20): Promise<ApiResponse<{ users: User[]; pagination: any }>> {
    return this.request(`/users?page=${page}&limit=${limit}`);
  }

  // Activity Tracking
  async logActivity(
    userId: string,
    walletAddress: string,
    type: Activity['type'],
    data: any = {},
    blockchainData?: Activity['blockchainData']
  ): Promise<ApiResponse<{ activity: Activity }>> {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify({ userId, walletAddress, type, data, blockchainData }),
    });
  }

  async getUserActivities(userId: string, page: number = 1, limit: number = 50): Promise<ApiResponse<{ activities: Activity[]; pagination: any }>> {
    return this.request(`/activities/user/${userId}?page=${page}&limit=${limit}`);
  }

  async getActivities(page: number = 1, limit: number = 50, type?: string): Promise<ApiResponse<{ activities: Activity[]; pagination: any }>> {
    const typeParam = type ? `&type=${type}` : '';
    return this.request(`/activities?page=${page}&limit=${limit}${typeParam}`);
  }

  // Guestbook Messages
  async saveGuestbookMessage(
    userId: string,
    walletAddress: string,
    username: string,
    message: string,
    txHash: string,
    tag?: string
  ): Promise<ApiResponse<{ message: GuestbookMessage }>> {
    return this.request('/guestbook/messages', {
      method: 'POST',
      body: JSON.stringify({ userId, walletAddress, username, message, tag, txHash }),
    });
  }

  async getGuestbookMessages(page: number = 1, limit: number = 20): Promise<ApiResponse<{ messages: GuestbookMessage[]; pagination: any }>> {
    return this.request(`/guestbook/messages?page=${page}&limit=${limit}`);
  }

  async addReaction(messageId: string, userId: string, reactionType: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/guestbook/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ userId, reactionType }),
    });
  }

  // Analytics
  async getUserAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/analytics/users');
  }

  async getActivityAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/analytics/activities');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Helper functions for common operations
export const userApi = {
  authenticate: (walletAddress: string, username?: string) => 
    apiClient.authenticateUser(walletAddress, username),
  
  get: (walletAddress: string) => 
    apiClient.getUser(walletAddress),
  
  getAll: (page?: number, limit?: number) => 
    apiClient.getUsers(page, limit),
};

export const activityApi = {
  log: (userId: string, walletAddress: string, type: Activity['type'], data?: any, blockchainData?: Activity['blockchainData']) => 
    apiClient.logActivity(userId, walletAddress, type, data, blockchainData),
  
  getUserActivities: (userId: string, page?: number, limit?: number) => 
    apiClient.getUserActivities(userId, page, limit),
  
  getAll: (page?: number, limit?: number, type?: string) => 
    apiClient.getActivities(page, limit, type),
};

export const guestbookApi = {
  saveMessage: (userId: string, walletAddress: string, username: string, message: string, txHash: string, tag?: string) => 
    apiClient.saveGuestbookMessage(userId, walletAddress, username, message, txHash, tag),
  
  getMessages: (page?: number, limit?: number) => 
    apiClient.getGuestbookMessages(page, limit),
  
  addReaction: (messageId: string, userId: string, reactionType: string) => 
    apiClient.addReaction(messageId, userId, reactionType),
};

export const analyticsApi = {
  users: () => apiClient.getUserAnalytics(),
  activities: () => apiClient.getActivityAnalytics(),
};

// Local storage helpers for user session
export const userSession = {
  setUser: (user: User) => {
    localStorage.setItem('base-forever-ink-user', JSON.stringify(user));
  },
  
  getUser: (): User | null => {
    const userData = localStorage.getItem('base-forever-ink-user');
    return userData ? JSON.parse(userData) : null;
  },
  
  clearUser: () => {
    localStorage.removeItem('base-forever-ink-user');
  },
  
  updateUser: (updates: Partial<User>) => {
    const currentUser = userSession.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      userSession.setUser(updatedUser);
      return updatedUser;
    }
    return null;
  }
};