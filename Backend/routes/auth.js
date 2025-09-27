const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const Otp = require('../models/Otp');
const { sendOtpMail } = require('../utils/mailer');

const router = express.Router();

const ALLOWED_EMAILS = new Set([
  'sayan@zenitech.in',
  'haider@zenitech.in',
  'info@zenitech.in',
  'rahaman@zenitech.in',
]);

// Apply strict rate limits on auth endpoints to prevent brute force
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/request-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const emailLc = String(email).toLowerCase().trim();
    if (!ALLOWED_EMAILS.has(emailLc)) {
      return res.status(403).json({ message: 'Email not authorized' });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ email: emailLc });
    await Otp.create({ email: emailLc, code: codeHash, expiresAt });

    await sendOtpMail(emailLc, code);

    return res.json({ message: 'OTP sent' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to request OTP' });
  }
});

router.post('/verify-otp', otpLimiter, async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });
    const emailLc = String(email).toLowerCase().trim();

    const codeHash = crypto.createHash('sha256').update(String(code)).digest('hex');
    const record = await Otp.findOne({ email: emailLc, code: codeHash });
    if (!record) return res.status(401).json({ message: 'Invalid code' });
    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ email: emailLc });
      return res.status(401).json({ message: 'Code expired' });
    }

    await Otp.deleteMany({ email: emailLc });
    const token = jwt.sign({ email: emailLc, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, user: { email: emailLc, role: 'admin' } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

module.exports = router;
