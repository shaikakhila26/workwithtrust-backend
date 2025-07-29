import jwt from 'jsonwebtoken';
import User from '../models/User.js';


export const protect = async (req, res, next) => {
  console.log('Incoming request headers:', req.headers.authorization);
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("❌ No valid Authorization header:", authHeader);
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔐 Token received:", token);

    if (!token || token === "undefined") {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("❌ Middleware auth error:", error.message);
    return res.status(401).json({ message: "Token failed", error: error.message });
  }
};









/*
export const protect = async (req, res, next) => {
    console.log('Headers:', req.headers.authorization);
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token from headers:', token);
  }
  else if (req.body.token) {
    token = req.body.token; // Handle token from body if sent this way
    console.log('Token from body:', token);
  }

  if (!token) {
    console.log('❌ No token provided in headers or body');
    return res.status(401).json({ message: '❌ No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      console.error('❌ User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }
    console.log('🔐 Authenticated user:', req.user);
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ message: '❌ Invalid token' });
  }
};

/*
export const isFreelancer = (req, res, next) => {
 if (req.user && req.user.role === 'freelancer') {
    console.log('User is freelancer:', req.user._id);
    next();
  } else {
    console.error('❌ User is not a freelancer:', req.user?.role);
    return res.status(403).json({ message: 'Not authorized, must be a freelancer' });
  }
};
*/

export const isFreelancer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  if (req.user.role === 'freelancer') {
    console.log('User is freelancer:', req.user._id);
    next();
  } else {
    console.error('❌ User is not a freelancer:', req.user.role);
    return res.status(403).json({ message: 'Not authorized, must be a freelancer' });
  }
};

/*

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    // Your JWT logic or any other auth logic here
    // Example:
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
*/

