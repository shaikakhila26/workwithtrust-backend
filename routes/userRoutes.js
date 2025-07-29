import express from 'express';
import User from '../models/userModel.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js'; // ✅ Correct this


const router = express.Router();

// GET /api/users - Get all users except the current user

router.get('/', protect, async (req, res) => {
  
  try {
    console.log('🔍 GET /api/users hit! Authenticated user:', req.user._id);
    const users = await User.find({ _id: { $ne: req.user._id } }).select('_id name');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});



router.put('/:id', protect, async (req, res) => {
  console.log('🔧 PUT /api/users/:id hit!', req.params.id, req.body);
  try {
    const userId = req.params.id;
    const updates = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Ensure the authenticated user can only update their own profile
    if (userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this user' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates }, // Use $set to update only provided fields
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

// Get logged-in user's profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.post('/upload-profile-image', protect, upload.single('image'), async (req, res) => {
  console.log("Uploaded file:", req.file); // 🔍 See what Multer receives
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const imageUrl = `https://workwithtrust-backend.onrender.com/uploads/${req.file.filename}`;
    user.image = imageUrl;
    await user.save();

    res.status(200).json({ imageUrl });
  } catch (err) {
    console.error('❌ Upload failed:', err.message);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});


// routes/userRoutes.js or similar
router.put('/update', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      image: updatedUser.image,
      createdAt: updatedUser.createdAt,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});








export default router;
