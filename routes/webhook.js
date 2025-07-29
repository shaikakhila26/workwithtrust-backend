// routes/webhook.js
import express from 'express';
import stripe from '../utils/stripe.js';
import dotenv from 'dotenv';
import Order from '../models/Order.js';                                                           
dotenv.config();

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 🟡 Debug logs
  console.log("📦 Webhook event received:", event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      await Order.create({
        gig: session.metadata.gigId,
        client: session.metadata.clientId,
        freelancer: session.metadata.freelancerId,
        amount: session.amount_total / 100,
        status: 'in-progress',
      });

      console.log("✅ Order created from Stripe webhook",session.metadata);
    } catch (err) {
      console.error("Order creation error:", err.message);
    }
  }

  res.status(200).json({ received: true });
});

export default router;
