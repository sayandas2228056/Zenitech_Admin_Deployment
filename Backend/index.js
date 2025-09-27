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
    // Also allow common Vercel preview/prod domains if desired
    if (allowedOrigins.includes(origin) || /\.vercel\.app$/i.test(new URL(origin).hostname)) {
      return callback(null, true);
    }
    // Do not treat as server error; simply omit CORS headers
    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 204
}));
// Security middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
// Important: In Express 5, req.query is a read-only getter. The default
// express-mongo-sanitize middleware attempts to reassign req.query, which
// throws "Cannot set property query of #<IncomingMessage> which has only a getter".
// To avoid this, sanitize only mutable locations explicitly and skip req.query.
app.use((req, res, next) => {
  try {
    if (req.body) req.body = mongoSanitize.sanitize(req.body);
    if (req.params) req.params = mongoSanitize.sanitize(req.params);
    if (req.headers) req.headers = mongoSanitize.sanitize(req.headers);
  } catch (e) {
    // Do not crash on sanitize errors; proceed to next middleware
    // and let route-level validation handle edge cases.
    console.error('mongoSanitize error (non-fatal):', e && (e.message || e));
  }
  next();
});

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
  // In serverless, do not exit; allow function to respond and retry on next cold start
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

// Routes
app.get('/', (req, res) => {
  res.send("Zenitech Admin API");
});
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    vercel: Boolean(process.env.VERCEL),
    node: process.version,
    mongoConnected: mongoose.connection && mongoose.connection.readyState === 1,
    allowedOrigins,
  });
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