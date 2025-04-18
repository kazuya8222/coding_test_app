// types/user.ts
export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior';

export interface UserProfile {
  avatar_url?: string;
  bio?: string;
  preferred_languages?: string[];
  job_title?: string;
  experience_level: ExperienceLevel;
  target_companies?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  profile: UserProfile;
}

export interface AuthUser extends User {
  token: string;
}

export interface UserProgress {
  coding_interviews_completed: number;
  technical_interviews_completed: number;
  behavioral_interviews_completed: number;
  coding_avg_score: number;
  technical_avg_score: number;
  behavioral_avg_score: number;
  total_problems_solved: number;
  current_level: 'beginner' | 'intermediate' | 'advanced';
  level_progress: number;
}

export interface Skill {
  name: string;
  category: 'technical' | 'soft';
  score: number;
  last_evaluated: Date;
}

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
  technical: Record<string, number>;
  soft: Record<string, number>;
}

export interface UserUpdateRequest {
  name?: string;
}

export interface UserProfileUpdateRequest {
  user?: UserUpdateRequest;
  profile?: Partial<UserProfile>;
}