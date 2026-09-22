const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Authentication token missing. Please log in.'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new ApiError(401, 'The user belonging to this token no longer exists.'));
      }

      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Your session has expired. Please log in again.'));
      }
      return next(new ApiError(401, 'Invalid authentication token.'));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
