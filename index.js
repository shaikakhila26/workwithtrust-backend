// index.js

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import gigRoutes from './routes/gigRoutes.js';

import orderRoutes from './routes/orderRoutes.js';
import earningsRoutes from './routes/earningsRoutes.js';

import webhookRoute from './routes/webhook.js'; // must come before express.json()
import otherRoutes from './routes/otherRoutes.js';
import connectDB from './config/db.js';
import stripeRoutes from './routes/StripeRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import User from './models/User.js'; // Adjust path
//import { setupSocket } from "./socketServer.js";
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import {setupSocket} from './socketServer.js'; // Import socket setup
import multer from 'multer';

import upload from './middleware/upload.js';


// Load environment variables
dotenv.config();
connectDB();

// ✅ Step 4: Import routes here
import authRoutes from './routes/authRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';









// Initialize app
const app = express();
// 🛑 Stripe webhook must come BEFORE express.json
app.use('/api', webhookRoute); // raw body route



const allowedOrigins= [
 'https://workwithtrust-frontend-5z6cru9pp-akhilas-projects-01434bdf.vercel.app/',
 'http://localhost:5173'
]
// Middleware
app.use(cors({
  origin:allowedOrigins,
   // Adjust to your frontend URL
  credentials: true, // Allow cookies to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Step 4: Use routes here (AFTER middleware)
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
//app.use('/api/orders', orderRoutes);

app.use('/api/orders', (req, res, next) => {
  console.log('🔍 Middleware hit for /api/orders', req.method, req.url ,req.headers);
  next();
}, orderRoutes);

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const router = express.Router();
/*
router.post('/register', registerUser);
router.post('/login', loginUser);  */
/*
router.put('/set-role', protect,async (req,res) => {
    console.log("🔥 PUT /api/auth/set-role hit!");
  const { userId, role } = req.body;
  console.log('Request body:', req.body);

  try {

    if (!userId || !role || !['freelancer', 'client'].includes(role)) {
      return res.status(400).json({ message: 'Invalid user ID or role' });
    }
    // Verify userId matches the authenticated user
    if (userId.toString() !== req.user.id.toString()){
      return res.status(403).json({ message: 'Unauthorized to update this user' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true , runValidators: true }
    );
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ user: { ...updatedUser.toObject(), token } });
  } catch (err) {
    console.error('Error updating role:', err.message);
    res.status(500).json({ message: 'Failed to set role', error: err.message });
  }
});

export default router;  */

app.use('/api/earnings', earningsRoutes);
app.use('/api/stripe', stripeRoutes);
// Other API routes

app.use('/api/other', otherRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // ✅ Serve uploads



app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes)

//always at last
app.use((req, res) => {
  console.log('🔍 No route matched:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});







const uploadDir = path.join('C:/Projects/workwithtrust/workwithtrust-backend/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📂 Created uploads directory:', uploadDir);
}



;





// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected successfully");
})
.catch((error) => {
  console.error("❌ MongoDB connection failed:", error);
});

// Test Route
app.get('/', (req, res) => {
  res.send('🚀 WorkWithTrust Backend API is Live!');
});


app.get('/debug', (req, res) => {
  res.json({ message: "✅ Backend is working!" });
});



// Create server & bind Socket.io
/*
const httpServer = http.createServer(app);
setupSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

*/

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173',
      'https://workwithtrust-frontend-5z6cru9pp-akhilas-projects-01434bdf.vercel.app/'
    ], // Allow both origins
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Authorization'],
  },
  allowEIO3: true,
});
app.set('socketio', io);
console.log('✅ Socket.IO set on app');

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];

//console.log('Socket token received:', token);
console.log('🔍 Socket handshake:', {
    auth: socket.handshake.auth,
    headers: socket.handshake.headers,
    query: socket.handshake.query,
  });

  if (!token) {
    console.error('❌ Socket connection rejected: Token not provided');
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id role name ').lean();
    if (!user) {
      console.error('❌ Socket connection rejected: User not found', decoded.id);
      return next(new Error('Authentication error'));
    }
    socket.user = user;
    console.log('🔐 Socket authenticated user:', user._id, 'Role:', user.role);
    next();
  } catch (error) {
    console.error('❌ Socket token verification error:', error.name, error.message);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id, 'User:', socket.user?._id);
  socket.on('joinRoom', (room) => {
    if (room && socket.user?._id) {
    socket.join(room);
    console.log('User', socket.user?._id, 'joined room:', room);
    io.to(room).emit('userJoined', { userId: socket.user._id }); // Notify room
    }
    else{
      console.warn('❌ joinRoom failed: Invalid room or user ID');
    }
  });
  socket.on('send-message', (message) => {
    if (message.receiverId && socket.user?._id) {
      io.to(message.receiverId).emit('receiveMessage', message);
    }
  });
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error.message);
  });
});



const PORT =process.env.PORT || 5000;

server.listen(PORT, () => console.log('Server running on port 5000 with Socket.IO'));