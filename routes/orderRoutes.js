import express from 'express';
import { protect, isFreelancer } from '../middleware/authMiddleware.js';
import { getUserOrders, getTotalEarnings } from '../controllers/orderController.js';
import { createReview , getReviewsByGig } from '../controllers/reviewController.js'; // New controller function

import Order from '../models/Order.js';
import Gig from '../models/gigModel.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config(); 

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get all orders for the logged-in freelancer
 
  router.get('/my-orders', protect, getUserOrders);

// Get freelancer's orders
router.get('/freelancer', protect, isFreelancer, async (req, res) => {
  console.log('🔥 GET /api/orders/freelancer hit!');
  console.log('🔍 Authenticated user:', req.user._id);

  try {
    const orders = await Order.find({ freelancer: req.user._id })
      .populate('client', 'name email')
      .populate('gig', 'title');
    console.log('✅ Fetched orders:', orders.length);
    res.json(orders);
  } catch (err) {
    console.error('❌ Error fetching freelancer orders:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

// Update order status
router.put('/freelancer/:id', protect, isFreelancer, async (req, res) => {
  console.log('🔥 PUT /api/orders/freelancer/:id hit!');
  const { id } = req.params;
  const { status } = req.body;
  console.log('🔍 Request body:', { status });
  console.log('🔍 Authenticated user:', req.user._id);

  try {
    if (!['in-progress', 'completed'].includes(status)) {
      console.error('❌ Invalid status:', status);
      return res.status(400).json({ message: 'Invalid status. Must be in-progress or completed' });
    }

    const order = await Order.findById(id);
    if (!order) {
      console.error('❌ Order not found:', id);
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.freelancer.toString() !== req.user._id.toString()) {
      console.error('❌ Unauthorized: User is not the freelancer', {
        userId: req.user._id,
        freelancerId: order.freelancer,
      });
      return res.status(403).json({ message: 'Unauthorized to update this order' });
    }

    order.status = status;
    await order.save();

    console.log('✅ Order updated:', order);
    res.json(order);
  } catch (err) {
    console.error('❌ Error updating order:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
});




// Get total earnings (sum of completed order prices)
router.get('/earnings/total', protect, isFreelancer, getTotalEarnings);

// Create a new order
/*
router.post('/orders', protect, async (req, res) => {
  try {
    const { gigId ,sessionId} = req.body;
    const userId = req.user._id;
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    const order = new Order({
      gig: gigId,
      client: req.user._id,
      freelancer: gig.freelancer,
      amount: gig.amount,
      status: req.body.status || 'in-progress',
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
});
*/

router.post('/', protect, async (req, res) => {
 console.log('🔍 Received POST request to /api/orders', {
    method: req.method,
    url: req.url,
    body: req.body,
    userId: req.user?._id,
    Headers: req.headers,
  }); // Enhanced debug log
 
  const { gigId, sessionId } = req.body;
  const userId = req.user._id;

  try {
    const gig = await Gig.findById(gigId).populate('freelancer');
    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    // Verify payment status with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not confirmed' });
    }

    // Check if order already exists to avoid duplicates
    const existingOrder = await Order.findOne({ gigId, client: userId, sessionId });
    if (existingOrder) {
      return res.status(400).json({ message: 'Order already processed' });
    }

    const order = new Order({
      gig: gigId,
      client: userId,
      freelancer: gig.freelancer._id,
      amount: gig.amount || 0,
      status: 'in-progress',
      sessionId, // Store sessionId for reference
    });

    await order.save();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
    console.error('Error creating order:', err);
    if (err.type === 'StripeError') {
      return res.status(400).json({ message: 'Stripe error', error: err.message });
    }
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
});




// routes/orderRoutes.js
/*
router.post("/create", protect, async (req, res) => {
  try {
    const { gigId } = req.body;
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    const order = new Order({
      gig: gigId,
      client: req.user._id,
      freelancer: gig.freelancer,
      amount: gig.amount,
      status: req.body.status || 'in-progress',
      
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to create order" });
  }
});
*/

// Confirm order after successful payment
/*
router.post('/', protect, async (req, res) => {
  try {
    const { gigId, sessionId } = req.body;
    const userId = req.user._id;

    console.log('Confirming order for user:', userId, 'Session:', sessionId);

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    const order = await Order.findOneAndUpdate(
      { gig: gigId, client: userId, sessionId, status: 'pending' },
      { status: 'completed' },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Order confirmed', order });
  } catch (err) {
    console.error('Order confirmation error:', err);
    res.status(500).json({ message: 'Failed to confirm order', error: err.message });
  }
});
*/





// GET /api/orders
router.get('/',protect, async (req, res) => {
  try {
    const orders = await Order.find().populate('gig client freelancer');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});







export default router;
