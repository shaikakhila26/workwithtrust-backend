import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getTotalEarnings } from '../controllers/earningsController.js';

const router = express.Router();

router.get('/total', protect, getTotalEarnings);

export default router;
