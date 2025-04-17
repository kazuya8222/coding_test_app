// models/InterviewType.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export type InterviewTypeEnum = 'coding' | 'technical' | 'behavioral';

export interface IInterviewType extends Document {
  name: InterviewTypeEnum;
  description: string;
  created_at: Date;
  updated_at: Date;
}

const InterviewTypeSchema = new Schema<IInterviewType>({
  name: {
    type: String,
    required: true,
    enum: ['coding', 'technical', 'behavioral'],
    unique: true
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const InterviewType: Model<IInterviewType> = mongoose.model<IInterviewType>('InterviewType', InterviewTypeSchema);

export default InterviewType;