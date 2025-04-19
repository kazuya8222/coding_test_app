export type InterviewType = 'coding' | 'technical' | 'behavioral';
export type InterviewRole = 'frontend' | 'backend' | 'fullstack' | 'devops';
export type InterviewDifficulty = 'easy' | 'medium' | 'hard';

export interface InterviewProblem {
  id: string;
  title: string;
  description: string;
  difficulty: InterviewDifficulty;
  type: InterviewType;
  role?: InterviewRole;
  language?: string;
  techStack?: string[];
  companyCulture?: string;
  time: number;
  question_script?: string;
  follow_up_questions?: string[];
  expected_answers?: string[];
  resources?: any;
}

export interface Interview {
  id: string;
  title: string;
  description: string;
  difficulty: InterviewDifficulty;
  type: InterviewType;
  role?: InterviewRole;
  language?: string;
  techStack?: string[];
  companyCulture?: string;
  time: number;
  status: 'not_started' | 'in_progress' | 'completed';
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
} 