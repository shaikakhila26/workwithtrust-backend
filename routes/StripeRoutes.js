// routes/stripeRoutes.js
import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config(); // ensure env variables are loaded

import {protect} from '../middleware/authMiddleware.js';
import Gig from '../models/gigModel.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', protect, async (req, res) => {
  const { gigId } = req.body;
  console.log('Request to create checkout session:', { gigId, userId: req.user?._id , headers: req.headers });
  if (!req.user || !req.user._id) {
    console.log('Unauthorized access attempt:', req.user);
  return res.status(401).json({ message: 'Unauthorized. User not found.' });
}

  const userId = req.user._id;

  try {
    console.log('Authenticated user for purchase:', userId); // Debug
    const gig = await Gig.findById(gigId).populate('freelancer');
    if (!gig) {
        console.error('Gig not found:', gigId);
         return res.status(404).json({ message: 'Gig not found' });
    }

    const rupeeAmount = Math.max(gig.amount, 50); // enforce ₹50 mins
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
    
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: gig.title,
              description: gig.description,
            },
            unit_amount: rupeeAmount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/success?gigId=${gigId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cancel`,
      metadata: {
        clientId: userId.toString(),
        gigId: gig._id.toString(),
        freelancerId:gig.freelancer?._id.toString(),
      },
    });
console.log('gig.freelancer:', gig.freelancer);
console.log('Stripe session created:', session.id );
    

    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe Error:', error.message);
    res.status(500).json({ message: 'Stripe session creation failed' });
  }
});

// 👇 ESM compatible export
export default router;
