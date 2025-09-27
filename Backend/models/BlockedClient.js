const mongoose = require('mongoose');

const BlockedClientSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    reason: { type: String, default: 'Deleted from admin' },
    blockedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('BlockedClient', BlockedClientSchema);
