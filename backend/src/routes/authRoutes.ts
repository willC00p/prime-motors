import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../utils/auth';
import { getCurrentRotationPassword } from '../utils/passwordRotation';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);

// Get the current rotating password (only for NSM and accounting roles)
router.get('/rotation-password', authenticateToken, (req: any, res) => {
  const userRole = req.user?.role;
  
  // Only NSM and accounting can see the rotation password
  if (userRole !== 'nsm' && userRole !== 'accounting') {
    return res.status(403).json({ error: 'Access denied. Only NSM and accounting roles can view the rotation password.' });
  }
  
  const password = getCurrentRotationPassword();
  res.json({ password });
});

export default router;
