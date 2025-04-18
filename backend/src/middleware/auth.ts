import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// リクエストにユーザー情報を追加する拡張インターフェース
export interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
    _id?: string; // 後方互換性のために残します
  };
}

// JWTトークンの型定義
interface JwtPayload {
  userId: string;
  email: string;
}

// 認証ミドルウェア
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Authorization ヘッダーからトークンを取得
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"形式を想定

  if (!token) {
    return res.status(401).json({ message: '認証トークンがありません' });
  }

  try {
    // トークンの検証
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT secret is not defined');
    }
    
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // リクエストオブジェクトにユーザー情報を追加
    (req as AuthRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
      _id: decoded.userId // 後方互換性のために_idも設定
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ message: '無効なトークンです' });
  }
};