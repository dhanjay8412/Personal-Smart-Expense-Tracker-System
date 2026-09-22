const express = require('express');
const router = express.Router();
const categorizationController = require('../controllers/categorization.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/suggest', categorizationController.getCategorySuggestion);
router.post('/correct', categorizationController.saveUserCorrection);

module.exports = router;
