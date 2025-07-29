import Message from '../models/messageModel.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const sendMessage = async (req, res) => {
  console.log('🔥 POST /api/messages hit!');
  const { senderId, receiverId, content } = req.body;
  console.log('🔍 Request body:', { senderId, receiverId, content });

  // Validate request body
  if (!senderId || !receiverId || !content) {
    console.error('❌ Missing required fields', { senderId, receiverId, content });
    return res.status(400).json({ message: 'Sender, receiver, and content are required' });
  }

  // Validate sender authorization
  if (!req.user) {
    console.error('❌ No authenticated user in request');
    return res.status(401).json({ message: 'No authenticated user found' });
  }
  if (senderId !== req.user._id.toString()) {
    console.error('❌ Unauthorized: Sender ID mismatch', { senderId, authUser: req.user._id });
    return res.status(403).json({ message: 'Unauthorized: Invalid sender' });
  }

  let message;
  try {
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      console.error('❌ Invalid senderId format:', senderId);
      return res.status(400).json({ message: 'Invalid sender ID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      console.error('❌ Invalid receiverId format:', receiverId);
      return res.status(400).json({ message: 'Invalid receiver ID format' });
    }

    // Check if sender and receiver exist
    const [sender, receiver] = await Promise.all([
      User.findById(senderId).select('_id name email role'),
      User.findById(receiverId).select('_id name email role'),
    ]);

    if (!sender) {
      console.error('❌ Sender not found:', senderId);
      return res.status(404).json({ message: 'Sender not found' });
    }
    if (!receiver) {
      console.error('❌ Receiver not found:', receiverId);
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Validate content
    if (!content.trim()) {
      console.error('❌ Content is empty');
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    // Create message
    message = new Message({
      sender: new mongoose.Types.ObjectId(senderId),
      receiver: new mongoose.Types.ObjectId(receiverId),
      content: content.trim(),
      timestamp: new Date(),
    });

    await message.save();
    console.log('✅ Message saved:', message._id);

    // Populate sender and receiver
    await message.populate('sender', 'name email role');
    await message.populate('receiver', 'name email role');
    console.log('✅ Message populated:', message._id);
  } catch (err) {
    console.error('❌ Error sending message:', err.message, err.stack);
    if (err.name === 'MongoServerError') {
      console.error('❌ MongoDB error details:', {
        code: err.code,
        keyPattern: err.keyPattern,
        keyValue: err.keyValue,
      });
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    return res.status(500).json({ message: 'Failed to save message', error: err.message });
  }

  // Emit Socket.IO event (optional)
  try {
    const io = req.app.get('socketio');
    if (io) {
      io.to(receiverId).emit('receiveMessage', message.toObject());
      console.log('📤 Emitted receiveMessage to:', receiverId);
    } else {
      console.warn('⚠️ Socket.IO not initialized, skipping emit');
    }
  } catch (emitError) {
    console.error('❌ Socket.IO emit error:', emitError.message, emitError.stack);
  }

  // Return response
  res.status(201).json(message);
};

export const getMessages = async (req, res) => {
  console.log('🔥 GET /api/messages/:userId hit!');
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ Invalid userId:', userId);
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ timestamp: 1 });

    console.log('✅ Fetched messages:', messages.length);
    res.json(messages);
  } catch (err) {
    console.error('❌ Error fetching messages:', err.message);
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
};

export const getChatUsers = async (req, res) => {
  console.log('🔥 GET /api/messages/chat-users/:userId hit!');
  const { userId } = req.params;

  if (userId !== req.user._id.toString()) {
    console.error('❌ Unauthorized: User ID mismatch', { userId, authUser: req.user._id });
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role');

    const chatUsers = new Set();
    messages.forEach((msg) => {
      const otherUser = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
      chatUsers.add(JSON.stringify({ _id: otherUser._id, name: otherUser.name, email: otherUser.email, role: otherUser.role }));
    });

    const uniqueUsers = Array.from(chatUsers).map((u) => JSON.parse(u));
    console.log('✅ Fetched chat users:', uniqueUsers.length);
    res.json(uniqueUsers);
  } catch (err) {
    console.error('❌ Error fetching chat users:', err.message);
    res.status(500).json({ message: 'Failed to fetch chat users', error: err.message });
  }
};





































/*
import Message from '../models/messageModel.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const sendMessage = async (req, res) => {
  console.log('🔥 POST /api/messages hit!');
  const { senderId, receiverId, content } = req.body;
  console.log('🔍 Request body:', { senderId, receiverId, content });

  // Validate request body
  if (!senderId || !receiverId || !content) {
    console.error('❌ Missing required fields', { senderId, receiverId, content });
    return res.status(400).json({ message: 'Sender, receiver, and content are required' });
  }

  // Validate sender authorization
  if (!req.user) {
    console.error('❌ No authenticated user in request');
    return res.status(401).json({ message: 'No authenticated user found' });
  }
  if (senderId !== req.user._id.toString()) {
    console.error('❌ Unauthorized: Sender ID mismatch', { senderId, authUser: req.user._id });
    return res.status(403).json({ message: 'Unauthorized: Invalid sender' });
  }

  try {
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      console.error('❌ Invalid senderId format:', senderId);
      return res.status(400).json({ message: 'Invalid sender ID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      console.error('❌ Invalid receiverId format:', receiverId);
      return res.status(400).json({ message: 'Invalid receiver ID format' });
    }

    // Check if sender and receiver exist
    const [sender, receiver] = await Promise.all([
      User.findById(senderId).select('_id name email'),
      User.findById(receiverId).select('_id name email'),
    ]);

    if (!sender) {
      console.error('❌ Sender not found:', senderId);
      return res.status(404).json({ message: 'Sender not found' });
    }
    if (!receiver) {
      console.error('❌ Receiver not found:', receiverId);
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Validate content
    if (!content.trim()) {
      console.error('❌ Content is empty');
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    // Create message
    const message = new Message({
      sender: new mongoose.Types.ObjectId(senderId),
      receiver: new mongoose.Types.ObjectId(receiverId),
      content: content.trim(),
      timestamp: new Date(),
    });

    await message.save();
    console.log('✅ Message saved:', message._id);

    // Populate sender and receiver
    await message.populate('sender', 'name email');
    await message.populate('receiver', 'name email');
    console.log('✅ Message populated:', message._id);

    // Emit Socket.IO event
    const io = req.app.get('socketio');
    if (io) {
      io.to(receiverId).emit('receiveMessage', message);
      console.log('📤 Emitted receiveMessage to:', receiverId);
    } else {
      console.warn('⚠️ Socket.IO not initialized');
    }

    res.status(201).json(message);
  } catch (err) {
    console.error('❌ Error sending message:', err.message, err.stack);
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      console.error('❌ MongoDB error details:', {
        code: err.code,
        keyPattern: err.keyPattern,
        keyValue: err.keyValue,
      });
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

export const getMessages = async (req, res) => {
  console.log('🔥 GET /api/messages/:userId hit!');
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ Invalid userId:', userId);
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ timestamp: 1 });

    console.log('✅ Fetched messages:', messages.length);
    res.json(messages);
  } catch (err) {
    console.error('❌ Error fetching messages:', err.message);
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
};

export const getChatUsers = async (req, res) => {
  console.log('🔥 GET /api/messages/chat-users/:userId hit!');
  const { userId } = req.params;

  if (userId !== req.user._id.toString()) {
    console.error('❌ Unauthorized: User ID mismatch', { userId, authUser: req.user._id });
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    const chatUsers = new Set();
    messages.forEach((msg) => {
      const otherUser = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
      chatUsers.add(JSON.stringify({ _id: otherUser._id, name: otherUser.name, email: otherUser.email }));
    });

    const uniqueUsers = Array.from(chatUsers).map((u) => JSON.parse(u));
    console.log('✅ Fetched chat users:', uniqueUsers.length);
    res.json(uniqueUsers);
  } catch (err) {
    console.error('❌ Error fetching chat users:', err.message);
    res.status(500).json({ message: 'Failed to fetch chat users', error: err.message });
  }
};










*/




/*
import Message from "../models/messageModel.js";
import mongoose from "mongoose";
import { io, userSocketMap } from "../socketServer.js"; // import socket instance and map
import User from '../models/userModel.js';


// POST /api/messages
export const sendMessage = async (req, res) => {
  console.log('🔥 POST /api/messages hit!');
  try {
    const { receiverId, content } = req.body;
    console.log("🧾 Incoming message body:", req.body);
    console.log("👤 Authenticated user:", req.user);

    if (!receiverId || !content) {
      return res.status(400).json({ message: "Receiver and content are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
  return res.status(400).json({ message: "Invalid receiver ID" });
}

    const newMessage = new Message({
      sender: req.user._id, // comes from protect middleware
      receiver: receiverId,
      content,
    });

    const saved = await newMessage.save();
   
// Emit message to receiver if they're connected via Socket.IO
    const receiverSocketId = userSocketMap[receiverId]; // socket id from the map
    if (receiverSocketId) {
      console.log(`📡 Emitting message to ${receiverSocketId}`);
      io.to(receiverSocketId).emit("receiveMessage", saved);
    } else {
      console.log("🚫 Receiver not connected via socket");
    }
    
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// GET /api/messages/:userId → all messages between current user and userId
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};




/**
 * Get list of unique chat users that the logged-in user has conversations with.
 * This includes both senders and recipients (excluding duplicates).
 
export const getChatUsers = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch all messages where the user is either sender or receiver
    const messages = await Message.find({
       $or: [{ sender: userId }, { receiver: userId }]
    });

    const userIds = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== userId) userIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== userId) userIds.add(msg.receiver.toString());
    });

    const chatUsers = await User.find({ _id: { $in: Array.from(userIds) } }).select('-password');
    res.json(chatUsers);
  } catch (error) {
    console.error("getChatUsers error:", error);
    res.status(500).json({ error: 'Server error fetching chat users' });
  }
};
*/
