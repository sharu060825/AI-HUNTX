const express = require('express');
const Registration = require('../models/Registration');
const Settings = require('../models/Settings');

const router = express.Router();

const REQUIRED_FIELDS = ['fullname', 'regno', 'mobile', 'email', 'dept', 'section', 'teamname', 'participantCount'];

router.get('/status', async (req, res) => {
  const settings = await Settings.getSettings();
  const count = await Registration.countDocuments();
  res.json({ count, max: settings.maxParticipants, full: count >= settings.maxParticipants });
});

router.post('/', async (req, res) => {
  const body = req.body || {};

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return res.status(400).json({ message: `Missing required field: ${field}` });
    }
  }

  const participantCount = Number(body.participantCount);
  if (!Number.isInteger(participantCount) || participantCount < 3 || participantCount > 5) {
    return res.status(400).json({ message: 'Team size must be between 3 and 5 members (leader + 2 to 4 members).' });
  }

  const memberDetails = Array.isArray(body.memberDetails) ? body.memberDetails : [];
  if (memberDetails.length !== participantCount - 1) {
    return res.status(400).json({ message: '`memberDetails` length must be `participantCount - 1` (leader + members).' });
  }

  for (let i = 0; i < memberDetails.length; i++) {
    const m = memberDetails[i] || {};
    if (!m.name || !m.regno || !m.dept) {
      return res.status(400).json({ message: `Member at index ${i} is missing required fields (name, regno, dept).` });
    }
  }

  const settings = await Settings.getSettings();
  const count = await Registration.countDocuments();
  if (count >= settings.maxParticipants) {
    return res.status(403).json({ message: `Registration limit of ${settings.maxParticipants} reached. Registrations are closed.` });
  }

  const registration = await Registration.create({
    fullname:         body.fullname,
    regno:            body.regno,
    mobile:           body.mobile,
    email:            body.email,
    dept:             body.dept,
    section:          body.section,
    teamname:         body.teamname || '',
    participantCount,
    memberDetails:    memberDetails,
  });

  res.status(201).json({ id: registration._id });
});

module.exports = router;
