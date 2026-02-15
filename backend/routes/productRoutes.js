const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getLowStockProducts } = require('../controllers/productController');

router.get('/', protect, getAllProducts);
router.get('/low-stock', protect, getLowStockProducts);
router.get('/:id', protect, getProductById);
router.post('/', protect, createProduct);    // Staff + Admin
router.put('/:id', protect, updateProduct);  // Staff + Admin
router.delete('/:id', protect, deleteProduct); // Staff + Admin

module.exports = router;