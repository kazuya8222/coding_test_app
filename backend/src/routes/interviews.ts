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
import { RequestHandler } from 'express';

const router = express.Router();


// 認証が必要なルート
router.use(authenticateToken);

// 基本ルート
router.get('/', getInterviews as unknown as RequestHandler);
router.get('/:id', getInterviewById as unknown as RequestHandler);
router.post('/:id/start', startInterview as unknown as RequestHandler);
router.post('/:id/submit', submitInterview as unknown as RequestHandler);

// フィルタリングルート
router.get('/type/:type', getInterviewsByType as unknown as RequestHandler); // coding, technical, behavioral
router.get('/role/:role', getInterviewsByRole as unknown as RequestHandler); // frontend, backend, fullstack, etc.
router.get('/difficulty/:difficulty', getInterviewsByDifficulty as unknown as RequestHandler); // easy, medium, hard
router.get('/language/:language', getInterviewsByLanguage as unknown as RequestHandler); // JavaScript, Python, etc.
router.get('/tech-stack/:stack', getInterviewsByTechStack as unknown as RequestHandler); // React, Node.js, etc.
router.get('/company-culture/:culture', getInterviewsByCompanyCulture as unknown as RequestHandler); // startup, enterprise, etc.


export default router; 