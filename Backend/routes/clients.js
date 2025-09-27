const express = require('express');
const auth = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const Client = require('../models/Client');
const BlockedClient = require('../models/BlockedClient');

const router = express.Router();

// protect all client routes
router.use(auth);

// GET /api/clients - list all clients, including those without tickets
router.get('/', async (req, res) => {
  try {
    // 1) Load persisted clients (can exist without tickets)
    const clientDocs = await Client.find({}).lean();
    const clientMap = new Map();
    for (const c of clientDocs) {
      const emailLc = String(c.email || '').toLowerCase();
      if (!emailLc) continue;
      clientMap.set(emailLc, {
        email: c.email,
        name: c.name || null,
        phone: c.phone || null,
        lastTicketAt: null,
        ticketCount: 0,
      });
    }

    // 2) Aggregate ticket-based clients and counts
    const ticketAgg = await Ticket.aggregate([
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
      { $match: { _id: { $ne: '' } } }
    ]);

    for (const t of ticketAgg) {
      const emailLc = String(t._id || '').toLowerCase();
      if (!emailLc) continue;
      const existing = clientMap.get(emailLc);
      if (existing) {
        existing.ticketCount = t.ticketCount || 0;
        existing.lastTicketAt = t.lastTicketAt || null;
        // Prefer explicit Client name/phone; fallback to ticket-derived if missing
        if (!existing.name) existing.name = t.name || null;
        if (!existing.phone) existing.phone = t.phone || null;
      } else {
        clientMap.set(emailLc, {
          email: t.email,
          name: t.name || null,
          phone: t.phone || null,
          lastTicketAt: t.lastTicketAt || null,
          ticketCount: t.ticketCount || 0,
        });
      }
    }

    // 3) Return merged list, sorted by lastTicketAt desc (nulls last)
    const merged = Array.from(clientMap.values()).sort((a, b) => {
      const at = a.lastTicketAt ? new Date(a.lastTicketAt).getTime() : 0;
      const bt = b.lastTicketAt ? new Date(b.lastTicketAt).getTime() : 0;
      return bt - at;
    });

    return res.json(merged);
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

// POST /api/clients - create or update a client (for users without tickets)
router.post('/', async (req, res) => {
  try {
    const { email, name, phone } = req.body || {};
    const emailLc = String(email || '').toLowerCase().trim();
    if (!emailLc) return res.status(400).json({ message: 'Email is required' });
    const update = {
      email: emailLc,
      ...(typeof name === 'string' ? { name: name.trim().slice(0, 200) } : {}),
      ...(typeof phone === 'string' ? { phone: phone.trim().slice(0, 50) } : {}),
    };
    const doc = await Client.findOneAndUpdate({ email: emailLc }, { $set: update }, { new: true, upsert: true });
    return res.status(200).json(doc);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to upsert client' });
  }
});

// POST /api/clients/bulk - bulk upsert clients [{ email, name, phone }]
router.post('/bulk', async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    if (!items.length) return res.status(400).json({ message: 'Array of clients required' });
    const ops = [];
    for (const it of items) {
      const emailLc = String(it && it.email || '').toLowerCase().trim();
      if (!emailLc) continue;
      const update = {
        email: emailLc,
        ...(typeof it.name === 'string' ? { name: it.name.trim().slice(0, 200) } : {}),
        ...(typeof it.phone === 'string' ? { phone: it.phone.trim().slice(0, 50) } : {}),
      };
      ops.push({ updateOne: { filter: { email: emailLc }, update: { $set: update }, upsert: true } });
    }
    if (!ops.length) return res.status(400).json({ message: 'No valid client records' });
    const result = await Client.bulkWrite(ops, { ordered: false });
    return res.json({ acknowledged: true, result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to bulk upsert clients' });
  }
});

// DELETE /api/clients/:email - remove a client by deleting all their tickets
router.delete('/:email', async (req, res) => {
  try {
    const email = String(req.params.email || '').toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const result = await Ticket.deleteMany({ email });
    // Upsert into BlockedClient so this email cannot re-register
    await BlockedClient.updateOne(
      { email },
      { $set: { email, reason: 'Deleted from admin' }, $setOnInsert: { blockedAt: new Date() } },
      { upsert: true }
    );
    // Also remove from Client directory if present
    await Client.deleteOne({ email });
    return res.json({ message: 'Client removed and blocked', deletedCount: result.deletedCount || 0, blocked: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to remove client' });
  }
});

// GET /api/clients/blocked/:email - check if an email is blocked (admin protected)
router.get('/blocked/:email', async (req, res) => {
  try {
    const email = String(req.params.email || '').toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const exists = await BlockedClient.exists({ email });
    return res.json({ email, blocked: Boolean(exists) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to check block status' });
  }
});

module.exports = router;
