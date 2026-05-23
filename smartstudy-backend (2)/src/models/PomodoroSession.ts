import mongoose, { Schema } from 'mongoose';
import { IPomodoroSession } from '../types';

export interface IPomodoroSessionDocument extends IPomodoroSession, mongoose.Document {}

const PomodoroSessionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    duration: {
      type: Number,
      required: true,
      default: 25,
    },
    breakDuration: {
      type: Number,
      default: 5,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

PomodoroSessionSchema.index({ userId: 1, startedAt: -1 });

export default mongoose.model<IPomodoroSessionDocument>('PomodoroSession', PomodoroSessionSchema);
