const StockAudit = require('../models/StockAudit');
const Product = require('../models/Product');

exports.stockIn = async (req, res, next) => {
  try {
    const { product, quantity, reason, reference, notes } = req.body;
    if (!product || !quantity) return res.status(400).json({ success: false, message: 'Please provide product and quantity' });
    const prod = await Product.findById(product);
    if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });
    prod.quantity += parseInt(quantity);
    await prod.save();
    const audit = await StockAudit.create({ product, type: 'in', quantity, reason: reason || 'purchase', reference, notes, createdBy: req.user.id });
    res.status(201).json({ success: true, message: 'Stock in recorded successfully', data: audit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.stockOut = async (req, res, next) => {
  try {
    const { product, quantity, reason, reference, notes } = req.body;
    if (!product || !quantity) return res.status(400).json({ success: false, message: 'Please provide product and quantity' });
    const prod = await Product.findById(product);
    if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });
    if (prod.quantity < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });
    prod.quantity -= parseInt(quantity);
    await prod.save();
    const audit = await StockAudit.create({ product, type: 'out', quantity, reason: reason || 'sale', reference, notes, createdBy: req.user.id });
    res.status(201).json({ success: true, message: 'Stock out recorded successfully', data: audit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAuditHistory = async (req, res, next) => {
  try {
    const { product, type, page = 1, limit = 20 } = req.query;
    let query = {};
    if (product) query.product = product;
    if (type) query.type = type;
    const skip = (page - 1) * limit;
    const audits = await StockAudit.find(query).populate('product').populate('createdBy', 'name').limit(parseInt(limit)).skip(skip).sort({ createdAt: -1 });
    const total = await StockAudit.countDocuments(query);
    res.status(200).json({ success: true, count: audits.length, total, page: parseInt(page), pages: Math.ceil(total / limit), data: audits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};