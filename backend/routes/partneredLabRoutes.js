const express = require('express');
const router = express.Router();
const {
  getPartneredLabs,
  getPartneredLabById,
  createPartneredLab,
  updatePartneredLab,
  updatePartnershipStatus,
  togglePartneredLabStatus,
  assignHospitalsToLab,
  assignLabsToHospital,
  configureLabTests,
  deletePartneredLab,
} = require('../controllers/partneredLabController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected by admin JWT
router.use(protect);

// Assign multiple partnered labs to one hospital
router.post('/assign-to-hospital', assignLabsToHospital);

// Core CRUD
router.route('/')
  .get(getPartneredLabs)
  .post(createPartneredLab);

router.route('/:id')
  .get(getPartneredLabById)
  .put(updatePartneredLab)
  .delete(deletePartneredLab);

// Specific operational endpoints
router.patch('/:id/partnership-status', updatePartnershipStatus);
router.patch('/:id/status', togglePartneredLabStatus);
router.put('/:id/assign-hospitals', assignHospitalsToLab);
router.put('/:id/tests', configureLabTests);

module.exports = router;
