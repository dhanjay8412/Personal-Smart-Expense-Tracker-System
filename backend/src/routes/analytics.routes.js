const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/dashboard', analyticsController.getDashboardOverview);
router.get('/monthly', analyticsController.getMonthlySummary);
router.get('/trends', analyticsController.getAnalyticsTrends);
router.get('/payment-methods', analyticsController.getPaymentMethodAnalytics);
router.get('/spending-trends', analyticsController.getSpendingTrendDetection);

module.exports = router;
