const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createCategorySchema } = require('../validators/category.validator');

router.use(protect);

router.get('/', categoryController.getCategories);
router.post('/', validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
