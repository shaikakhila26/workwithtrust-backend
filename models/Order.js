import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gigTitle:String,
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress',
  },
  reviewId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Review',
    default:null,
  },
  sessionId: { // Add this field
      type: String,
      required: true,
    },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
