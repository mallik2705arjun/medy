const express = require('express');
const router = express.Router();
const { getAuditLogs, createAuditLog } = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAuditLogs)
  .post(createAuditLog);

module.exports = router;

