import express from 'express';
import Message from '../models/messageModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get users with whom the authenticated user has chatted
router.get('/chat-users/:userId', protect, async (req, res) => {
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
    res.status(500).json({ message: 'Failed to fetch chat users' });
  }
});

// Get messages between authenticated user and another user
router.get('/:userId', protect, async (req, res) => {
  console.log('🔥 GET /api/messages/:userId hit!');
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort({ timestamp: 1 });
    console.log('✅ Fetched messages:', messages.length);
    res.json(messages);
  } catch (err) {
    console.error('❌ Error fetching messages:', err.message);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/', protect, async (req, res) => {
  console.log('🔥 POST /api/messages hit!');
  const { senderId, receiverId, content } = req.body;

  if (senderId !== req.user._id.toString()) {
    console.error('❌ Unauthorized: Sender ID mismatch', { senderId, authUser: req.user._id });
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      timestamp: new Date(),
    });
    await message.populate('sender', 'name');
    await message.populate('receiver', 'name');
    console.log('✅ Message sent:', message._id);

    const io = req.app.get('socketio');
    io.to(receiverId).emit('receiveMessage', message);

    res.json(message);
  } catch (err) {
    console.error('❌ Error sending message:', err.message);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

export default router;












// routes/messageRoutes.js
/*
import express from 'express';
import Message from '../models/messageModel.js';
import { sendMessage, getMessages } from "../controllers/messageController.js";
import { protect } from '../middleware/authMiddleware.js';
import { getChatUsers } from '../controllers/messageController.js';


const router = express.Router();


router.post("/", protect, sendMessage);
router.get("/:userId", protect, getMessages);
router.get('/chat-users/:userId', protect, getChatUsers);


export default router;
*/