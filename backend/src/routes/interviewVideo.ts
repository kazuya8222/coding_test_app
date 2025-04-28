import express from 'express';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  getProblemDetails,
  startVideoInterview,
  addInterviewMessage, 
  processAudio,
  generateAIResponse,
  saveVideoRecording,
  completeInterview,
  getInterviewResults
} from '../controllers/interviewVideoController';
import { RequestHandler } from 'express';
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, path.join(__dirname, '../../uploads/audio'));
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, path.join(__dirname, '../../uploads/video'));
    } else {
      cb(new Error('Invalid file type'), '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept audio and video files
  if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio and video files are allowed'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB size limit
  }
});

// All routes require authentication
router.use(authenticateToken);

// Get problem details
router.get('/:id', getProblemDetails);

// Start a video interview
router.post('/:id/start', startVideoInterview as unknown as RequestHandler);

// Add messages to the interview
router.post('/:id/message', addInterviewMessage as unknown as RequestHandler);

// Process audio for transcription
router.post('/process-audio', upload.single('audio'), processAudio as unknown as RequestHandler);

// Generate AI response
router.post('/generate-response', generateAIResponse as unknown as RequestHandler);

// Save video recording
router.post('/:id/recording', upload.single('video'), saveVideoRecording as unknown as RequestHandler);

// Complete the interview and generate feedback
router.post('/:id/complete', completeInterview as unknown as RequestHandler);

// Get detailed interview results
router.get('/:id/results', getInterviewResults as unknown as RequestHandler);

export default router;