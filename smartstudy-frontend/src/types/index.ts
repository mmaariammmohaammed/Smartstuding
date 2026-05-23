export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isPro: boolean;
  avatar?: string;
  language: string;
  subscriptionStatus?: string;
}

export interface Subject {
  _id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  userId: string;
  subjectId?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  estimatedTime?: number;
  actualTime?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlan {
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
  startDate: string;
  endDate: string;
  isActive: boolean;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSession {
  _id: string;
  userId: string;
  taskId?: string;
  subjectId?: string;
  duration: number;
  breakDuration: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface CalendarEvent {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: 'study' | 'task' | 'exam' | 'break' | 'other';
  subjectId?: string;
  taskId?: string;
  color?: string;
  isAllDay: boolean;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  reminder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface AnalyticsData {
  today: {
    studyTime: number;
    tasksCompleted: number;
    pomodoroSessions: number;
    streakDays: number;
  };
  weekly: {
    totalStudyTime: number;
    totalTasksCompleted: number;
    totalPomodoroSessions: number;
    avgStreak: number;
  };
  monthly: {
    totalStudyTime: number;
    totalTasksCompleted: number;
    totalPomodoroSessions: number;
  };
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  pomodoro: {
    totalSessions: number;
    totalMinutes: number;
  };
  dailyActivity: Array<{
    date: string;
    studyTime: number;
    tasksCompleted: number;
    pomodoroSessions: number;
  }>;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}
