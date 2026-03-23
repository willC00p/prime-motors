import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../utils/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.get('/rotating-password', authController.getRotatingPassword);

export default router;
