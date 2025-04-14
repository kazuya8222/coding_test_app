import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import interviewRoutes from './routes/interview';

dotenv.config();

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// MongoDB接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codeinterview')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ルーター
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);

// エラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 