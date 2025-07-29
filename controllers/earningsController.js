import Order from '../models/Order.js';

export const getTotalEarnings = async (req, res) => {
  try {
    const freelancerId = req.user._id;

    const completedOrders = await Order.find({
      freelancer: freelancerId,
      status: 'completed'
    });

    const total = completedOrders.reduce((sum, order) => sum + order.amount, 0);

    res.status(200).json({ total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch earnings', error: err.message });
  }
};
