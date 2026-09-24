const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is missing. Please add MONGODB_URI to your Render Environment Variables.');
    }

    const conn = await mongoose.connect(mongoURI, {
      // mongoose v6+ defaults are optimal
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failure: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
