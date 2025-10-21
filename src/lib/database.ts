import { MongoClient, Db, Collection } from 'mongodb';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.client && this.db) {
      return; // Already connected
    }

    try {
      const uri = import.meta.env.VITE_MONGODB_URI || process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MongoDB URI not found in environment variables');
      }

      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db('base-forever-ink');
      
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  public getCollection<T = any>(name: string): Collection<T> {
    return this.getDb().collection<T>(name);
  }
}

export const database = DatabaseConnection.getInstance();

// User interface
export interface User {
  _id?: string;
  userId: string; // Unique identifier we generate
  walletAddress: string;
  username?: string;
  createdAt: Date;
  lastActiveAt: Date;
  totalMessages: number;
  totalReactions: number;
}

// Activity interface
export interface Activity {
  _id?: string;
  activityId: string;
  userId: string;
  walletAddress: string;
  type: 'sign_in' | 'message_posted' | 'reaction_added' | 'wallet_connected';
  data: {
    message?: string;
    txHash?: string;
    tag?: string;
    reactionType?: string;
    targetMessageId?: string;
    [key: string]: any;
  };
  timestamp: Date;
  blockchainData?: {
    chainId: number;
    network: string;
    gasUsed?: string;
    gasPrice?: string;
  };
}

// Guestbook Message interface
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
  userReactions: string[]; // Array of user IDs who reacted
}