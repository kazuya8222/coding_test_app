// models/User.ts
import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, ISkill } from '../types/user'; 


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