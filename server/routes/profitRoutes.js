const express = require('express');
const router = express.Router();
const { calculateProfit } = require('../controllers/profitController');
const { protect } = require('../middleware/auth');

router.post('/calculate', protect, calculateProfit);

module.exports = router;
