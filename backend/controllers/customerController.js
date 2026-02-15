const Customer = require('../models/Customer');

exports.getAllCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = { isActive: true };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }];
    const skip = (page - 1) * limit;
    const customers = await Customer.find(query).limit(parseInt(limit)).skip(skip).sort({ createdAt: -1 });
    const total = await Customer.countDocuments(query);
    res.status(200).json({ success: true, count: customers.length, total, page: parseInt(page), pages: Math.ceil(total / limit), data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address, city } = req.body;
    if (!name || !phone) return res.status(400).json({ success: false, message: 'Please provide name and phone' });
    const customer = await Customer.create({ name, email, phone, address, city });
    res.status(201).json({ success: true, message: 'Customer created successfully', data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address, city, isActive } = req.body;
    const customer = await Customer.findByIdAndUpdate(req.params.id, { name, email, phone, address, city, isActive }, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.status(200).json({ success: true, message: 'Customer updated successfully', data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};