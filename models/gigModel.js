// models/gigModel.js
import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true },
  deliveryTime: { type: Number, required: true ,min:1 },
  images: {
  type: [String],
  default: []
},
video:String,
freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User',required:true },
  category: { type: String, required: true },
}, { timestamps: true
});

const Gig = mongoose.models.Gig || mongoose.model('Gig', gigSchema);


export default Gig;
