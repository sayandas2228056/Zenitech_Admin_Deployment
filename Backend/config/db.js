const mongoose = require('mongoose');

// Reuse connection across invocations in serverless
let cached = global.mongooseConn;
if (!cached) {
  cached = global.mongooseConn = { conn: null, promise: null };
}

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined');

  if (cached.conn) return cached.conn;

  mongoose.set('strictQuery', true);
  const options = {};
  if (process.env.DB_NAME) options.dbName = process.env.DB_NAME;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, options).then(m => m);
  }
  cached.conn = await cached.promise;
  console.log('✅ MongoDB connected');
  return cached.conn;
}

module.exports = connectDB;
