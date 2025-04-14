export interface InterviewProblem {
  _id: string;
  id: string;
  domain: string; // 分野（例：アルゴリズム、システム設計など）
  category: string; // カテゴリ（例：ソート、データ構造など）
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // 制限時間（分）
  tags: string[];
  hints: string[]; // ヒントの配列
  expectedAnswer: string; // 期待される回答の概要
  followUpQuestions: string[]; // フォローアップ質問の配列
  createdAt: Date;
  updatedAt: Date;
}

export interface ProblemSolution {
  id: string;
  problemId: string;
  userId: string;
  code: string;
  language: string;
  score: number;
  feedback: string;
  createdAt: string;
}

export interface DomainInfo {
  domain: string;
  categories: string[];
  averageDifficulty: number;
  commonTags: string[];
  description: string;
}

export interface CompanyInterviewInfo {
  company: string;
  categories: string[];
  averageDifficulty: number;
  commonTags: string[];
  description: string;
} 