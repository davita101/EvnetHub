const mongoose = require('mongoose');
const config = require('./index.config');

const connectDB = async () => {
  try {
    console.log(config.mongoUri);
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
