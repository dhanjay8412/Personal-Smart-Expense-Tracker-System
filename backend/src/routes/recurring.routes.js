const express = require('express');
const router = express.Router();
const recurringController = require('../controllers/recurring.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', recurringController.getRecurringTransactions);
router.post('/', recurringController.createRecurringTransaction);
router.put('/:id', recurringController.updateRecurringTransaction);
router.delete('/:id', recurringController.deleteRecurringTransaction);

module.exports = router;
