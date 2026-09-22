const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('../validators/auth.validator');

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

router.use(protect);

router.get('/me', authController.getMe);
router.put('/profile', validate(updateProfileSchema), authController.updateProfile);
router.put('/change-password', validate(changePasswordSchema), authController.changePassword);
router.delete('/account', authController.deleteAccount);

module.exports = router;
