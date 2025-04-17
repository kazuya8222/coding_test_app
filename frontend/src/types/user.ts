export interface DashboardStats {
  totalInterviews: number;
  weeklyChange: number;
  averageScore: number;
  monthlyScoreChange: number;
  problemsSolved: number;
  progressPercentage: number;
  nextLevel: string;
  levelProgress: number;
}
export interface RecentActivity {
  id: string;
  message: string;
  timeAgo: string;
}

export interface SkillProgress {
  technical: {
    [key: string]: number;
  };
  soft: {
    [key: string]: number;
  };
}
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
} 