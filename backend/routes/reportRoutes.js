const express = require('express');
const router = express.Router();
const { getReportsData } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/analytics', getReportsData);

module.exports = router;

