import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    // メールアドレスの重複チェック
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'このメールアドレスは既に登録されています' });
    }
    // 新しいユーザーの作成
    const user = new User({
      email,
      password_hash: password,
      name
    });
    console.log(email);
    await user.save();
    // JWTトークンの生成
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // ユーザーの検索
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // パスワードの検証
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // JWTトークンの生成
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};
