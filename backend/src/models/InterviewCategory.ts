// models/InterviewCategory.ts
import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { IInterviewType } from './InterviewType';

export interface IInterviewCategory extends Document {
  type_id: Types.ObjectId | IInterviewType;
  name: string;
  description: string;
  parent_id?: Types.ObjectId | IInterviewCategory | null;
  created_at: Date;
  updated_at: Date;
}

const InterviewCategorySchema = new Schema<IInterviewCategory>({
  type_id: {
    type: Schema.Types.ObjectId,
    ref: 'InterviewType',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  parent_id: {
    type: Schema.Types.ObjectId,
    ref: 'InterviewCategory',
    default: null
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const InterviewCategory: Model<IInterviewCategory> = mongoose.model<IInterviewCategory>('InterviewCategory', InterviewCategorySchema);

export default InterviewCategory;