const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema(
  {
    filename: String,
    url: String,
    size: Number,
  },
  { _id: true }
);

const TicketSchema = new mongoose.Schema(
  {
    token: { type: String, index: true },
    subject: { type: String, required: true },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    description: { type: String },
    status: { type: String, enum: ['Open', 'In Progress', 'Closed'], default: 'Open' },
    attachments: [AttachmentSchema],
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Ticket', TicketSchema);
