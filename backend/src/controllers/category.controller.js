const Category = require('../models/Category');
const { DEFAULT_CATEGORIES } = require('../models/Category');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

const getCategories = async (req, res, next) => {
  try {
    const customCategories = await Category.find({ user: req.user._id }).sort({ name: 1 });
    
    // Format default categories as items with isDefault: true
    const defaults = DEFAULT_CATEGORIES.map((cat) => ({
      _id: `default_${cat.name.toLowerCase()}`,
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      isDefault: true,
      user: null,
    }));

    // Merge custom categories with default ones (custom categories can override or add to list)
    const customNames = new Set(customCategories.map((c) => c.name.toLowerCase()));
    const filteredDefaults = defaults.filter((d) => !customNames.has(d.name.toLowerCase()));

    const allCategories = [...filteredDefaults, ...customCategories];

    return res.status(200).json(new ApiResponse(200, allCategories, 'Categories retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, type, icon } = req.body;

    const existingDefault = DEFAULT_CATEGORIES.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (existingDefault) {
      return next(new ApiError(400, `"${name}" is already a default system category.`));
    }

    const existingCustom = await Category.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });
    if (existingCustom) {
      return next(new ApiError(400, `Category "${name}" already exists.`));
    }

    const category = await Category.create({
      name: name.trim(),
      type: type || 'Expense',
      icon: icon || 'Tag',
      user: req.user._id,
      isDefault: false,
    });

    return res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, icon } = req.body;

    if (id.startsWith('default_')) {
      return next(new ApiError(403, 'System default categories cannot be modified.'));
    }

    const category = await Category.findOne({ _id: id, user: req.user._id });
    if (!category) {
      return next(new ApiError(404, 'Category not found or unauthorized'));
    }

    if (name) category.name = name.trim();
    if (type) category.type = type;
    if (icon) category.icon = icon;

    await category.save();

    return res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id.startsWith('default_')) {
      return next(new ApiError(403, 'System default categories cannot be deleted.'));
    }

    const category = await Category.findOneAndDelete({ _id: id, user: req.user._id });
    if (!category) {
      return next(new ApiError(404, 'Category not found or unauthorized'));
    }

    return res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
