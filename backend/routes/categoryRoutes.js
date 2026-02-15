const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');

router.get('/', protect, getAllCategories);
router.get('/:id', protect, getCategoryById);
router.post('/', protect, createCategory);       // Staff + Admin
router.put('/:id', protect, updateCategory);     // Staff + Admin
router.delete('/:id', protect, deleteCategory);  // Staff + Admin

module.exports = router;