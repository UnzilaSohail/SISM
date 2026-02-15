const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAllSales, getSaleById, createSale, updateSaleStatus, deleteSale, getSalesReport } = require('../controllers/saleController');

router.use(protect);

router.get('/', getAllSales);
router.get('/report', getSalesReport);
router.post('/', createSale);
router.get('/:id', getSaleById);
router.put('/:id', updateSaleStatus);
router.delete('/:id', deleteSale);

module.exports = router;