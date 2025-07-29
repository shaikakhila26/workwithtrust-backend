
import Gig from '../models/gigModel.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import Order from '../models/Order.js'; // assuming you forgot this import


export const getGigCategories = async (req, res) => {
  try {
    console.log('Received request for /api/gigs/categories');
    if (!Gig) {
      console.error('Gig model is not defined');
      return res.status(500).json({ message: 'Server error: Gig model not defined' });
    }
    console.log('Fetching gig categories');
    const categories = await Gig.distinct('category');
    console.log('Categories found:', categories);
    if (!categories || categories.length === 0) {
      console.log('No categories found, returning empty array');
      return res.status(200).json([]);
    }
    // Validate categories are strings
  const validCategories = categories.filter(cat => typeof cat === 'string');
    console.log('Valid categories:', validCategories);

    res.status(200).json(categories.length ? categories : []);
  } catch (error) {
    console.error('❌ Error in getGigCategories:', error.message, error.stack);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
/*
export const createGig = async (req, res) => {
  try {
    const { title, description, category, amount, deliveryTime } = req.body;
    let images = [];
    let video = '';
 // const images = req.file ? [req.file.path] : [];

    if (!title || !description || !category || !amount || !deliveryTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

      // Handle image upload
    if (req.files?.image) {
      if (Array.isArray(req.files.image)) {
        for (const file of req.files.image) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'gigs',
          });
          images.push(result.secure_url);
        }
      } else {
        const result = await cloudinary.uploader.upload(req.files.image.path, {
          folder: 'gigs',
        });
        images.push(result.secure_url);
      }
    }

    // Handle video upload
    if (req.files?.video) {
      const videoResult = await cloudinary.uploader.upload(req.files.video.path, {
        resource_type: 'video',
        folder: 'gigs',
      });
      video = videoResult.secure_url;
    }


    const gig = new Gig({
      title,
      description,
      category,
      amount,
      deliveryTime,
      images,
      freelancer: req.user._id,
    });

    await gig.save();
    res.status(201).json(gig);
  } catch (error) {
    console.error('❌ Error in createGig:', error.message, error.stack);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
*/

export const createGig = async (req, res) => {
  try {
    console.log('🔍 createGig - User:', req.user._id, 'Role:', req.user.role);
    console.log('🔍 createGig - Body:', req.body);
    console.log('🔍 createGig - Files:', req.files);
    const { title, description, category, amount, deliveryTime, images, video } = req.body;

    if (!title || !description || !category || !amount || !deliveryTime) {
      console.error('❌ Missing required fields:', { title, description, category, amount, deliveryTime });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate images and video (optional)
    const imageArray = Array.isArray(images) ? images : images ? [images] : [];
    const videoUrl = video || '';

    const gig = new Gig({
      title,
      description,
      category,
      amount: Number(amount),
      deliveryTime: Number(deliveryTime),
      images: imageArray,
      video: videoUrl,
      freelancer: req.user._id,
    });

    const savedGig = await gig.save();
    console.log('✅ Gig created:', savedGig);
    res.status(201).json(savedGig);
  } catch (error) {
    console.error('❌ Error in createGig:', error.message, error.stack);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};




export const getAllGigs = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    if (!Gig) {
      console.error('Gig model is not defined');
      return res.status(500).json({ message: 'Server error: Gig model not defined' });
    }
    console.log('Fetching gigs with query:', query);
    const gigs = await Gig.find(query).populate('freelancer', '_id name role profilePic bio');
    console.log('Gigs fetched:', gigs.length);
    res.status(200).json(gigs);
  } catch (err) {
    console.error('❌ Error in getAllGigs:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to fetch gigs', error: err.message });
  }
};


/*

export const updateGig = async (req, res) => {
  try {
    console.log('Updating gig with ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.files);
    console.log('Authenticated user:', req.user);
    console.log('MongoDB connection state:', mongoose.connection.readyState); // 1 = connected, 0 = disconnected

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('Invalid gig ID:', req.params.id);
      return res.status(400).json({ message: 'Invalid gig ID' });
    }

    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      console.error('Gig not found:', req.params.id);
      return res.status(404).json({ message: 'Gig not found' });
    }

    console.log('Gig found:', gig);

    if (gig.freelancer.toString() !== req.user._id.toString()) {
      console.error('Unauthorized: User cannot update this gig', { userId: req.user._id, gigFreelancer: gig.freelancer });
      return res.status(403).json({ message: 'You can only update your own gigs' });
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      amount: parseFloat(req.body.amount),
      deliveryTime: parseInt(req.body.deliveryTime, 10),
    };
/*
    if (req.file) {
      updateData.image = req.file.path;
    } */
/*
      if (req.file) {
      const imagePath = req.file.path.replace(/\\/g, '/'); // Normalize path for consistency
      updateData.images = gig.images || []; // Ensure images is an array
      updateData.images.push(imagePath); // Append new image
      */
    // Handle image upload
    /*
    if (req.files?.image) {
      const images = gig.images || [];
      if (Array.isArray(req.files.image)) {
        for (const file of req.files.image) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'gigs',
          });
          images.push(result.secure_url);
        }
      } else {
        const result = await cloudinary.uploader.upload(req.files.image.path, {
          folder: 'gigs',
        });
        images.push(result.secure_url);
      }
      updateData.images = images;


      console.log('Updated images array:', updateData.images);
    }

    console.log('Update data:', updateData);

      // Handle video upload
    if (req.files?.video) {
      const videoResult = await cloudinary.uploader.upload(req.files.video.path, {
        resource_type: 'video',
        folder: 'gigs',
      });
      updateData.video = videoResult.secure_url;
      console.log('Updated video URL:', updateData.video);
    } else if (req.body.video) {
      // Allow updating video URL manually (optional)
      updateData.video = req.body.video;
    }


    const updatedGig = await Gig.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log('Gig updated:', updatedGig);
    res.status(200).json(updatedGig);
  } catch (err) {
    console.error('❌ Update gig error:', err.message);
    res.status(500).json({ message: `Failed to update gig: ${err.message}` });
  }
};

*/



export const updateGig = async (req, res) => {
  try {
    const gigId = req.params.id;
    console.log('🔍 Updating gig with ID:', gigId);
    console.log('🔍 Request body:', req.body);
    console.log('🔍 Authenticated user:', req.user._id, 'Role:', req.user.role);

    if (!mongoose.Types.ObjectId.isValid(gigId)) {
      console.error('❌ Invalid gig ID:', gigId);
      return res.status(400).json({ message: 'Invalid gig ID' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      console.error('❌ Gig not found:', gigId);
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.freelancer.toString() !== req.user._id.toString()) {
      console.error('❌ Unauthorized: User cannot update this gig', {
        userId: req.user._id,
        gigFreelancer: gig.freelancer,
      });
      return res.status(403).json({ message: 'You can only update your own gigs' });
    }

    const { title, description, category, amount, deliveryTime, images, video } = req.body;

    // Validate required fields
   if (!title?.trim() || !description?.trim() || !category?.trim()) {
      console.error('❌ Missing required string fields:', { title, description, category });
      return res.status(400).json({ message: 'Title, description, and category are required' });
   }

    // Validate numeric fields
    const parsedAmount = Number(amount);
    const parsedDeliveryTime = Number(deliveryTime);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    if (isNaN(parsedDeliveryTime) || parsedDeliveryTime <= 0) {
      console.error('❌ Invalid deliveryTime:', deliveryTime);
      return res.status(400).json({ message: 'Delivery time must be a positive number' });
    }

    // Validate images
    const imageArray = Array.isArray(images) ? images : images ? [images] : [];

    const updateData = {
      title,
      description,
      category,
      amount: parsedAmount,
      deliveryTime: parsedDeliveryTime,
      images: imageArray,
      video: video || '',
    };

    console.log('🔍 Update data:', updateData);

    const updatedGig = await Gig.findByIdAndUpdate(
      gigId ,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedGig) {
      console.error('❌ Failed to update gig in MongoDB:', gigId);
      return res.status(500).json({ message: 'Failed to update gig in database' });
    }

    console.log('✅ Gig updated:', updatedGig);
    res.status(200).json(updatedGig);
  } catch (err) {
    console.error('❌ Update gig error:', err.message, err.stack);
    res.status(500).json({ message: `Failed to update gig: ${err.message}` });
  }
};








/*
export const updateGig = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, amount, deliveryTime } = req.body;
    const images = req.file ? [req.file.path] : req.body.images;

    console.log('Updating gig with ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const gig = await Gig.findById(id);
    if (!gig) {
      console.error('Gig not found:', req.params.id);
      return res.status(404).json({ message: 'Gig not found' });
    }
    console.log('Gig found:', gig);
    console.log('Authenticated user:', req.user);

    if (gig.freelancer.toString() !== req.user._id.toString()) {
      console.error('Unauthorized: User cannot update this gig', { userId: req.user.id, gigFreelancer: gig.freelancer });
      return res.status(403).json({ message: 'Not authorized to update this gig' });
    }
/*
    gig.title = title || gig.title;
    gig.description = description || gig.description;
    gig.category = category || gig.category;
    gig.amount = amount || gig.amount;
    gig.deliveryTime = deliveryTime || gig.deliveryTime;
    gig.images = images || gig.images;

    await gig.save();
    res.json(gig);
  } catch (error) {
    console.error('❌ Error in updateGig:', error.message, error.stack);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

*//*
const updateData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      amount: parseFloat(req.body.amount),
      deliveryTime: parseInt(req.body.deliveryTime, 10),
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    console.log('Update data:', updateData);

    const updatedGig = await Gig.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log('Gig updated:', updatedGig);
    res.status(200).json(updatedGig);
  } catch (err) {
    console.error('❌ Update gig error:', err.message);
    res.status(500).json({ message: `Failed to update gig: ${err.message}` });
  }
};

*/

/*
export const deleteGig = async (req, res) => {
  try {
    const { id } = req.params;
    const gig = await Gig.findById(id);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this gig' });
    }

    await gig.remove();
    res.json({ message: 'Gig deleted successfully' });
  } catch (error) {
    console.error('❌ Error in deleteGig:', error.message, error.stack);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
*/


export const deleteGig = async (req, res) => {
  try {
    console.log('Deleting gig with ID:', req.params.id);
    console.log('Authenticated user:', req.user);
    console.log('MongoDB connection state:', mongoose.connection.readyState);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('Invalid gig ID:', req.params.id);
      return res.status(400).json({ message: 'Invalid gig ID' });
    }

    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      console.error('Gig not found:', req.params.id);
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.freelancer.toString() !== req.user._id.toString()) {
      console.error('Unauthorized: User cannot delete this gig', { userId: req.user._id, gigFreelancer: gig.freelancer });
      return res.status(403).json({ message: 'You can only delete your own gigs' });
    }

    await Gig.findByIdAndDelete(req.params.id);
    console.log('Gig deleted:', req.params.id);
    res.status(200).json({ message: 'Gig deleted successfully' });
  } catch (err) {
    console.error('❌ Delete gig error:', err.message);
    res.status(500).json({ message: `Failed to delete gig: ${err.message}` });
  }
};













export const getUserGigs = async (req, res) => {
  try {
    if (!Gig) {
      console.error('Gig model is not defined');
      return res.status(500).json({ message: 'Server error: Gig model not defined' });
    }
     console.log('Fetching gigs for user:', req.user._id);
    const gigs = await Gig.find({ freelancer: req.user._id }).populate('freelancer', '_id name role profilePic bio');
    console.log('User gigs fetched:', gigs.length);
    res.json(gigs);
  } catch (error) {
    console.error('❌ Error in getUserGigs:', error.message, error.stack);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};



export const getGigsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching gigs for user:', userId);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid User ID format:', userId);
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    const objectId = new mongoose.Types.ObjectId(userId);
    const user = await User.findById(objectId);
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Querying gigs for freelancer:', userId);
    const gigs = await Gig.find({ freelancer: objectId }).populate('freelancer', 'name email role profilePic bio');
    console.log('Gigs found:', gigs.length);
    res.json(gigs);
  } catch (error) {
    console.error('Error fetching user gigs:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



export const getGigById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Gig ID' });
    }
    if (!Gig) {
      console.error('Gig model is not defined');
      return res.status(500).json({ message: 'Server error: Gig model not defined' });
    }
     console.log('Fetching gig by ID:', id);
    const gig = await Gig.findById(id).populate('freelancer', '_id name role profilePic bio');
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    res.json(gig);
  } catch (error) {
    console.error('❌ Error in getGigById:', error.message, error.stack);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};










/*

ort Gig from '../models/gigModel.js';
import cloudinary from '../config/cloudinary.js';
import Order from '../models/orderModel.js'; // assuming you forgot this import
import User from '../models/User.js';
import mongoose from 'mongoose';




export const createGig = async (req, res) => {
  try {
    const { title, description, category, amount, deliveryTime ,images,video} = req.body;

     // ✅ Validate inputs
    if (!title || !description || !amount || !category || !deliveryTime) {
      return res.status(400).json({ error: 'All fields are required' });
    }
     const freelancerId = new mongoose.Types.ObjectId(req.user._id); // ✅ explicitly convert to ObjectId

  //console.log("DEBUG: Creating gig for freelancer", req.user);
   
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized. Please login.' });
    }

    // ✅ Save gig with secure_url
    const newGig = new Gig({
      title,
      description,
      category,
      amount:Number(amount),
      deliveryTime:Number(deliveryTime),
      images,
       video,
      freelancer: freelancerId, // ✅ now this will work correctly



    });

    console.log("📝 Gig about to save:", {
  title,
  description,
  category,
  amount: Number(amount),
  deliveryTime: Number(deliveryTime),
  freelancer: freelancerId,
});


  const savedGig = await newGig.save();

   console.log("✅ Gig created:", savedGig.freelancer);
    res.status(201).json(savedGig);
  } catch (err) {
    console.error('❌ Error creating gig:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



// 🟢 Get all gigs (public)
export const getAllGigs = async (req, res) => {
  try {
    const gigs = await Gig.find().populate('freelancer','_id name role');
    res.status(200).json(gigs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch gigs', error: err.message });
    console.error('❌ Error in getAllGigs:', err.message);
  }
};

export const getUserGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ freelancer: req.user._id });
    res.json(gigs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your gigs' });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'freelancer') {
      orders = await Order.find({ freelancer: req.user._id });
    } else if (req.user.role === 'client') {
      orders = await Order.find({ client: req.user._id });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

export const getGigCategories = async (req, res) => {
  try {
    // Verify Gig model is defined
    if (!Gig) {
      console.error('Gig model is not defined');
      return res.status(500).json({ message: 'Server error: Gig model not defined' });
    }

    console.log('Fetching gig categories');
    const categories = await Gig.distinct('category');
    console.log('Categories found:', categories);

    if (!categories || categories.length === 0) {
      return res.status(200).json([]); // Return empty array if no categories
    }

    res.json(categories);
  } catch (error) {
    console.error('❌ Error in getGigCategories:', error.message, error.stack);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// Get a single gig by ID with populated freelancer info
/*
export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate({
      path: 'freelancer',
      model: User, // ✅ explicitly mention model
      select: '_id name role profilePic bio'
    });


  //console.log("✅ HIT getGigById route: ", req.params.id);
console.log("✅ Fetched gig with populated freelancer:", gig);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

  // console.log("✅ getGigById called | Populated gig:", gig);
 // console.log("👤 Freelancer populated object:", gig.freelancer);
    res.status(200).json(gig);

  } catch (error) {
    console.error("❌ Error in getGigById:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
*/
/*
export const getGigById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Gig ID format' });
    }

    const gig = await Gig.findById(req.params.id).populate({
      path: 'freelancer',
      model: 'User',
      select: '_id name role profilePic bio',
    });

    console.log('✅ Fetched gig:', gig);
    console.log('✅ Freelancer data:', gig?.freelancer);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    res.status(200).json(gig);
  } catch (error) {
    console.error('❌ Error in getGigById:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};












// ✏️ Update gig (freelancer only)
export const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) return res.status(404).json({ message: 'Gig not found' });
     if (gig.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this gig' });
    }

    const updatedGig = await Gig.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedGig);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update gig', error: err.message });
  }
};

// ❌ Delete gig (freelancer only)
export const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this gig' });
    }

    await gig.deleteOne();
    res.status(200).json({ message: 'Gig deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete gig', error: err.message });
  }
};
*/