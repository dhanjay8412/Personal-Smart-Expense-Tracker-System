const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createBudgetSchema, updateBudgetSchema } = require('../validators/budget.validator');

router.use(protect);

router.get('/', budgetController.getBudgets);
router.post('/', validate(createBudgetSchema), budgetController.createBudget);
router.put('/:id', validate(updateBudgetSchema), budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
