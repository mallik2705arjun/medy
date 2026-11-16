const express = require('express');
const router = express.Router();
const {
  getLabTests,
  getCatalog,
  getLabTestById,
  createLabTest,
  updateLabTestStatus,
  deleteLabTest,
  addCatalogTest,
  deleteCatalogTest,
  seedDemoLabTests,
} = require('../controllers/labTestController');
const { protect } = require('../middleware/authMiddleware');

router.route('/catalog')
  .get(getCatalog)
  .post(protect, addCatalogTest);

router.delete('/catalog/:id', protect, deleteCatalogTest);

router.use(protect);

router.post('/seed-demo', seedDemoLabTests);

router.route('/')
  .get(getLabTests)
  .post(createLabTest);

router.route('/:id')
  .get(getLabTestById)
  .delete(deleteLabTest);

router.patch('/:id/status', updateLabTestStatus);

module.exports = router;
