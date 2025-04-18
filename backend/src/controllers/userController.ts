import { Request, Response } from 'express';
import User from '../models/User';
import InterviewSession from '../models/InterviewSession';
import { AuthRequest } from '../middleware/auth';
import { IProblem } from '../models/Problem';

// プロフィール取得
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    // ユーザーIDはミドルウェアで設定されている
    const user = await User.findById(req.user.userId).select('-password_hash');
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'プロフィール取得中にエラーが発生しました', error });
  }
};

// プロフィール更新
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, profile } = req.body;
    
    // 更新データの検証
    if (!name && !profile) {
      return res.status(400).json({ message: '更新するデータがありません' });
    }

    // 更新するフィールドを準備
    const updateData: any = {};
    if (name) updateData.name = name;
    
    // profileオブジェクトの各フィールドを更新
    if (profile) {
      // プロフィールのフィールドを検証
      const validProfileFields = [
        'bio', 'job_title', 'experience_level', 
        'preferred_languages', 'target_companies', 'avatar_url'
      ];
      
      // 有効なフィールドのみ更新対象に含める
      for (const field of validProfileFields) {
        if (profile[field] !== undefined) {
          updateData[`profile.${field}`] = profile[field];
        }
      }
      
      // 経験レベルのバリデーション
      if (profile.experience_level && 
         !['entry', 'junior', 'mid', 'senior'].includes(profile.experience_level)) {
        return res.status(400).json({ 
          message: '無効な経験レベルです。entry, junior, mid, senior のいずれかを指定してください。' 
        });
      }
    }

    // ユーザー情報の更新
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password_hash');

    if (!updatedUser) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'プロフィール更新中にエラーが発生しました', error });
  }
};

// 面接履歴取得
export const getInterviewHistory = async (req: AuthRequest, res: Response) => {
  try {
    const interviews = await InterviewSession.find({ user_id: req.user.userId })
      .sort({ created_at: -1 })
      .populate('problem_id');
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: '面接履歴取得中にエラーが発生しました', error });
  }
};

// スキル進捗取得
export const getSkillProgress = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    const technicalSkills = user.skills
      .filter(skill => skill.category === 'technical')
      .reduce((acc, skill) => {
        acc[skill.name] = skill.score;
        return acc;
      }, {} as Record<string, number>);

    const softSkills = user.skills
      .filter(skill => skill.category === 'soft')
      .reduce((acc, skill) => {
        acc[skill.name] = skill.score;
        return acc;
      }, {} as Record<string, number>);

    res.json({
      technical: technicalSkills,
      soft: softSkills
    });
  } catch (error) {
    res.status(500).json({ message: 'スキル進捗取得中にエラーが発生しました', error });
  }
};

// ダッシュボード統計取得
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentInterviews = await InterviewSession.find({
      user_id: req.user.userId,
      created_at: { $gte: oneWeekAgo }
    });

    const stats = {
      totalInterviews: user.progress.coding_interviews_completed + 
                      user.progress.technical_interviews_completed + 
                      user.progress.behavioral_interviews_completed,
      weeklyChange: recentInterviews.length,
      averageScore: (user.progress.coding_avg_score + 
                    user.progress.technical_avg_score + 
                    user.progress.behavioral_avg_score) / 3,
      monthlyScoreChange: 0, // TODO: 実装
      problemsSolved: user.progress.total_problems_solved,
      progressPercentage: user.progress.level_progress,
      nextLevel: user.progress.current_level,
      levelProgress: user.progress.level_progress
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'ダッシュボード統計取得中にエラーが発生しました', error });
  }
};

// 最近のアクティビティ取得
export const getRecentActivity = async (req: AuthRequest, res: Response) => {
  try {
    const recentInterviews = await InterviewSession.find({ user_id: req.user.userId })
      .sort({ created_at: -1 })
      .limit(5)
      .populate<{ problem_id: IProblem }>('problem_id');

    const activities = recentInterviews.map(interview => ({
      id: interview._id,
      message: `面接を完了しました: ${interview.problem_id.title}`,
      timeAgo: getTimeAgo(interview.created_at)
    }));

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: '最近のアクティビティ取得中にエラーが発生しました', error });
  }
};

// おすすめ面接取得
export const getRecommendedInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    // ユーザーのスキルに基づいておすすめの問題を取得
    const recommendedInterviews = await InterviewSession.find({
      user_id: { $ne: req.user.userId },
      'evaluation.overall_score': { $gte: 80 }
    })
    .sort({ 'evaluation.overall_score': -1 })
    .limit(5)
    .populate('problem_id');

    res.json(recommendedInterviews);
  } catch (error) {
    res.status(500).json({ message: 'おすすめ面接取得中にエラーが発生しました', error });
  }
};

// お気に入り面接取得
export const getFavoriteInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    // TODO: お気に入り機能の実装
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'お気に入り面接取得中にエラーが発生しました', error });
  }
};

// お気に入り面接更新
export const updateFavoriteInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const { interviewIds } = req.body;
    // TODO: お気に入り機能の実装
    res.json({ message: 'お気に入りを正常に更新しました' });
  } catch (error) {
    res.status(500).json({ message: 'お気に入り面接更新中にエラーが発生しました', error });
  }
};

// ヘルパー関数: 時間差を計算
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (minutes > 0) return `${minutes}分前`;
  return 'たった今';
};