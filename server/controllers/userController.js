const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');

exports.getMe = async (req, res) => {
  res.json({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role });
};

exports.updateMe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { name, email, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id).select('+passwordHash');
    if (name) user.name = name;
    if (email) user.email = email;

    if (newPassword) {
      if (!currentPassword) return res.status(422).json({ errors: [{ path: 'currentPassword', msg: 'Current password required' }] });
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return res.status(422).json({ errors: [{ path: 'currentPassword', msg: 'Incorrect password' }] });
      user.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: list all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: update role or isActive
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot modify your own account here' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(role && { role }), ...(isActive !== undefined && { isActive }) },
      { new: true }
    ).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
