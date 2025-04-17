// types/user.ts

import { Document } from 'mongoose';

export interface ISkill {
  name: string;
  category: 'technical' | 'soft';
  score: number;
  last_evaluated: Date;
}

export interface IUserProgress {
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

export interface IUserProfile {
  avatar_url?: string;
  bio?: string;
  preferred_languages?: string[];
  job_title?: string;
  experience_level: 'entry' | 'junior' | 'mid' | 'senior';
  target_companies?: string[];
}

export interface IUser extends Document {
  email: string;
  password_hash: string;
  name: string;
  role: 'user' | 'admin';
  profile: IUserProfile;
  progress: IUserProgress;
  skills: ISkill[];
  created_at: Date;
  updated_at: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
