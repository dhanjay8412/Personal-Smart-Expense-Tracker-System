const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', calendarController.getCalendarSummary);

module.exports = router;
