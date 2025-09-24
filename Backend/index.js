const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

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
  credentials: true
}));
app.use(express.json());

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

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
