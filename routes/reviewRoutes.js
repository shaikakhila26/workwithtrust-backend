// routes/orderRoutes.js (or routes/reviewRoutes.js)
import express from 'express';

import { createReview, getReviewsByGig } from '../controllers/reviewController.js'; // Updated import
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:gigId',protect, createReview); // Updated to use createReview
router.get('/:gigId', getReviewsByGig);

export default router;