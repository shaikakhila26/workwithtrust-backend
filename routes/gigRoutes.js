import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import upload from '../middleware/upload.js';
import { createGig, getAllGigs, updateGig, deleteGig, getUserGigs, getGigCategories, getGigById,getGigsByUser } from '../controllers/gigController.js';
import { protect, isFreelancer } from '../middleware/authMiddleware.js';
import Gig from '../models/gigModel.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';





const router = express.Router();
// nst upload = multer({ dest: 'uploads/' });

// Public route to fetch all gigs
router.get('/', getAllGigs);


// Public route to fetch gig categories
router.get('/categories', getGigCategories);

// Public route to fetch a single gig by ID
router.get('/:id', getGigById);



// Fetch gigs by user ID
/*
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Fetching gigs for user:", userId);
    const gigs = await Gig.find({ freelancer: userId }).populate('freelancer', 'name email profilePic bio');
    res.json(gigs);
  } catch (error) {
    console.error('Error fetching user gigs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});*/

router.get('/user/:userId', getGigsByUser);
/*
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching gigs for user:', userId);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid User ID format:', userId);
      return res.status(400).json({ message: 'Invalid User ID format' });
    }
    // Convert userId to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);

    // Verify user exists
    const user = await User.findById(objectId);
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
*/
    // Verify Gig model is defined
    /*
    if (!Gig) {
      console.error('Gig model is not defined');
      return res.status(500).json({ message: 'Server error: Gig model not defined' });
    }  */

    // Protected routes (freelancer only)
router.post('/', protect, isFreelancer,upload.fields([{name: 'image', maxCount: 5}, {name: 'images', maxCount: 1}]), createGig);
router.put('/:id', protect, isFreelancer,upload.fields([{name: 'image', maxCount: 5}, {name: 'images', maxCount: 1}]), updateGig);
router.delete('/:id', protect, isFreelancer, deleteGig);
router.get('/my-gigs', protect, isFreelancer, getUserGigs);

    // Fetch gigs
    /*
    console.log('Querying gigs for freelancer:', userId);
    const gigs = await Gig.find({ freelancer: objectId }).populate('freelancer', 'name email role profilePic bio');
    console.log('Gigs found:', gigs);  */
/*
    res.json(gigs);
  } catch (error) {
    console.error('Error fetching user gigs:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});*/

export default router;