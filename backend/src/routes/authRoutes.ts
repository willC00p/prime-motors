import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../utils/auth';
import { getCurrentRotationPassword } from '../utils/passwordRotation';

const router = Router();

// Rotating password endpoint (GET)
router.get('/rotating-password', authenticateToken, (req, res) => {
  const user = req.user;
  if (!user || (user.role !== 'nsm' && user.role !== 'accounting')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const password = getCurrentRotationPassword();
  res.json({ password });
});

router.post('/login', authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;
