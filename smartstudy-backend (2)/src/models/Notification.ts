import mongoose, { Schema } from 'mongoose';
import { INotification } from '../types';

export interface INotificationDocument extends INotification, mongoose.Document {}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['task_reminder', 'study_reminder', 'subscription', 'system', 'achievement'],
      default: 'system',
    },
    read: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INotificationDocument>('Notification', NotificationSchema);
