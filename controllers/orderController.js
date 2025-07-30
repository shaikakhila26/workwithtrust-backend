// controllers/orderController.js
import Order from '../models/Order.js';
import Gig from '../models/gigModel.js';

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    console.log("📌 getUserOrders() role:", req.user.role);
    console.log("Incoming token:", req.headers.authorization);
    console.log("Req.user:", req.user);

    if (!role) return res.status(400).json({ message: 'User role not found' });

    let orders;
    if (role === 'freelancer') orders = await Order.find({ freelancer: userId });
    else if (role === 'client') orders = await Order.find({ client: userId });
    else return res.status(403).json({ message: 'Unauthorized role' });

    console.log('Raw orders before population:', orders); // Debug: Log raw orders

    const populatedOrders = await Order.populate(orders, [
      { path: 'gig', select: 'title _id' }, // Include _id for gigId
      { path: 'freelancer', select: 'name' },
    ]);

    console.log('Populated orders:', populatedOrders); // Debug: Log populated orders

    const formatted = populatedOrders.map(order => {
      console.log('Mapping order:', order._id, 'Gig:', order.gig); // Debug each order
      if (!order.gig) {
        console.warn(`Order ${order._id} has no associated gig. Skipping.`);
        return null; // Skip orders with no gig
      }
      return {
        _id: order._id,
        gigTitle: order.gig?.title || order.gigTitle || 'Untitled',
        freelancerName: order.freelancer?.name || 'N/A',
        amount: order.amount,
        status: order.status,
        gigId: order.gig._id.toString(), // Include gigId from populated gig._id
      };
    }).filter(order => order !== null); // Filter out null entries

    console.log('Formatted orders:', formatted); // Debug: Log final formatted orders

    res.json(formatted.length > 0 ? formatted : []); // Return 200 with empty array if no orders
    
  } catch (err) {
    console.error('error in getUserOrders:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getTotalEarnings = async (req, res) => {
  try {
    const orders = await Order.find({ freelancer: req.user._id, status: 'completed' });
    const total = orders.reduce((sum, order) => sum + order.amount, 0);
    res.json({ total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to calculate earnings', error: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    console.log('Fetching orders for buyer:', req.user._id);
    const orders = await Order.find({ buyer: req.user._id })
      .populate('gig', 'title _id')
      .select('gigTitle amount status reviewId sessionId');
    // This function is not currently used, but kept for reference
    const enrichedOrders = orders.map(order => ({
      _id: order._id,
      gigTitle: order.gigTitle || order.gig?.title || 'Untitled',
      amount: order.amount,
      status: order.status,
      reviewId: order.reviewId,
      sessionId: order.sessionId,
      gigId: order.gig?._id?.toString() || null,
    })).filter(order => order.gigId !== null);
    if (enrichedOrders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }
    res.json(enrichedOrders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};





















/*

import Order from '../models/Order.js';
import Gig from '../models/gigModel.js';


export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    console.log("📌 getUserOrders() role:", req.user.role);
    console.log("Incoming token:", req.headers.authorization);
    console.log("Req.user:", req.user);

    if (!role) return res.status(400).json({ message: 'User role not found' });

    let orders;
    if (role === 'freelancer') orders = await Order.find({ freelancer: userId });
    else if (role === 'client') orders = await Order.find({ client: userId });
    else return res.status(403).json({ message: 'Unauthorized role' });

    console.log('Raw orders before population:', orders); // Debug: Log raw orders


    const populatedOrders = await Order.populate(orders, [
      { path: 'gig', select: 'title _id' }, 
      { path: 'freelancer', select: 'name' },
    ]);
    console.log('Populated orders:', populatedOrders); // Debug: Log populated orders

    const formatted = populatedOrders.map(order => ({
      _id: order._id,
      gigTitle: order.gig?.title || 'Untitled',
      freelancerName: order.freelancer?.name || 'N/A',
      amount: order.amount,
      status: order.status,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('error in getUserOrders:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getTotalEarnings = async (req, res) => {
  try {
    const orders = await Order.find({ freelancer: req.user._id, status: 'completed' });
    const total = orders.reduce((sum, order) => sum + order.amount, 0);
    res.json({ total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to calculate earnings', error: err.message });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    console.log('Fetching orders for buyer:', req.user._id);
    const orders = await Order.find({ buyer: req.user._id })
      .populate('gig', 'title _id') // Populate gig with title and _id
      .select('gigTitle amount status reviewId sessionId'); // Select relevant fields

      console.log('Raw orders from DB:', orders); // Debug: Log raw orders before mapping

    // Map to include gigId, handling population explicitly
    const enrichedOrders = orders.map(order => {
      console.log('Processing order:', order._id, 'Gig:', order.gig); // Debug each order
      if (!order.gig) {
        console.warn(`Order ${order._id} has no associated gig. Skipping.`);
        return null; // Skip orders with no gig
      }
      return {
        _id: order._id,
        gigTitle: order.gigTitle || order.gig.title || 'Untitled',
        amount: order.amount,
        status: order.status,
        reviewId: order.reviewId,
        sessionId: order.sessionId,
        gigId: order.gig._id.toString(), // Explicitly set gigId from populated gig._id
      };
    }).filter(order => order !== null); // Filter out null entries

    console.log('Enriched orders:', enrichedOrders); // Debug: Log final enriched orders

    if (enrichedOrders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.json(enrichedOrders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};


*/