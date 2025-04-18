// models/InterviewSession.ts
import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { IUser } from '../types/user';
import { IProblem } from './Problem';
import { InterviewTypeEnum } from './InterviewType';

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type SpeakerType = 'user' | 'ai';
export type SubmissionStatus = 'submitted' | 'evaluated';

export interface IMessage {
  speaker: SpeakerType;
  message: string;
  timestamp: Date;
  sentiment_score?: number;
  clarity_score?: number;
  // New fields for video interviews
  audio_url?: string;
  transcript?: string;
}

export interface ISubmission {
  code: string;
  language: string;
  status: SubmissionStatus;
  passed_test_cases?: number;
  total_test_cases?: number;
  time_complexity_score?: number;
  space_complexity_score?: number;
  code_quality_score?: number;
  overall_score?: number;
  execution_time?: number;
  submitted_at: Date;
}

export interface IEvaluation {
  technical_score?: number;
  communication_score?: number;
  problem_solving_score?: number;
  code_quality_score?: number;
  overall_score: number;
  strengths?: string[];
  weaknesses?: string[];
  improvement_suggestions?: string[];
  feedback?: string;
  evaluated_at: Date;
}

// New interface for speech analysis
export interface ISpeechAnalysis {
  speech_rate?: number; // words per minute
  filler_word_count?: number; // um, uh, like, etc.
  clarity_score?: number; // how clear the speech is
  confidence_score?: number; // detected confidence level
  sentiment_analysis?: {
    positive: number;
    negative: number;
    neutral: number;
  };
  keywords?: string[]; // important keywords detected in speech
  analyzed_at: Date;
}

export interface IInterviewSession extends Document {
  user_id: Types.ObjectId | IUser;
  problem_id: Types.ObjectId | IProblem;
  interview_type: InterviewTypeEnum;
  status: SessionStatus;
  scheduled_time?: Date;
  start_time?: Date;
  end_time?: Date;
  video_recording_url?: string;
  audio_recording_url?: string;
  messages: IMessage[];
  submissions: ISubmission[];
  evaluation?: IEvaluation;
  // New fields for video interviews
  full_transcript?: string;
  speech_analysis?: ISpeechAnalysis;
  question_responses: {
    question: string;
    response_transcript: string;
    response_time: number; // in seconds
    response_quality_score?: number;
  }[];
  created_at: Date;
  updated_at: Date;
}

const MessageSchema = new Schema<IMessage>({
  speaker: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sentiment_score: Number,
  clarity_score: Number,
  // New fields for video interviews
  audio_url: String,
  transcript: String
});

const SubmissionSchema = new Schema<ISubmission>({
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['submitted', 'evaluated'],
    default: 'submitted'
  },
  passed_test_cases: Number,
  total_test_cases: Number,
  time_complexity_score: Number,
  space_complexity_score: Number,
  code_quality_score: Number,
  overall_score: Number,
  execution_time: Number,
  submitted_at: {
    type: Date,
    default: Date.now
  }
});

const EvaluationSchema = new Schema<IEvaluation>({
  technical_score: Number,
  communication_score: Number,
  problem_solving_score: Number,
  code_quality_score: Number,
  overall_score: Number,
  strengths: [String],
  weaknesses: [String],
  improvement_suggestions: [String],
  feedback: String,
  evaluated_at: {
    type: Date,
    default: Date.now
  }
});

// New schema for speech analysis
const SpeechAnalysisSchema = new Schema<ISpeechAnalysis>({
  speech_rate: Number,
  filler_word_count: Number,
  clarity_score: Number,
  confidence_score: Number,
  sentiment_analysis: {
    positive: Number,
    negative: Number,
    neutral: Number
  },
  keywords: [String],
  analyzed_at: {
    type: Date,
    default: Date.now
  }
});

const QuestionResponseSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  response_transcript: {
    type: String,
    required: true
  },
  response_time: {
    type: Number,
    required: true
  },
  response_quality_score: Number
});

const InterviewSessionSchema = new Schema<IInterviewSession>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem_id: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  interview_type: {
    type: String,
    enum: ['coding', 'technical', 'behavioral'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  scheduled_time: Date,
  start_time: Date,
  end_time: Date,
  video_recording_url: String,
  audio_recording_url: String,
  messages: [MessageSchema],
  submissions: [SubmissionSchema],
  evaluation: EvaluationSchema,
  // New fields for video interviews
  full_transcript: String,
  speech_analysis: SpeechAnalysisSchema,
  question_responses: [QuestionResponseSchema]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const InterviewSession: Model<IInterviewSession> = mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);

export default InterviewSession;