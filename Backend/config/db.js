const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined');
  mongoose.set('strictQuery', true);
  const options = {};
  if (process.env.DB_NAME) {
    options.dbName = process.env.DB_NAME;
  }
  await mongoose.connect(uri, options);
  console.log('✅ MongoDB connected');
}

module.exports = connectDB;
