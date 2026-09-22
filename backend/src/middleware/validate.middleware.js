const ApiError = require('../utils/apiError');

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Re-assign validated properties
    req.body = parsed.body || req.body;
    req.query = parsed.query || req.query;
    req.params = parsed.params || req.params;
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.').replace(/^(body|query|params)\./, ''),
        message: err.message,
      }));
      return next(new ApiError(400, 'Validation Error', formattedErrors));
    }
    next(error);
  }
};

module.exports = validate;
