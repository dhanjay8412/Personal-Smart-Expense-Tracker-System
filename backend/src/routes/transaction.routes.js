const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createTransactionSchema,
  updateTransactionSchema,
} = require('../validators/transaction.validator');

router.use(protect);

router.get('/', transactionController.getTransactions);
router.post('/import', transactionController.importTransactionsPreview);
router.post('/import/confirm', transactionController.confirmImport);
router.post('/', validate(createTransactionSchema), transactionController.createTransaction);
router.get('/:id', transactionController.getTransactionById);
router.put('/:id', validate(updateTransactionSchema), transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
