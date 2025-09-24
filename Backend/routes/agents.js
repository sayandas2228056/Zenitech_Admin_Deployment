const express = require('express');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');

const router = express.Router();

// protect all agent routes
router.use(auth);

// GET /api/agents - list all agents
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find({}).sort({ createdAt: -1 });
    return res.json(agents);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to fetch agents' });
  }
});

// POST /api/agents - create agent
router.post('/', async (req, res) => {
  try {
    const { name, email, role } = req.body || {};
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
    const agent = await Agent.create({ name, email: String(email).toLowerCase().trim(), role: role || 'agent' });
    return res.status(201).json(agent);
  } catch (e) {
    console.error(e);
    if (e.code === 11000) return res.status(409).json({ message: 'Email already exists' });
    return res.status(500).json({ message: 'Failed to create agent' });
  }
});

// PATCH /api/agents/:id - update role/active/name
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, active } = req.body || {};
    const update = {};
    if (typeof name === 'string') update.name = name;
    if (typeof role === 'string') update.role = role;
    if (typeof active === 'boolean') update.active = active;
    const agent = await Agent.findByIdAndUpdate(id, update, { new: true });
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    return res.json(agent);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to update agent' });
  }
});

// DELETE /api/agents/:id - delete agent
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Agent.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Agent not found' });
    return res.json({ message: 'Deleted' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to delete agent' });
  }
});

module.exports = router;
