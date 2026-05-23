import mongoose, { Schema } from 'mongoose';
import { ICalendarEvent } from '../types';

export interface ICalendarEventDocument extends ICalendarEvent, mongoose.Document {}

const CalendarEventSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['study', 'task', 'exam', 'break', 'other'],
      default: 'study',
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
    },
    reminder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

CalendarEventSchema.index({ userId: 1, startDate: 1 });
CalendarEventSchema.index({ userId: 1, type: 1 });

export default mongoose.model<ICalendarEventDocument>('CalendarEvent', CalendarEventSchema);
