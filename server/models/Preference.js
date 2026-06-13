const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    budget: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 2000 },
    },
    primaryUse: {
      type: String,
      enum: ['Gaming', 'Camera', 'Battery', 'Student', 'Business', 'Daily Use'],
      default: 'Daily Use',
    },
    preferredBrands: [{ type: String }],
    minRam: { type: Number, default: 0 },
    minStorage: { type: Number, default: 0 },
    requiredFeatures: [{ type: String }], // '5G', 'NFC', 'Dual SIM', 'High Refresh Rate', '3.5mm Headphone Jack'
    launchYearRange: {
      from: { type: Number, default: 2019 },
      to: { type: Number, default: new Date().getFullYear() + 1 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Preference', preferenceSchema);
