import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import interviewRoutes from './routes/interviews';
import userRoutes from './routes/users';
import connectDB from './config/database';

dotenv.config();

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

connectDB();

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/users', userRoutes);


// エラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'サーバーエラーが発生しました' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
}); 