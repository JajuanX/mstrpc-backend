const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visits');

// Routes
router.get('/record/:userName', visitController.recordVisit);
router.get('/:userName', visitController.getVisits);
router.get('/analytics/top-performers', visitController.topVisitedPages);
router.get('/analytics/:userName', visitController.getVisitByPeriod);
router.get('/dummy/:records', visitController.generateDummyData);

module.exports = router;