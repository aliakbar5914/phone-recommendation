const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    phoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Phone', required: true },
  },
  { timestamps: true }
);

wishlistItemSchema.index({ userId: 1, phoneId: 1 }, { unique: true });

module.exports = mongoose.model('WishlistItem', wishlistItemSchema);
