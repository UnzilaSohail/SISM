const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { stockIn, stockOut, getAuditHistory } = require('../controllers/stockController');

router.use(protect);

router.post('/in', stockIn);
router.post('/out', stockOut);
router.get('/history', getAuditHistory);

module.exports = router;