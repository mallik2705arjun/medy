const express = require('express');
const router = express.Router();
const {
  applyForCard,
  registerPatient,
  getPatients,
  rejectApplication,
  checkApplicationStatus,
  checkRegisteredPatient,
  updatePatientBiomarkers,
  getBiomarkersSummary,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

// Public patient endpoints
router.post('/apply', applyForCard);
router.get('/status', checkApplicationStatus);
router.get('/check-registered', checkRegisteredPatient);

// Protected admin endpoints
router.use(protect);
router.get('/biomarkers/summary', getBiomarkersSummary);
router.put('/:id/biomarkers', updatePatientBiomarkers);
router.route('/')
  .post(registerPatient)
  .get(getPatients);

router.patch('/:id/reject', rejectApplication);

module.exports = router;
