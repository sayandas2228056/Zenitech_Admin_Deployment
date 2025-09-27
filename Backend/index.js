const express = require("express");
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require("dotenv").config();
const connectDB = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;
// Ensure correct client IP when behind Vercel/Proxies
app.set('trust proxy', 1);

// CORS configuration supporting multiple origins
const rawOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = String(rawOrigins)
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
  optionsSuccessStatus: 204
}));
// Security middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(mongoSanitize());

// Body limit to prevent abuse
app.use(express.json({ limit: '200kb' }));

// Basic global rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(apiLimiter);

// Connect to Mongo
connectDB().catch((e) => {
  console.error('Mongo connection error:', e);
  process.exit(1);
});

// Routes
app.get('/', (req, res) => {
  res.send("Zenitech Admin API");
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/clients', require('./routes/clients'));
// Agents and Settings routes removed

// Only start the server when running locally or in a traditional Node environment.
// On Vercel, we export the app to be used by a serverless function.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`✅ Server is running at http://localhost:${port}`);
  });
}

// 404 handler
app.use((req, res, next) => {
  return res.status(404).json({ message: 'Not Found' });
});

// Centralized error handler (avoids leaking internals)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && (err.stack || err.message || err));
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({ message: status === 500 ? 'Internal Server Error' : (err.message || 'Error') });
});

module.exports = app;