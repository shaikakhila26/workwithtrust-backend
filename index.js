// index.js

import express from 'express';
import http from 'http';
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
 'https://workwithtrust-frontend.vercel.app',
 'http://localhost:3000',
 'http://localhost:5173'
]
// Middleware
app.use(cors({
  origin:(origin, callback) => {
    console.log('🔍 Checking Express origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'OPTIONS','PUT','DELETE'], // Include OPTIONS for preflight
  allowedHeaders: ['Authorization', 'Content-Type'],
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




app.use('/api/reviews', reviewRoutes)









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


app.head('/', (req, res) => {
  res.status(200).send(); // Empty response for HEAD
});
// Test Route
app.get('/', (req, res) => {
  res.send('🚀 WorkWithTrust Backend API is Live!');
});


app.get('/debug', (req, res) => {
  res.json({ message: "✅ Backend is working!" });
});

//always at last
app.use((req, res) => {
  console.log('🔍 No route matched:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
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
const io = setupSocket(server);
app.set('socketio', io);
console.log('✅ Socket.IO set on app');






server.listen(process.env.PORT, () => console.log('Server running on port ${process.env.PORT} with Socket.io'));