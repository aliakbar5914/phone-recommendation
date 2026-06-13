const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
};

const signToken = (user, rememberMe = false) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? '7d' : process.env.JWT_EXPIRES_IN || '15m',
  });

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ errors: [{ path: 'email', msg: 'Email already in use' }] });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user);
    res.cookie('token', token, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, hasCompletedSurvey: user.hasCompletedSurvey } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { email, password, rememberMe } = req.body;
  try {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.isActive)
      return res.status(401).json({ errors: [{ path: 'email', msg: 'Invalid credentials' }] });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ errors: [{ path: 'password', msg: 'Invalid credentials' }] });

    const token = signToken(user, rememberMe);
    const maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000;
    res.cookie('token', token, { ...COOKIE_OPTS, maxAge });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, hasCompletedSurvey: user.hasCompletedSurvey } });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', COOKIE_OPTS);
  res.json({ message: 'Logged out' });
};

exports.getMe = async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, hasCompletedSurvey: req.user.hasCompletedSurvey } });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Always return 200 to avoid user enumeration
      return res.json({ message: 'If that email exists, a reset link has been generated.' });
    }

    await PasswordResetToken.deleteMany({ userId: user._id });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
    res.json({ message: 'Reset link generated.', resetUrl });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { token, password } = req.body;
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = await PasswordResetToken.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const passwordHash = await bcrypt.hash(password, 12);
    await User.findByIdAndUpdate(record.userId, { passwordHash });
    await PasswordResetToken.findByIdAndUpdate(record._id, { used: true });

    res.json({ message: 'Password updated successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
