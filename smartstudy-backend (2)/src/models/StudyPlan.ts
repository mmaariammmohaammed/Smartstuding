import mongoose, { Schema } from 'mongoose';
import { IStudyPlan } from '../types';

export interface IStudyPlanDocument extends IStudyPlan, mongoose.Document {}

const StudyPlanSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Study plan title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    subjects: [
      {
        subjectId: {
          type: Schema.Types.ObjectId,
          ref: 'Subject',
          required: true,
        },
        hoursPerWeek: {
          type: Number,
          default: 5,
          min: 0,
        },
      },
    ],
    schedule: [
      {
        day: {
          type: String,
          required: true,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        sessions: [
          {
            subjectId: {
              type: Schema.Types.ObjectId,
              ref: 'Subject',
              required: true,
            },
            startTime: {
              type: String,
              required: true,
            },
            endTime: {
              type: String,
              required: true,
            },
            taskId: {
              type: Schema.Types.ObjectId,
              ref: 'Task',
              default: null,
            },
          },
        ],
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

StudyPlanSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<IStudyPlanDocument>('StudyPlan', StudyPlanSchema);
