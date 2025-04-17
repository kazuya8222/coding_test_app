// models/User.ts
import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// インターフェース定義
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

// スキーマ定義
const SkillSchema = new Schema<ISkill>({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'soft'],
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  last_evaluated: {
    type: Date,
    default: Date.now
  }
});

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    avatar_url: String,
    bio: String,
    preferred_languages: [String],
    job_title: String,
    experience_level: {
      type: String,
      enum: ['entry', 'junior', 'mid', 'senior'],
      default: 'entry'
    },
    target_companies: [String]
  },
  progress: {
    coding_interviews_completed: {
      type: Number,
      default: 0
    },
    technical_interviews_completed: {
      type: Number,
      default: 0
    },
    behavioral_interviews_completed: {
      type: Number,
      default: 0
    },
    coding_avg_score: {
      type: Number,
      default: 0
    },
    technical_avg_score: {
      type: Number,
      default: 0
    },
    behavioral_avg_score: {
      type: Number,
      default: 0
    },
    total_problems_solved: {
      type: Number,
      default: 0
    },
    current_level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    level_progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  skills: [SkillSchema]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// パスワードハッシュ化のミドルウェア
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('Password hashing error'));
    }
  }
});

// パスワード検証メソッド
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;