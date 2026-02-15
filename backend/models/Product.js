const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please add a category']
    },
    price: {
      type: Number,
      required: [true, 'Please add a price']
    },
    quantity: {
      type: Number,
      required: [true, 'Please add quantity'],
      default: 0
    },
    reorderLevel: {
      type: Number,
      default: 10
    },
    description: {
      type: String,
      trim: true
    },
    sku: {
      type: String,
      unique: true,
      sparse: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);