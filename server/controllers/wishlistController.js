const WishlistItem = require('../models/WishlistItem');
const Phone = require('../models/Phone');

exports.getWishlist = async (req, res) => {
  try {
    const items = await WishlistItem.find({ userId: req.user._id }).populate(
      'phoneId',
      'phoneName brand releaseYear priceApprox priceText categoryTags chipsetTier batteryMah displaySize brandPlaceholder supports5G'
    );
    res.json(items);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Supports both POST body { phoneId } and POST /:phoneId
exports.addToShortlist = async (req, res) => {
  try {
    const phoneId = req.params.phoneId || req.body.phoneId;
    if (!phoneId) return res.status(400).json({ message: 'phoneId is required' });

    const phone = await Phone.findById(phoneId);
    if (!phone) return res.status(404).json({ message: 'Phone not found' });

    const existing = await WishlistItem.findOne({ userId: req.user._id, phoneId });
    if (existing) return res.status(409).json({ message: 'Already in shortlist' });

    await WishlistItem.create({ userId: req.user._id, phoneId });
    await Phone.findByIdAndUpdate(phoneId, { $inc: { wishlistCount: 1 } });

    res.status(201).json({ message: 'Added to shortlist' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const item = await WishlistItem.findOneAndDelete({
      userId: req.user._id,
      phoneId: req.params.phoneId,
    });
    if (!item) return res.status(404).json({ message: 'Not in shortlist' });
    await Phone.findByIdAndUpdate(req.params.phoneId, { $inc: { wishlistCount: -1 } });
    res.json({ message: 'Removed from shortlist' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
