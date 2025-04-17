import express from 'express';
import { 
  getInterviews, 
  getInterviewById, 
  startInterview, 
  submitInterview,
  getInterviewsByType,
  getInterviewsByRole,
  getInterviewsByDifficulty,
  getInterviewsByLanguage,
  getInterviewsByTechStack,
  getInterviewsByCompanyCulture
} from '../controllers/interviewController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 認証が必要なルート
router.use(authenticateToken);

// 基本ルート
router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.post('/:id/start', startInterview);
router.post('/:id/submit', submitInterview);

// フィルタリングルート
router.get('/type/:type', getInterviewsByType); // coding, technical, behavioral
router.get('/role/:role', getInterviewsByRole); // frontend, backend, fullstack, etc.
router.get('/difficulty/:difficulty', getInterviewsByDifficulty); // easy, medium, hard
router.get('/language/:language', getInterviewsByLanguage); // JavaScript, Python, etc.
router.get('/tech-stack/:stack', getInterviewsByTechStack); // React, Node.js, etc.
router.get('/company-culture/:culture', getInterviewsByCompanyCulture); // startup, enterprise, etc.


export default router; 