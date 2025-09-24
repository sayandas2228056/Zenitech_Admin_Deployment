const express = require('express');
const auth = require('../middleware/auth');
const { sendStatusUpdateMail, sendOtpMail } = require('../utils/mailer');

const router = express.Router();

// protect all settings routes
router.use(auth);

// GET /api/settings - minimal runtime settings exposure
router.get('/', async (req, res) => {
  try {
    const frontendUrls = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
    return res.json({
      env: {
        hasEmailCreds: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
        frontendUrls,
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to read settings' });
  }
});

// POST /api/settings/test-email - send a test email to verify SMTP credentials
router.post('/test-email', async (req, res) => {
  try {
    const { to } = req.body || {};
    if (!to) return res.status(400).json({ message: 'Recipient email (to) is required' });
    // reuse OTP mailer for a simple test email
    await sendOtpMail(to, '123456');
    return res.json({ message: 'Test email sent' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to send test email' });
  }
});

module.exports = router;
