import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    slect :false
  },
  role: {
  type: String,
  enum: ['client', 'freelancer'],
  default: null, // or '' if you prefer
},
service: { type: String },
  budget: { type: String },
  startTime: { type: String },
profilePic: {type:String,default:''},
  bio:{type: String,default:''}
  
},
 { timestamps: true });
 /*
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

*/

const User = mongoose.model('User', userSchema);

export default User;
