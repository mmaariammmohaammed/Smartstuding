export interface IUser {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'user' | 'admin';
  isPro: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  subscriptionExpiry?: Date;
  language: 'en' | 'ar';
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubject {
  _id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  _id: string;
  userId: string;
  subjectId?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudyPlan {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  subjects: Array<{
    subjectId: string;
    hoursPerWeek: number;
  }>;
  schedule: Array<{
    day: string;
    sessions: Array<{
      subjectId: string;
      startTime: string;
      endTime: string;
      taskId?: string;
    }>;
  }>;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPomodoroSession {
  _id: string;
  userId: string;
  taskId?: string;
  subjectId?: string;
  duration: number; // in minutes
  breakDuration: number;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
}

export interface ICalendarEvent {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: 'study' | 'task' | 'exam' | 'break' | 'other';
  subjectId?: string;
  taskId?: string;
  color?: string;
  isAllDay: boolean;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  reminder?: number; // minutes before
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task_reminder' | 'study_reminder' | 'subscription' | 'system' | 'achievement';
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface IAnalytics {
  _id: string;
  userId: string;
  date: Date;
  studyTime: number; // minutes
  tasksCompleted: number;
  pomodoroSessions: number;
  subjectsStudied: string[];
  streakDays: number;
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: IUser;
  token?: string;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  errors?: any[];
}
