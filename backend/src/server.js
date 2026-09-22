const app = require('./app');
const connectDB = require('./config/db');
const { startRecurringJob } = require('./jobs/recurringJob');

const PORT = process.env.PORT || 5000;

// Connect to Database & Start Server
connectDB().then(() => {
  // Start scheduled background jobs
  startRecurringJob();

  const server = app.listen(PORT, () => {
    console.log(`[Server] Smart Expense Tracker API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[Swagger Docs] Available at http://localhost:${PORT}/api/v1/docs`);
  });

  // Handle unhandled promise rejections gracefully
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] ${err.message}`);
    server.close(() => process.exit(1));
  });
});
