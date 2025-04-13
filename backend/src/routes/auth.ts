import express from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 公開ルート
router.post('/register', register);
router.post('/login', login);

// 保護されたルート
router.get('/profile', authenticateToken, getProfile);

export default router; 