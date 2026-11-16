const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getHospitalAdmins,
  getHospitalAdminById,
  createHospitalAdmin,
  updateHospitalAdmin,
  toggleHospitalAdminStatus,
  deleteHospitalAdmin,
} = require('../controllers/hospitalAdminController');

// All hospital admin routes require authentication (Super Admin)
router.use(protect);

router.route('/')
  .get(getHospitalAdmins)
  .post(createHospitalAdmin);

router.route('/:id')
  .get(getHospitalAdminById)
  .put(updateHospitalAdmin)
  .delete(deleteHospitalAdmin);

router.route('/:id/status')
  .patch(toggleHospitalAdminStatus);

module.exports = router;

