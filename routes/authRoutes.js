import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/set-role', protect,async (req,res) => {
    console.log("🔥 PUT /api/auth/set-role hit!");
  const { userId, role } = req.body;
  console.log('Request body:', req.body);
  console.log('🔍 Authenticated user:', req.user._id);

  try {

    if (!userId || !role || !['freelancer', 'client'].includes(role)) {
        console.error('❌ Invalid user ID or role:', { userId, role });
      return res.status(400).json({ message: 'Invalid user ID or role' });
    }
    // Verify userId matches the authenticated user
    if (userId.toString() !== req.user.id.toString()){
      console.error('❌ Unauthorized: userId does not match authenticated user', {
        userId,
        authUserId: req.user._id,
      });
      return res.status(403).json({ message: 'Unauthorized to update this user' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true , runValidators: true }
    );
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign({ id: updatedUser._id ,role: updatedUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ user: updatedUser.toObject(), token });
  } catch (err) {
    console.error('Error updating role:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: err.message });
    }
    res.status(500).json({ message: 'Failed to set role', error: err.message });
  }
});

export default router;
