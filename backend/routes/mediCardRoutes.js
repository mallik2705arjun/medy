const express = require('express');
const router = express.Router();
const {
  createCard,
  issueCardsToHospital,
  assignPatientToCard,
  getCards,
  getHospitalAllocations,
  getCardById,
  updateCardStatus,
  assignHospital,
} = require('../controllers/mediCardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All MediCard routes require admin authentication

router.route('/')
  .post(createCard)
  .get(getCards);

router.route('/issue-to-hospital')
  .post(issueCardsToHospital);

router.route('/hospital-allocations')
  .get(getHospitalAllocations);

router.route('/:id')
  .get(getCardById);

router.route('/:id/status')
  .patch(updateCardStatus);

router.route('/:id/assign')
  .patch(assignHospital);

router.route('/:id/assign-patient')
  .patch(assignPatientToCard);

module.exports = router;
