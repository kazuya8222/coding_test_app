import mongoose from 'mongoose';
import { InterviewProblem } from '../../../shared/types/interview';

interface TestCase {
  input: any;
  expectedOutput: any;
}

const interviewProblemSchema = new mongoose.Schema<InterviewProblem>({
  domain: {
    type: String,
    required: true,
    enum: ['アルゴリズム', 'システム設計', 'データベース', 'ネットワーク', 'セキュリティ', 'その他']
  },
  category: {
    type: String,
    required: true,
    enum: [
      // アルゴリズム
      'ソート', '探索', '動的計画法', 'グラフ', '文字列処理', '数学',
      // システム設計
      'スケーラビリティ', '可用性', 'パフォーマンス', 'キャッシュ戦略', 'データベース設計',
      // データベース
      '正規化', 'インデックス', 'トランザクション', 'レプリケーション', 'パーティショニング',
      // ネットワーク
      'TCP/IP', 'HTTP', 'WebSocket', 'DNS', 'ロードバランシング',
      // セキュリティ
      '認証', '認可', '暗号化', 'セッション管理', 'XSS対策'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  timeLimit: {
    type: Number,
    required: true,
    min: 5,
    max: 120
  },
  tags: [{
    type: String,
    trim: true
  }],
  testCases: [{
    input: { type: mongoose.Schema.Types.Mixed, required: true },
    expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true }
  }],
  hints: [{
    type: String,
    required: true
  }],
  expectedAnswer: {
    type: String,
    required: true
  },
  followUpQuestions: [{
    type: String,
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // これにより、createdAtとupdatedAtが自動的に管理されます
});

export const InterviewProblemModel = mongoose.model<InterviewProblem>('InterviewProblem', interviewProblemSchema); 