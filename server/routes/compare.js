const router = require('express').Router();
const Phone = require('../models/Phone');

// POST /api/compare — body: { phoneIds: ["id1", "id2", "id3"] }
router.post('/', async (req, res) => {
  try {
    const { phoneIds } = req.body;
    if (!phoneIds || !Array.isArray(phoneIds) || phoneIds.length < 2) {
      return res.status(400).json({ message: 'Provide 2-3 phone IDs' });
    }
    if (phoneIds.length > 3) {
      return res.status(400).json({ message: 'You can compare up to 3 phones at a time.' });
    }

    const phones = await Phone.find({ _id: { $in: phoneIds } }).select('-rawSpecs');
    await Phone.updateMany({ _id: { $in: phoneIds } }, { $inc: { compareCount: 1 } });

    res.json(phones);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Also support GET for backward compat
router.get('/', async (req, res) => {
  try {
    const ids = req.query.ids?.split(',').slice(0, 3);
    if (!ids?.length) return res.status(400).json({ message: 'Provide phone ids' });

    const phones = await Phone.find({ _id: { $in: ids } }).select('-rawSpecs');
    await Phone.updateMany({ _id: { $in: ids } }, { $inc: { compareCount: 1 } });

    res.json(phones);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
