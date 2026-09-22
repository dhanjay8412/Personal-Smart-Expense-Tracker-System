const { suggestCategory, learnUserCorrection } = require('../services/smartCategorization.service');
const ApiResponse = require('../utils/apiResponse');

const getCategorySuggestion = async (req, res, next) => {
  try {
    const { description, amount } = req.body;
    const userId = req.user ? req.user._id : null;

    const result = await suggestCategory(userId, description);

    return res.status(200).json(
      new ApiResponse(200, result, 'Category suggestion computed successfully')
    );
  } catch (error) {
    next(error);
  }
};

const saveUserCorrection = async (req, res, next) => {
  try {
    const { description, category } = req.body;
    if (req.user && description && category) {
      await learnUserCorrection(req.user._id, description, category);
    }
    return res.status(200).json(new ApiResponse(200, null, 'User category correction saved'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategorySuggestion,
  saveUserCorrection,
};
