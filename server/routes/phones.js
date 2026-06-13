const router = require('express').Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const adminGuard = require('../middleware/adminGuard');
const ctrl = require('../controllers/phoneController');

// Public routes
router.get('/', ctrl.getPhones);
router.get('/brands', ctrl.getBrands);
router.get('/:id', ctrl.getPhone);

// Admin routes
router.post(
  '/',
  authMiddleware,
  adminGuard,
  [
    body('phoneName').trim().notEmpty().withMessage('Phone name is required'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
  ],
  ctrl.createPhone
);

router.put('/:id', authMiddleware, adminGuard, ctrl.updatePhone);
router.delete('/:id', authMiddleware, adminGuard, ctrl.deletePhone);

module.exports = router;
