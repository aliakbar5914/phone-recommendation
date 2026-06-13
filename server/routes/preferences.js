const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const ctrl = require('../controllers/preferenceController');

router.get('/me', authMiddleware, ctrl.getMyPreferences);
router.post('/', authMiddleware, ctrl.createPreferences);
router.put('/', authMiddleware, ctrl.updatePreferences);

module.exports = router;
