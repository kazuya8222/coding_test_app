import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// MongoDB接続
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDBに接続しました'))
  .catch((err) => console.error('MongoDB接続エラー:', err));

// ルート
app.use('/api/auth', authRoutes);

// エラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'サーバーエラーが発生しました' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
}); 