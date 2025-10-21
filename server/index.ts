import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, Db } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db: Db;
let client: MongoClient;

async function connectToDatabase() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    client = new MongoClient(uri);
    await client.connect();
    db = client.db('base-forever-ink');
    
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// User interfaces
interface User {
  _id?: string;
  userId: string;
  walletAddress: string;
  username?: string;
  createdAt: Date;
  lastActiveAt: Date;
  totalMessages: number;
  totalReactions: number;
}

interface Activity {
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

interface GuestbookMessage {
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

// Helper function to generate user ID
function generateUserId(): string {
  return `user_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
}

// Helper function to generate activity ID
function generateActivityId(): string {
  return `activity_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
}

// Helper function to generate message ID
function generateMessageId(): string {
  return `msg_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// User Management Endpoints

// Get or create user by wallet address
app.post('/api/users/auth', async (req, res) => {
  try {
    const { walletAddress, username } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const usersCollection = db.collection<User>('users');
    
    // Check if user exists
    let user = await usersCollection.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      // Create new user
      const newUser: User = {
        userId: generateUserId(),
        walletAddress: walletAddress.toLowerCase(),
        username: username || 'Anonymous',
        createdAt: new Date(),
        lastActiveAt: new Date(),
        totalMessages: 0,
        totalReactions: 0
      };

      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId.toString() };

      // Log sign-in activity for new user
      await logActivity({
        userId: user.userId,
        walletAddress: user.walletAddress,
        type: 'wallet_connected',
        data: { username: user.username, isNewUser: true }
      });
    } else {
      // Update last active time
      await usersCollection.updateOne(
        { walletAddress: walletAddress.toLowerCase() },
        { 
          $set: { 
            lastActiveAt: new Date(),
            ...(username && { username })
          }
        }
      );

      // Log sign-in activity for existing user
      await logActivity({
        userId: user.userId,
        walletAddress: user.walletAddress,
        type: 'sign_in',
        data: { username: username || user.username }
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error in user auth:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by wallet address
app.get('/api/users/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const usersCollection = db.collection<User>('users');
    
    const user = await usersCollection.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (with pagination)
app.get('/api/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const usersCollection = db.collection<User>('users');
    
    const users = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await usersCollection.countDocuments();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Activity Tracking Endpoints

// Helper function to log activity
async function logActivity(activityData: Omit<Activity, 'activityId' | 'timestamp'>) {
  try {
    const activitiesCollection = db.collection<Activity>('activities');
    
    const activity: Activity = {
      activityId: generateActivityId(),
      ...activityData,
      timestamp: new Date()
    };

    await activitiesCollection.insertOne(activity);
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
}

// Log activity endpoint
app.post('/api/activities', async (req, res) => {
  try {
    const { userId, walletAddress, type, data, blockchainData } = req.body;

    if (!userId || !walletAddress || !type) {
      return res.status(400).json({ error: 'userId, walletAddress, and type are required' });
    }

    const activity = await logActivity({
      userId,
      walletAddress: walletAddress.toLowerCase(),
      type,
      data: data || {},
      blockchainData
    });

    res.json({ activity });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get activities for a user
app.get('/api/activities/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const activitiesCollection = db.collection<Activity>('activities');
    
    const activities = await activitiesCollection
      .find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await activitiesCollection.countDocuments({ userId });

    res.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting user activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all activities (with pagination and filtering)
app.get('/api/activities', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;

    const activitiesCollection = db.collection<Activity>('activities');
    
    // Define valid activity types
    const validActivityTypes: Activity['type'][] = ['sign_in', 'message_posted', 'reaction_added', 'wallet_connected'];
    
    // Create properly typed filter
    const filter: Partial<Activity> = {};
    if (type && validActivityTypes.includes(type as Activity['type'])) {
      filter.type = type as Activity['type'];
    }
    
    const activities = await activitiesCollection
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await activitiesCollection.countDocuments(filter);

    res.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Guestbook Message Endpoints

// Save guestbook message
app.post('/api/guestbook/messages', async (req, res) => {
  try {
    const { userId, walletAddress, username, message, tag, txHash } = req.body;

    if (!userId || !walletAddress || !message || !txHash) {
      return res.status(400).json({ error: 'userId, walletAddress, message, and txHash are required' });
    }

    const messagesCollection = db.collection<GuestbookMessage>('guestbook_messages');
    const usersCollection = db.collection<User>('users');
    
    const guestbookMessage: GuestbookMessage = {
      messageId: generateMessageId(),
      userId,
      walletAddress: walletAddress.toLowerCase(),
      username: username || 'Anonymous',
      message,
      tag,
      txHash,
      timestamp: new Date(),
      reactions: {
        heart: 0,
        thumbsUp: 0,
        fire: 0,
        hundred: 0
      },
      userReactions: []
    };

    await messagesCollection.insertOne(guestbookMessage);

    // Update user's message count
    await usersCollection.updateOne(
      { userId },
      { 
        $inc: { totalMessages: 1 },
        $set: { lastActiveAt: new Date() }
      }
    );

    // Log activity
    await logActivity({
      userId,
      walletAddress: walletAddress.toLowerCase(),
      type: 'message_posted',
      data: {
        messageId: guestbookMessage.messageId,
        message,
        tag,
        txHash
      },
      blockchainData: {
        chainId: 84532, // Base Sepolia
        network: 'Base Sepolia'
      }
    });

    res.json({ message: guestbookMessage });
  } catch (error) {
    console.error('Error saving guestbook message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get guestbook messages
app.get('/api/guestbook/messages', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const messagesCollection = db.collection<GuestbookMessage>('guestbook_messages');
    
    const messages = await messagesCollection
      .find({})
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await messagesCollection.countDocuments();

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting guestbook messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add reaction to message
app.post('/api/guestbook/messages/:messageId/reactions', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, reactionType } = req.body;

    if (!userId || !reactionType) {
      return res.status(400).json({ error: 'userId and reactionType are required' });
    }

    const messagesCollection = db.collection<GuestbookMessage>('guestbook_messages');
    const usersCollection = db.collection<User>('users');
    
    const message = await messagesCollection.findOne({ messageId });
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user already reacted
    const hasReacted = message.userReactions.includes(userId);
    
    if (hasReacted) {
      return res.status(400).json({ error: 'User has already reacted to this message' });
    }

    // Add reaction
    const updateQuery = {
      $inc: { [`reactions.${reactionType}`]: 1 },
      $push: { userReactions: userId }
    };

    await messagesCollection.updateOne({ messageId }, updateQuery);

    // Update user's reaction count
    await usersCollection.updateOne(
      { userId },
      { 
        $inc: { totalReactions: 1 },
        $set: { lastActiveAt: new Date() }
      }
    );

    // Log activity
    const user = await usersCollection.findOne({ userId });
    await logActivity({
      userId,
      walletAddress: user?.walletAddress || '',
      type: 'reaction_added',
      data: {
        messageId,
        reactionType,
        targetUserId: message.userId
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics Endpoints

// Get user statistics
app.get('/api/analytics/users', async (req, res) => {
  try {
    const usersCollection = db.collection<User>('users');
    const activitiesCollection = db.collection<Activity>('activities');
    
    const totalUsers = await usersCollection.countDocuments();
    const activeUsersToday = await activitiesCollection.distinct('userId', {
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    const topUsers = await usersCollection
      .find({})
      .sort({ totalMessages: -1 })
      .limit(10)
      .toArray();

    res.json({
      totalUsers,
      activeUsersToday: activeUsersToday.length,
      topUsers
    });
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get activity statistics
app.get('/api/analytics/activities', async (req, res) => {
  try {
    const activitiesCollection = db.collection<Activity>('activities');
    
    const totalActivities = await activitiesCollection.countDocuments();
    
    const activityTypes = await activitiesCollection.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const activitiesLast7Days = await activitiesCollection.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    res.json({
      totalActivities,
      activityTypes,
      activitiesLast7Days
    });
  } catch (error) {
    console.error('Error getting activity analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
async function startServer() {
  await connectToDatabase();
  
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (client) {
    await client.close();
  }
  process.exit(0);
});

startServer().catch(console.error);