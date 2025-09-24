const express = require('express');
const auth = require('../middleware/auth');
const Ticket = require('../models/Ticket');

const router = express.Router();

// protect all client routes
router.use(auth);

// GET /api/clients - aggregate clients from tickets by email
router.get('/', async (req, res) => {
  try {
    const clients = await Ticket.aggregate([
      {
        $group: {
          _id: { $toLower: { $ifNull: ['$email', ''] } },
          email: { $first: '$email' },
          name: { $last: '$name' },
          phone: { $last: '$phone' },
          lastTicketAt: { $max: '$createdAt' },
          ticketCount: { $sum: 1 },
        }
      },
      { $match: { _id: { $ne: '' } } },
      { $sort: { lastTicketAt: -1 } }
    ]);
    return res.json(clients.map(c => ({
      email: c.email,
      name: c.name,
      phone: c.phone,
      lastTicketAt: c.lastTicketAt,
      ticketCount: c.ticketCount,
    })));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to fetch clients' });
  }
});

// GET /api/clients/:email/tickets - list tickets by client email
router.get('/:email/tickets', async (req, res) => {
  try {
    const email = String(req.params.email || '').toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const tickets = await Ticket.find({ email }).sort({ createdAt: -1 });
    return res.json(tickets);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to fetch client tickets' });
  }
});

// DELETE /api/clients/:email - remove a client by deleting all their tickets
router.delete('/:email', async (req, res) => {
  try {
    const email = String(req.params.email || '').toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const result = await Ticket.deleteMany({ email });
    return res.json({ message: 'Client removed', deletedCount: result.deletedCount || 0 });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to remove client' });
  }
});

module.exports = router;
