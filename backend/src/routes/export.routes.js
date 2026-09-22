const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/csv', exportController.exportCSV);
router.get('/pdf', exportController.exportPDF);

module.exports = router;
