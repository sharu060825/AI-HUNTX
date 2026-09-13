const express = require('express');
const jwt = require('jsonwebtoken');
const Registration = require('../models/Registration');
const Settings = require('../models/Settings');
const { requireAdmin } = require('../middleware/auth');
const { verifyAdminPassword } = require('../utils/adminAuth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  if (username !== process.env.ADMIN_USERNAME) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await verifyAdminPassword(password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

router.get('/registrations', requireAdmin, async (req, res) => {
  const registrations = await Registration.find().sort({ createdAt: -1 });
  res.json({ registrations });
});

router.put('/registrations/:id', requireAdmin, async (req, res) => {
  const id = req.params.id;
  const body = req.body || {};

  // Basic required fields
  const required = ['fullname', 'regno', 'mobile', 'email', 'dept', 'section', 'teamname', 'participantCount'];
  for (const f of required) {
    if (body[f] === undefined || body[f] === null || body[f] === '') {
      return res.status(400).json({ message: `Missing required field: ${f}` });
    }
  }

  const participantCount = Number(body.participantCount);
  if (!Number.isInteger(participantCount) || participantCount < 3 || participantCount > 5) {
    return res.status(400).json({ message: 'Team size must be between 3 and 5 (leader + members).' });
  }

  const memberDetails = Array.isArray(body.memberDetails) ? body.memberDetails : [];
  if (memberDetails.length !== participantCount - 1) {
    return res.status(400).json({ message: '`memberDetails` length must be `participantCount - 1`.' });
  }

  for (let i = 0; i < memberDetails.length; i++) {
    const m = memberDetails[i] || {};
    if (!m.name || !m.regno || !m.dept) {
      return res.status(400).json({ message: `Member at index ${i} is missing required fields (name, regno, dept).` });
    }
  }

  const registration = await Registration.findById(id);
  if (!registration) return res.status(404).json({ message: 'Registration not found' });

  registration.fullname = body.fullname;
  registration.regno = body.regno;
  registration.mobile = body.mobile;
  registration.email = body.email;
  registration.dept = body.dept;
  registration.section = body.section;
  registration.teamname = body.teamname;
  registration.participantCount = participantCount;
  registration.memberDetails = memberDetails;

  await registration.save();
  res.json({ registration });
});

router.delete('/registrations/:id', requireAdmin, async (req, res) => {
  const id = req.params.id;
  const registration = await Registration.findById(id);
  if (!registration) return res.status(404).json({ message: 'Registration not found' });
  await registration.deleteOne();
  res.json({ message: 'Registration deleted' });
});

router.get('/settings', requireAdmin, async (req, res) => {
  const settings = await Settings.getSettings();
  const count = await Registration.countDocuments();
  res.json({ maxParticipants: settings.maxParticipants, count });
});

router.put('/settings', requireAdmin, async (req, res) => {
  const maxParticipants = Number(req.body?.maxParticipants);
  if (!Number.isInteger(maxParticipants) || maxParticipants < 1) {
    return res.status(400).json({ message: 'maxParticipants must be a positive integer' });
  }

  const settings = await Settings.getSettings();
  settings.maxParticipants = maxParticipants;
  await settings.save();
  res.json({ maxParticipants: settings.maxParticipants });
});

router.get('/export', requireAdmin, async (req, res) => {
  const registrations = await Registration.find().sort({ createdAt: -1 });

  const headers = [
    'Submitted At', 'Full Name', 'Register No', 'Mobile', 'Email', 'Department', 'Section',
    'Team Name', 'Participant Count', 'Member Details',
  ];

  const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  const rows = registrations.map((r) => [
    r.createdAt.toISOString(),
    r.fullname, r.regno, r.mobile, r.email, r.dept, r.section,
    r.teamname, r.participantCount,
    r.memberDetails.map((m) => `${m.name} (${m.regno}) - ${m.dept}`).join('; '),
  ].map(escape).join(','));

  const csv = [headers.map(escape).join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="shark-registrations.csv"');
  res.send(csv);
});

module.exports = router;
