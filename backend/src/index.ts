import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import interviewRoutes from './routes/interviews';
import interviewVideoRoutes from './routes/interviewVideo';
import userRoutes from './routes/users';
import connectDB from './config/database';
import ttsRoutes from './routes/tts';
import followupRoutes from './routes/followup';
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 encoded files
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/video-interviews', interviewVideoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/followup', followupRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'サーバーエラーが発生しました', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});