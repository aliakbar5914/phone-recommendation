const router = require('express').Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const adminGuard = require('../middleware/adminGuard');
const ctrl = require('../controllers/userController');

router.get('/me', authMiddleware, ctrl.getMe);
router.patch(
  '/me',
  authMiddleware,
  [
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
    body('newPassword').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  ctrl.updateMe
);

router.get('/', authMiddleware, adminGuard, ctrl.getAllUsers);
router.patch('/:id', authMiddleware, adminGuard, ctrl.updateUser);

module.exports = router;
