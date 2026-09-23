const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const errorHandler = require('./middleware/error.middleware');
const setupSwagger = require('./config/swagger');

// Route Imports
const authRoutes = require('./routes/auth.routes');
const transactionRoutes = require('./routes/transaction.routes');
const categoryRoutes = require('./routes/category.routes');
const budgetRoutes = require('./routes/budget.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const notificationRoutes = require('./routes/notification.routes');
const recurringRoutes = require('./routes/recurring.routes');
const exportRoutes = require('./routes/export.routes');
const categorizationRoutes = require('./routes/categorization.routes');
const calendarRoutes = require('./routes/calendar.routes');
const groupRoutes = require('./routes/group.routes');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const configuredClient = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
      const incomingOrigin = origin.replace(/\/$/, '');

      if (incomingOrigin === configuredClient || incomingOrigin.includes('localhost') || incomingOrigin.includes('127.0.0.1') || incomingOrigin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body Parsing & Rate Limiting
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

// Setup Swagger OpenAPI Documentation
setupSwagger(app);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/recurring', recurringRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1/categorization', categorizationRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/groups', groupRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Smart Expense Tracker API is running smoothly' });
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    error: { code: 'NOT_FOUND' },
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
