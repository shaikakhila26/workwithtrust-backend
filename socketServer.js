import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/userModel.js";
import { configDotenv } from "dotenv";

configDotenv();

export const userSocketMap = {}; // userId -> socketId
export let io;

export const setupSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"], // Allow both origins
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Authorization"],
    },
    allowEIO3: true,
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];
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
      const user = await User.findById(decoded.id).select('_id role').lean();
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

  io.on("connection", (socket) => {
    if (socket.user?._id) {
      userSocketMap[socket.user._id] = socket.id;
      console.log(`✅ User ${socket.user._id} connected with socket ID ${socket.id}`);
    }

    socket.on('joinRoom', (room) => {
      if (room && socket.user?._id) {
        socket.join(room);
        console.log('User', socket.user._id, 'joined room:', room);
        io.to(room).emit('userJoined', { userId: socket.user._id });
      } else {
        console.warn('❌ joinRoom failed: Invalid room or user ID');
      }
    });

    socket.on('send-message', (message) => {
      if (message.receiverId && socket.user?._id) {
        const receiverSocketId = userSocketMap[message.receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', message);
          console.log(`📡 Emitting message to ${receiverSocketId}`);
        } else {
          console.log('🚫 Receiver not connected:', message.receiverId);
        }
      } else {
        console.warn('❌ send-message failed: Invalid message or user ID');
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
      if (socket.user?._id) {
        delete userSocketMap[socket.user._id];
      }
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error.message);
    });
  });

  return io;
};













/*
import { Server } from "socket.io";
import http from "http";


import jwt from "jsonwebtoken";
import User from "./models/userModel.js"; // Adjust path as needed
import { configDotenv } from "dotenv";
configDotenv();


export const userSocketMap = {}; // userId -> socketId
export let io;

export const setupSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
     origin: "http://localhost:5173", // match your frontend
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    const token = socket.handshake.auth?.token;

    try {
      if (!token) throw new Error("Token not provided");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      userSocketMap[userId] = socket.id;
      console.log(`✅ User ${userId} connected with socket ID ${socket.id}`);

      socket.on("disconnect", () => {
        console.log(`❌ User ${userId} disconnected`);
        delete userSocketMap[userId];
      });
    } catch (err) {
      console.log("❌ Socket connection rejected:", err.message);
      socket.disconnect();
    }
  });
};
*/