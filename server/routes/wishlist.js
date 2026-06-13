const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const ctrl = require('../controllers/wishlistController');

router.use(authMiddleware);

router.get('/', ctrl.getWishlist);
router.post('/', ctrl.addToShortlist);
router.delete('/:phoneId', ctrl.removeFromWishlist);

module.exports = router;
