export type InterviewType = 'coding' | 'technical' | 'behavioral';
export type InterviewRole = 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'devops';
export type InterviewDifficulty = 'easy' | 'medium' | 'hard';

export interface Interview {
  id: string;
  title: string;
  type: InterviewType;
  role?: InterviewRole;
  difficulty: InterviewDifficulty;
  time: string;
  description: string;
  language?: string;
  techStack?: string[];
  companyCulture?: string;
} 