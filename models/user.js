const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // ✅ uncommented

// Define user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // ✅ fixed spelling
  },
  age: {
    type: Number,
    required: true, // ✅ fixed spelling
  },
  mobile: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: true, // ✅ recommended for login
  },
  address: {
    type: String,
    required: true,
  },
  aadharCardNumber: {
    type: Number, // ✅ fixed 'typeof' → 'type'
    required: true, // ✅ fixed spelling
    unique: true,
  },
  password: {
    type: String,
    required: true, // ✅ fixed spelling
  },
  role: {
    type: String,
    enum: ['voter', 'admin'],
    default: 'voter',
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
});

// 🔐 Hash password before saving
userSchema.pre('save', async function (next) {
  const user = this;

  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (err) {
    next(err);
  }
});

// 🔍 Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;
