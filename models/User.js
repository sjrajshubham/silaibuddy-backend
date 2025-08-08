const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['customer','tailor','admin'], default: 'customer' },
  location: { type: { type: String, default: 'Point' }, coordinates: { type: [Number], default: [0,0] } },
  services: [String],
  pricing: String,
  photos: [String],
  status: { type: String, enum: ['pending','approved','rejected'], default: function(){ return this.role==='tailor'?'pending':'approved' } },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  // Email verification & password reset fields
  isVerified: { type: Boolean, default: false },
  verifyToken: String,
  resetToken: String,
  resetExpires: Date
});
UserSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('User', UserSchema);
