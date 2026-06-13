const Preference = require('../models/Preference');
const User = require('../models/User');

// ── GET /api/preferences/me ─────────────────────────────────────────────────
exports.getMyPreferences = async (req, res) => {
  try {
    const pref = await Preference.findOne({ userId: req.user._id });
    if (!pref) return res.status(404).json({ message: 'No preferences found' });
    res.json(pref);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── POST /api/preferences — create preferences (first time) ────────────────
exports.createPreferences = async (req, res) => {
  try {
    const existing = await Preference.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(409).json({ message: 'Preferences already exist. Use PUT to update.' });
    }

    const pref = await Preference.create({
      userId: req.user._id,
      ...req.body,
    });

    // Mark user as having completed survey
    await User.findByIdAndUpdate(req.user._id, { hasCompletedSurvey: true });

    res.status(201).json(pref);
  } catch (err) {
    console.error('createPreferences error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PUT /api/preferences — update preferences ──────────────────────────────
exports.updatePreferences = async (req, res) => {
  try {
    const pref = await Preference.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!pref) return res.status(404).json({ message: 'No preferences found' });
    res.json(pref);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
