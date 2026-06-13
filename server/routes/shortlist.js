const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const ctrl = require('../controllers/wishlistController');

router.get('/', authMiddleware, ctrl.getWishlist);
router.post('/:phoneId', authMiddleware, ctrl.addToShortlist);
router.delete('/:phoneId', authMiddleware, ctrl.removeFromWishlist);

module.exports = router;
