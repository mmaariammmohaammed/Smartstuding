import mongoose, { Schema } from 'mongoose';
import { ISubject } from '../types';

export interface ISubjectDocument extends ISubject, mongoose.Document {}

const SubjectSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    icon: {
      type: String,
      default: 'book',
    },
    description: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

SubjectSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ISubjectDocument>('Subject', SubjectSchema);
