const { validationResult } = require('express-validator');
const Phone = require('../models/Phone');

// ── GET /api/phones — list/filter phones (also serves /api/explore) ──────────
exports.getPhones = async (req, res) => {
  try {
    const {
      search,
      brand,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      year,
      minRam,
      minStorage,
      chipsetTier,
      category,
      supports5G,
      supportsNFC,
      hasDualSim,
      hasHeadphoneJack,
      minRefreshRate,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    if (brand) {
      const brands = brand.split(',').map(b => b.trim());
      filter.brand = { $in: brands.map(b => new RegExp(`^${b}$`, 'i')) };
    }

    if (minPrice || maxPrice) {
      filter.priceApprox = {};
      if (minPrice) filter.priceApprox.$gte = Number(minPrice);
      if (maxPrice) filter.priceApprox.$lte = Number(maxPrice);
    }

    if (year) {
      filter.releaseYear = Number(year);
    } else if (minYear || maxYear) {
      filter.releaseYear = {};
      if (minYear) filter.releaseYear.$gte = Number(minYear);
      if (maxYear) filter.releaseYear.$lte = Number(maxYear);
    }

    if (minRam) {
      filter.ramOptions = { $elemMatch: { $gte: Number(minRam) } };
    }

    if (minStorage) {
      filter.storageOptions = { $elemMatch: { $gte: Number(minStorage) } };
    }

    if (chipsetTier) {
      const tiers = chipsetTier.split(',').map(t => t.trim());
      filter.chipsetTier = { $in: tiers };
    }

    if (category) {
      const cats = category.split(',').map(c => c.trim());
      filter.categoryTags = { $in: cats };
    }

    if (supports5G === 'true') filter.supports5G = true;
    if (supportsNFC === 'true') filter.supportsNFC = true;
    if (hasDualSim === 'true') filter.hasDualSim = true;
    if (hasHeadphoneJack === 'true') filter.hasHeadphoneJack = true;

    if (minRefreshRate) {
      filter.refreshRate = { $gte: Number(minRefreshRate) };
    }

    if (search) {
      filter.$or = [
        { phoneName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { chipset: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = {
      price_asc: { priceApprox: 1 },
      price_desc: { priceApprox: -1 },
      newest: { releaseYear: -1, createdAt: -1 },
      battery: { batteryMah: -1 },
      performance: { chipsetTier: 1 }, // Flagship sorts first alphabetically
      relevance: { wishlistCount: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const [phones, total] = await Promise.all([
      Phone.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(Number(limit))
        .select('-rawSpecs'),
      Phone.countDocuments(filter),
    ]);

    res.json({
      phones,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('getPhones error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/phones/brands — get list of all brands ─────────────────────────
exports.getBrands = async (req, res) => {
  try {
    const brands = await Phone.distinct('brand');
    res.json(brands.sort());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/phones/:id — get single phone with full specs ──────────────────
exports.getPhone = async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.id);
    if (!phone) return res.status(404).json({ message: 'Phone not found' });
    res.json(phone);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── POST /api/phones — admin create phone ───────────────────────────────────
exports.createPhone = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  try {
    const phone = await Phone.create(req.body);
    res.status(201).json(phone);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PUT /api/phones/:id — admin update phone ────────────────────────────────
exports.updatePhone = async (req, res) => {
  try {
    const phone = await Phone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!phone) return res.status(404).json({ message: 'Phone not found' });
    res.json(phone);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── DELETE /api/phones/:id — admin delete phone ─────────────────────────────
exports.deletePhone = async (req, res) => {
  try {
    const phone = await Phone.findByIdAndDelete(req.params.id);
    if (!phone) return res.status(404).json({ message: 'Phone not found' });
    res.json({ message: 'Phone deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
