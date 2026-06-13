const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminGuard = require('../middleware/adminGuard');
const User = require('../models/User');
const Phone = require('../models/Phone');
const WishlistItem = require('../models/WishlistItem');
const Preference = require('../models/Preference');

router.get('/', authMiddleware, adminGuard, async (req, res) => {
  try {
    const [
      totalUsers,
      totalPhones,
      activeUsers,
      adminUsers,
      mostWishlisted,
      mostCompared,
      recentSignups,
      wishlistTotal,
      compareTotal,
      surveyCompletions,

      /* Insights — ranked lists */
      topShortlisted,
      topCompared,

      /* Insights — distributions from Phone catalog */
      brandAgg,
      categoryAgg,

      /* Insights — survey preferences aggregation */
      surveyPrimaryUse,
      surveyBrands,
      surveyBudgets,
      surveyStorage,
      surveyRam,
    ] = await Promise.all([
      User.countDocuments(),
      Phone.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      Phone.findOne().sort({ wishlistCount: -1 }).select('phoneName brand wishlistCount'),
      Phone.findOne().sort({ compareCount: -1 }).select('phoneName brand compareCount'),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt role'),
      WishlistItem.countDocuments(),
      Phone.aggregate([{ $group: { _id: null, total: { $sum: '$compareCount' } } }]),
      User.countDocuments({ hasCompletedSurvey: true }),

      /* Top 5 most shortlisted phones */
      Phone.find({ wishlistCount: { $gt: 0 } })
        .sort({ wishlistCount: -1 })
        .limit(5)
        .select('phoneName brand wishlistCount'),

      /* Top 5 most compared phones */
      Phone.find({ compareCount: { $gt: 0 } })
        .sort({ compareCount: -1 })
        .limit(5)
        .select('phoneName brand compareCount'),

      /* Brand distribution in catalog */
      Phone.aggregate([
        { $group: { _id: '$brand', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { label: '$_id', value: '$count', _id: 0 } },
      ]),

      /* Category tag distribution */
      Phone.aggregate([
        { $unwind: '$categoryTags' },
        { $group: { _id: '$categoryTags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
        { $project: { label: '$_id', value: '$count', _id: 0 } },
      ]),

      /* Survey: primary use distribution */
      Preference.aggregate([
        { $group: { _id: '$primaryUse', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { label: '$_id', value: '$count', _id: 0 } },
      ]),

      /* Survey: preferred brands (flattened array) */
      Preference.aggregate([
        { $unwind: '$preferredBrands' },
        { $group: { _id: '$preferredBrands', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
        { $project: { label: '$_id', value: '$count', _id: 0 } },
      ]),

      /* Survey: budget range groups */
      Preference.aggregate([
        {
          $bucket: {
            groupBy: '$budget.max',
            boundaries: [0, 200, 400, 700, 1000, 10000],
            default: 'Other',
            output: { count: { $sum: 1 } },
          },
        },
      ]),

      /* Survey: minStorage distribution */
      Preference.aggregate([
        { $group: { _id: '$minStorage', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { label: { $concat: [{ $toString: '$_id' }, ' GB'] }, value: '$count', _id: 0 } },
      ]),

      /* Survey: minRam distribution */
      Preference.aggregate([
        { $group: { _id: '$minRam', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { label: { $concat: [{ $toString: '$_id' }, ' GB RAM'] }, value: '$count', _id: 0 } },
      ]),
    ]);

    /* Format budget buckets into readable labels */
    const BUDGET_LABELS = ['Under $200', '$200–400', '$400–700', '$700–1000', '$1000+'];
    const budgetDist = surveyBudgets
      .filter(b => b._id !== 'Other')
      .map((b, i) => ({ label: BUDGET_LABELS[i] ?? `Bucket ${i}`, value: b.count }));

    /* Derive top survey insights for quick-stat cards */
    const topUseCase  = surveyPrimaryUse[0]?._id  || null;
    const topBrands   = surveyBrands.slice(0, 3).map(b => b.label);
    const topStorage  = surveyStorage[0]?.label   || null;
    const topRam      = surveyRam[0]?.label        || null;

    /* Average budget from Preference docs */
    const avgBudgetDoc = await Preference.aggregate([
      { $group: { _id: null, avg: { $avg: { $divide: [{ $add: ['$budget.min', '$budget.max'] }, 2] } } } },
    ]);
    const avgBudget = avgBudgetDoc[0]?.avg ? `$${Math.round(avgBudgetDoc[0].avg)}` : null;

    const totalComparisons = compareTotal[0]?.total ?? 0;
    const surveyRate = totalUsers > 0 ? Math.round((surveyCompletions / totalUsers) * 100) : 0;

    res.json({
      /* Dashboard stats */
      totalUsers,
      totalPhones,
      activeUsers,
      adminUsers,
      wishlistTotal,
      compareTotal: totalComparisons,
      surveyCompletions,
      mostWishlisted,
      mostCompared,
      recentSignups,

      /* Insights */
      topShortlisted: topShortlisted.map(p => ({
        _id: p._id, phoneName: p.phoneName, brand: p.brand, count: p.wishlistCount,
      })),
      topCompared: topCompared.map(p => ({
        _id: p._id, phoneName: p.phoneName, brand: p.brand, count: p.compareCount,
      })),
      brandDistribution: brandAgg,
      categoryDistribution: categoryAgg,
      surveyInsights: {
        topUseCase,
        avgBudget,
        topBrands,
        topStorage,
        topPerf: topRam,
        surveyRate,
        usecaseDist:  surveyPrimaryUse.map(u => ({ label: u.label, value: u.value })),
        brandDist:    surveyBrands,
        budgetDist,
        storageDist:  surveyStorage,
        ramDist:      surveyRam,
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
