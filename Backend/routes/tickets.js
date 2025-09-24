const express = require('express');
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');
const { sendStatusUpdateMail } = require('../utils/mailer');

const router = express.Router();

// Apply auth middleware to all ticket routes
router.use(auth);

// GET /api/tickets - list all tickets (admin view)
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find({}).sort({ createdAt: -1 });
    return res.json(tickets);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// GET /api/tickets/:id - get ticket by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    return res.json(ticket);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to fetch ticket' });
  }
});

// PATCH /api/tickets/:id - update status (and optionally other fields)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, subject, description } = req.body || {};
    const update = {};
    if (status) update.status = status;
    if (subject) update.subject = subject;
    if (description) update.description = description;

    // Load existing ticket to check for status changes
    const existing = await Ticket.findById(id);
    if (!existing) return res.status(404).json({ message: 'Ticket not found' });
    const oldStatus = existing.status;

    const ticket = await Ticket.findByIdAndUpdate(id, update, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // If status changed and email exists, send notification (non-blocking)
    if (typeof status === 'string' && status !== oldStatus && ticket.email) {
      sendStatusUpdateMail(ticket.email, {
        token: ticket.token,
        subject: ticket.subject,
        description: ticket.description,
      }, oldStatus, status).catch(err => {
        console.error('Failed to send status update email:', err.message || err);
      });
    }

    return res.json(ticket);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to update ticket' });
  }
});

// DELETE /api/tickets/:id - delete a ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Ticket.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Ticket not found' });
    return res.json({ message: 'Deleted' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to delete ticket' });
  }
});

module.exports = router;
