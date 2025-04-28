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
import { RequestHandler } from 'express';
const router = express.Router();

// 認証が必要なルート
router.use(authenticateToken);

// プロフィール関連
router.get('/profile', getProfile as unknown as RequestHandler);
router.put('/profile', updateProfile as unknown as RequestHandler);

// 面接履歴と進捗
router.get('/interview-history', getInterviewHistory as unknown as RequestHandler);
router.get('/skill-progress', getSkillProgress as unknown as RequestHandler);

// ダッシュボード関連
router.get('/dashboard/stats', getDashboardStats as unknown as RequestHandler);
router.get('/dashboard/recent-activity', getRecentActivity as unknown as RequestHandler);
router.get('/dashboard/recommendations', getRecommendedInterviews as unknown as RequestHandler);

// お気に入り関連
router.get('/favorites', getFavoriteInterviews as unknown as RequestHandler);
router.post('/favorites', updateFavoriteInterviews as unknown as RequestHandler);

export default router; 