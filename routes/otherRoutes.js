// routes/orderRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';

const router = express.Router();

// 👇 Get all orders for buyer or freelancer
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'freelancer'
      ? { freelancer: req.user._id }
      : { buyer: req.user._id };

    const orders = await Order.find(query)
      .populate('gig')
      .populate('freelancer', 'username email')
      .populate('buyer', 'username email');

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

export default router;
