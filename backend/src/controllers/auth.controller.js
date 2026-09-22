const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, currency, monthlyIncome } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new ApiError(400, 'User already exists with this email address'));
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      currency: currency || 'INR',
      monthlyIncome: monthlyIncome || 0,
    });

    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json(
      new ApiResponse(201, { user: userObj, token }, 'Registration successful')
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json(
      new ApiResponse(200, { user: userObj, token }, 'Login successful')
    );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  return res.status(200).json(new ApiResponse(200, null, 'Logout successful'));
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json(new ApiResponse(200, { user }, 'User profile fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, profileImage, currency, monthlyIncome } = req.body;

    if (email && email.toLowerCase() !== req.user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return next(new ApiError(400, 'Email address is already taken by another account'));
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(profileImage !== undefined && { profileImage }),
        ...(currency && { currency }),
        ...(monthlyIncome !== undefined && { monthlyIncome }),
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json(
      new ApiResponse(200, { user: updatedUser }, 'Profile updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new ApiError(400, 'Incorrect current password'));
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete all user related data to prevent orphaned documents
    const Transaction = require('../models/Transaction');
    const Budget = require('../models/Budget');
    const Category = require('../models/Category');
    const Notification = require('../models/Notification');
    const RecurringTransaction = require('../models/RecurringTransaction');

    await Promise.all([
      Transaction.deleteMany({ user: userId }),
      Budget.deleteMany({ user: userId }),
      Category.deleteMany({ user: userId }),
      Notification.deleteMany({ user: userId }),
      RecurringTransaction.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId),
    ]);

    return res.status(200).json(new ApiResponse(200, null, 'Account and all associated financial data deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
};
