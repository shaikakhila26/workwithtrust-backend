
/*

import express from 'express';
import stripe from '../utils/stripe.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { gigId, title, amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: title,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5173/success?gigId=${gigId}`,
      cancel_url: `http://localhost:5173/cancel`,
      metadata: {
        gigId,
        buyerId: req.user._id,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ message: "Checkout session failed" });
  }
});

export default router;
 
*/