const nodemailer = require('nodemailer');

function getTransporter() {
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) throw new Error('Email credentials not configured');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

async function sendOtpMail(to, code) {
  const transporter = getTransporter();
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your Zenitech Admin OTP',
    html: `<div style="font-family:Arial,sans-serif;font-size:16px;color:#111">
      <p>Hello,</p>
      <p>Your One-Time Password (OTP) is:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#e67e22">${code}</p>
      <p>This code will expire in 5 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>— Zenitech Admin</p>
    </div>`,
  };
  await transporter.sendMail(mailOptions);
}

async function sendStatusUpdateMail(to, { token, subject, description }, oldStatus, newStatus) {
  const transporter = getTransporter();
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Ticket #${token} status updated to ${newStatus}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:16px;color:#111">
      <p>Hello,</p>
      <p>Your support ticket <strong>#${token}</strong> has been updated.</p>
      <ul>
        <li><strong>Subject:</strong> ${subject}</li>
        <li><strong>Previous Status:</strong> ${oldStatus}</li>
        <li><strong>New Status:</strong> ${newStatus}</li>
      </ul>
      <p>We will keep you informed of further updates.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
      <p style="color:#555"><strong>Ticket Summary</strong></p>
      <p style="white-space:pre-wrap;color:#555">${(description || '').slice(0, 500)}</p>
      <p>— Zenitech Support</p>
    </div>`,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendOtpMail, sendStatusUpdateMail };
