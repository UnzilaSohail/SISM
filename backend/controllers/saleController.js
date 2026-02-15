const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const StockAudit = require('../models/StockAudit');
const { generateInvoiceNumber } = require('../utils/helpers');

exports.getAllSales = async (req, res, next) => {
  try {
    const { customer, status, page = 1, limit = 10, startDate, endDate } = req.query;
    let query = {};
    if (customer) query.customer = customer;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    const skip = (page - 1) * limit;
    const sales = await Sale.find(query).populate('customer').populate('items.product').populate('createdBy', 'name').limit(parseInt(limit)).skip(skip).sort({ createdAt: -1 });
    const total = await Sale.countDocuments(query);
    res.status(200).json({ success: true, count: sales.length, total, page: parseInt(page), pages: Math.ceil(total / limit), data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('customer').populate('items.product').populate('createdBy', 'name');
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSale = async (req, res, next) => {
  try {
    const { customer, items, tax = 0, discount = 0, paymentMethod = 'cash', notes } = req.body;
    if (!customer || !items || items.length === 0) return res.status(400).json({ success: false, message: 'Please provide customer and items' });
    const customerExists = await Customer.findById(customer);
    if (!customerExists) return res.status(404).json({ success: false, message: 'Customer not found' });
    let subtotal = 0;
    const saleItems = [];
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      if (product.quantity < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      saleItems.push({ product: item.product, quantity: item.quantity, price: product.price, total: itemTotal });
      product.quantity -= item.quantity;
      await product.save();
      await StockAudit.create({ product: item.product, type: 'out', quantity: item.quantity, reason: 'sale', createdBy: req.user.id });
    }
    const taxAmount = subtotal * (tax / 100);
    const totalAmount = subtotal + taxAmount - discount;
    const sale = await Sale.create({ invoiceNumber: generateInvoiceNumber(), customer, items: saleItems, subtotal, tax: taxAmount, discount, totalAmount, paymentMethod, notes, createdBy: req.user.id });
    customerExists.totalPurchases += 1;
    customerExists.totalAmount += totalAmount;
    await customerExists.save();
    const populatedSale = await Sale.findById(sale._id).populate('customer').populate('items.product').populate('createdBy', 'name');
    res.status(201).json({ success: true, message: 'Sale created successfully', data: populatedSale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSaleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const sale = await Sale.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true }).populate('customer').populate('items.product').populate('createdBy', 'name');
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.status(200).json({ success: true, message: 'Sale status updated successfully', data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    if (sale.status !== 'cancelled') {
      for (let item of sale.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }
    }
    await Sale.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { status: 'completed' };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    const sales = await Sale.find(query);
    const totalSales = sales.length;
    const totalAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalTax = sales.reduce((sum, sale) => sum + sale.tax, 0);
    const totalDiscount = sales.reduce((sum, sale) => sum + sale.discount, 0);
    res.status(200).json({ success: true, data: { totalSales, totalAmount, totalTax, totalDiscount, averageSale: totalSales > 0 ? totalAmount / totalSales : 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};