import mongoose, { Schema } from 'mongoose';
import { IAnalytics } from '../types';

export interface IAnalyticsDocument extends IAnalytics, mongoose.Document {}

const AnalyticsSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    studyTime: {
      type: Number,
      default: 0,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    pomodoroSessions: {
      type: Number,
      default: 0,
    },
    subjectsStudied: {
      type: [String],
      default: [],
    },
    streakDays: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

AnalyticsSchema.index({ userId: 1, date: -1 });
AnalyticsSchema.index({ userId: 1, date: 1 });

export default mongoose.model<IAnalyticsDocument>('Analytics', AnalyticsSchema);
