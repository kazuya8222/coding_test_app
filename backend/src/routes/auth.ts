import express from 'express';
import { register, login } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { getProfile } from 'src/controllers/userController';

const router = express.Router();

// 公開ルート
router.post('/register', register);
router.post('/login', login);

// router.get('/profile', authenticateToken, getProfile);


export default router; 