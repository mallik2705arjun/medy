const express = require('express');
const router = express.Router();
const {
  createHospital,
  getHospitals,
  getHospitalById,
  getPublicHospitals,
  updateHospitalCardColor,
  updateHospital,
  toggleHospitalStatus,
  deleteHospital,
} = require('../controllers/hospitalController');
const { protect } = require('../middleware/authMiddleware');

// Public route for patient application dropdown
router.get('/public', getPublicHospitals);

// Protected routes for admin portal
router.use(protect);

router.route('/')
  .post(createHospital)
  .get(getHospitals);

router.route('/:id')
  .get(getHospitalById)
  .put(updateHospital)
  .delete(deleteHospital);

router.route('/:id/status')
  .patch(toggleHospitalStatus);

router.route('/:id/card-color')
  .patch(updateHospitalCardColor);

module.exports = router;

