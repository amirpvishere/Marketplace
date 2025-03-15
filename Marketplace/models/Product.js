const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String,required: true },
  description: { type: String,required: true },
  price: { type: Number, required: true },
  inStock: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema); 