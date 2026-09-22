const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', groupController.createGroup);
router.get('/', groupController.getGroups);
router.get('/:id', groupController.getGroupById);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

// Members
router.post('/:id/members', groupController.addMember);
router.delete('/:id/members/:userId', groupController.removeMember);

// Shared Expenses
router.get('/:id/expenses', groupController.getSharedExpenses);
router.post('/:id/expenses', groupController.createSharedExpense);
router.delete('/:id/expenses/:expenseId', groupController.deleteSharedExpense);

// Settlements & Balances
router.get('/:id/balances', groupController.getGroupBalancesData);
router.post('/:id/settlements', groupController.addSettlement);

module.exports = router;
