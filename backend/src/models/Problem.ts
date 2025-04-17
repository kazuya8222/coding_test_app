// models/Problem.ts
import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { IInterviewType, InterviewTypeEnum } from './InterviewType';
import { IInterviewCategory } from './InterviewCategory';

export type DifficultyType = 'easy' | 'medium' | 'hard';

export interface ITestCase {
  input: any;
  expected: any;
  is_hidden?: boolean;
}

export interface IProblem extends Document {
  title: string;
  description: string;
  difficulty: DifficultyType;
  category_id: Types.ObjectId | IInterviewCategory;
  interview_type_id: Types.ObjectId | IInterviewType;
  interview_type: InterviewTypeEnum;
  estimated_time: number;
  language_options?: string[];
  technologies?: string[];
  company_focus?: string[];
  popularity: number;
  
  // Coding specific fields
  starter_code?: string;
  test_cases?: ITestCase[];
  solution_code?: string;
  time_complexity?: string;
  space_complexity?: string;
  hints?: string[];
  common_mistakes?: string[];
  
  // Technical specific fields
  role_focus?: string[];
  question_script?: string;
  follow_up_questions?: string[];
  expected_answers?: string[];
  resources?: any;
  
  // Behavioral specific fields
  question_type?: string;
  company_culture?: string[];
  answer_evaluation_criteria?: string[];
  
  created_at: Date;
  updated_at: Date;
}

const TestCaseSchema = new Schema<ITestCase>({
  input: {
    type: Schema.Types.Mixed,
    required: true
  },
  expected: {
    type: Schema.Types.Mixed,
    required: true
  },
  is_hidden: {
    type: Boolean,
    default: false
  }
});

const ProblemSchema = new Schema<IProblem>({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: 'InterviewCategory',
    required: true
  },
  interview_type_id: {
    type: Schema.Types.ObjectId,
    ref: 'InterviewType',
    required: true
  },
  interview_type: {
    type: String,
    enum: ['coding', 'technical', 'behavioral'],
    required: true
  },
  estimated_time: {
    type: Number,  // minutes
    required: true
  },
  language_options: [String],
  technologies: [String],
  company_focus: [String],
  popularity: {
    type: Number,
    default: 0
  },
  
  // Coding specific fields
  starter_code: String,
  test_cases: [TestCaseSchema],
  solution_code: String,
  time_complexity: String,
  space_complexity: String,
  hints: [String],
  common_mistakes: [String],
  
  // Technical specific fields
  role_focus: [String],
  question_script: String,
  follow_up_questions: [String],
  expected_answers: [String],
  resources: Schema.Types.Mixed,
  
  // Behavioral specific fields
  question_type: String,
  company_culture: [String],
  answer_evaluation_criteria: [String]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Problem: Model<IProblem> = mongoose.model<IProblem>('Problem', ProblemSchema);

export default Problem;