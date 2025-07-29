// controllers/reviewController.js
import Review from '../models/Review.js';
import Gig from '../models/gigModel.js';
import Order from '../models/Order.js';

export const createReview = async (req, res) => {
  console.log('🔥 POST /api/reviews/:gigId hit!');
  const { rating, comment } = req.body;
  const { gigId } = req.params;
  const userId = req.user._id;

  try {
    // Validate gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      console.error('❌ Gig not found:', gigId);
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Validate input
    if (!rating || !comment) {
      console.error('❌ Missing rating or comment');
      return res.status(400).json({ message: 'Rating and comment are required' });
    }
    if (rating < 1 || rating > 5) {
      console.error('❌ Invalid rating:', rating);
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if the order exists, belongs to the user, is completed, and has no review
    const order = await Order.findOne({ gig: gigId, client: userId, status: 'completed' });
    if (!order) {
      console.error('❌ Order not found or not completed for user:', userId);
      return res.status(404).json({ message: 'Order not found or not completed' });
    }
    if (order.reviewId) {
      console.error('❌ Review already submitted for order:', order._id);
      return res.status(400).json({ message: 'Review already submitted for this order' });
    }

    // Create new review
    const review = new Review({
      rating,
      comment,
      userId,
      gigId,
    });

    const savedReview = await review.save();
    console.log('✅ Review saved:', savedReview._id);

    // Update the order with the reviewId
    order.reviewId = savedReview._id;
    await order.save();
    console.log('✅ Order updated with reviewId:', order._id);

    res.status(201).json({ message: 'Review submitted successfully', review: savedReview });
  } catch (err) {
    console.error('❌ Error creating review:', err.message);
    res.status(500).json({ message: 'Failed to create review', error: err.message });
  }
};

export const getReviewsByGig = async (req, res) => {
  console.log('🔥 GET /api/reviews/:gigId hit!');
  const { gigId } = req.params;

  try {
    const reviews = await Review.find({ gigId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    console.log('✅ Fetched reviews:', reviews.length);
    res.json(reviews);
  } catch (err) {
    console.error('❌ Error fetching reviews:', err.message);
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
};