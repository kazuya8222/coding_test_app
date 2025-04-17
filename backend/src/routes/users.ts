import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  getInterviewHistory,
  getSkillProgress,
  getDashboardStats,
  getRecentActivity,
  getRecommendedInterviews,
  getFavoriteInterviews,
  updateFavoriteInterviews
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 認証が必要なルート
router.use(authenticateToken);

// プロフィール関連
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// 面接履歴と進捗
router.get('/interview-history', getInterviewHistory);
router.get('/skill-progress', getSkillProgress);

// ダッシュボード関連
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/recent-activity', getRecentActivity);
router.get('/dashboard/recommendations', getRecommendedInterviews);

// お気に入り関連
router.get('/favorites', getFavoriteInterviews);
router.post('/favorites', updateFavoriteInterviews);

export default router; 