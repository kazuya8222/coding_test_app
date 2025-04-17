import express from 'express';
import { register, login } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 公開ルート
router.post('/register', register);
router.post('/login', login);


export default router; 