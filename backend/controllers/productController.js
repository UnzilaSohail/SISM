const Product = require('../models/Product');
const Category = require('../models/Category');

exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    let query = {};
    if (category) query.category = category;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { sku: { $regex: search, $options: 'i' } }];
    const skip = (page - 1) * limit;
    const products = await Product.find(query).populate('category').limit(parseInt(limit)).skip(skip).sort({ createdAt: -1 });
    const total = await Product.countDocuments(query);
    res.status(200).json({ success: true, count: products.length, total, page: parseInt(page), pages: Math.ceil(total / limit), data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, category, price, quantity, sku, description, reorderLevel } = req.body;
    if (!name || !category || !price) return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(404).json({ success: false, message: 'Category not found' });
    const product = await Product.create({ name, category, price, quantity: quantity || 0, sku, description, reorderLevel: reorderLevel || 10 });
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { name, category, price, quantity, sku, description, reorderLevel, isActive } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { name, category, price, quantity, sku, description, reorderLevel, isActive }, { new: true, runValidators: true }).populate('category');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ $expr: { $lte: ['$quantity', '$reorderLevel'] }, isActive: true }).populate('category').sort({ quantity: 1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};