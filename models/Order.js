const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tailor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: String,
  status: { type: String, enum: ['placed','accepted','rejected','completed'], default: 'placed' },
  address: String,
  price: Number,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', OrderSchema);
