import { logger } from '../utils/logger';
import Task from '../models/Task';
import PomodoroSession from '../models/PomodoroSession';
import Analytics from '../models/Analytics';
import { subDays } from 'date-fns';

interface StudyPlanInput {
  userId: string;
  subjects: Array<{ id: string; name: string; difficulty?: string }>;
  hoursPerDay: number;
  startDate?: string;
  endDate?: string;
  preferences?: {
    preferredStudyTime?: string;
    breakInterval?: number;
    weekendStudy?: boolean;
  };
}

interface RecommendationInput {
  userId: string;
  currentSubjects?: string[];
  weakAreas?: string[];
  goals?: string;
}

export const generateStudyPlan = async (input: StudyPlanInput) => {
  try {
    const { subjects, hoursPerDay, startDate, endDate, preferences } = input;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalHours = days * hoursPerDay;
    const hoursPerSubject = totalHours / subjects.length;

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule = [];

    for (let i = 0; i < daysOfWeek.length; i++) {
      const day = daysOfWeek[i];
      const isWeekend = day === 'Saturday' || day === 'Sunday';

      if (isWeekend && preferences?.weekendStudy === false) {
        schedule.push({ day, sessions: [] });
        continue;
      }

      const dayHours = isWeekend ? Math.max(1, hoursPerDay * 0.5) : hoursPerDay;
      const sessionsPerDay = Math.ceil(dayHours / 1.5); // 1.5 hour sessions
      const sessionDuration = Math.floor((dayHours / sessionsPerDay) * 60); // in minutes

      const sessions = [];
      let currentTime = preferences?.preferredStudyTime === 'evening' ? 14 : 9; // 2 PM or 9 AM

      for (let j = 0; j < sessionsPerDay && j < subjects.length; j++) {
        const subjectIndex = (i + j) % subjects.length;
        const subject = subjects[subjectIndex];

        sessions.push({
          subjectId: subject.id,
          startTime: `${currentTime.toString().padStart(2, '0')}:00`,
          endTime: `${(currentTime + Math.floor(sessionDuration / 60)).toString().padStart(2, '0')}:${(sessionDuration % 60).toString().padStart(2, '0')}`,
        });

        currentTime += Math.floor(sessionDuration / 60) + 1; // +1 hour break
      }

      schedule.push({ day, sessions });
    }

    return {
      title: `AI Generated Study Plan - ${subjects.map(s => s.name).join(', ')}`,
      description: `Automatically generated study plan covering ${subjects.length} subjects over ${days} days.`,
      subjects: subjects.map(s => ({
        subjectId: s.id,
        hoursPerWeek: Math.round(hoursPerSubject / (days / 7)),
      })),
      schedule,
      startDate: start,
      endDate: end,
      aiGenerated: true,
    };
  } catch (error) {
    logger.error('AI Study Plan Generation Error:', error);
    throw new Error('Failed to generate study plan');
  }
};

export const getStudyRecommendations = async (input: RecommendationInput) => {
  try {
    const { currentSubjects, weakAreas, goals } = input;

    const recommendations = [];

    if (weakAreas && weakAreas.length > 0) {
      recommendations.push({
        type: 'focus_area',
        title: 'Focus on Weak Areas',
        description: `Spend extra time on: ${weakAreas.join(', ')}. Consider using flashcards and practice tests.`,
        priority: 'high',
      });
    }

    if (currentSubjects && currentSubjects.length > 5) {
      recommendations.push({
        type: 'workload',
        title: 'Manage Workload',
        description: 'You have many subjects. Consider prioritizing based on upcoming exams or deadlines.',
        priority: 'medium',
      });
    }

    recommendations.push({
      type: 'technique',
      title: 'Pomodoro Technique',
      description: 'Use 25-minute focused sessions with 5-minute breaks for better retention.',
      priority: 'medium',
    });

    recommendations.push({
      type: 'review',
      title: 'Spaced Repetition',
      description: 'Review material at increasing intervals (1 day, 3 days, 1 week, 1 month).',
      priority: 'high',
    });

    if (goals) {
      recommendations.push({
        type: 'goal',
        title: 'Goal Alignment',
        description: `Align your daily tasks with your goal: "${goals}"`,
        priority: 'high',
      });
    }

    return recommendations;
  } catch (error) {
    logger.error('AI Recommendations Error:', error);
    throw new Error('Failed to get recommendations');
  }
};

export const analyzeStudyHabits = async (userId: string) => {
  try {
    const last30Days = subDays(new Date(), 30);

    // Get analytics data
    const analytics = await Analytics.find({
      userId,
      date: { $gte: last30Days },
    }).sort({ date: 1 });

    // Get task completion data
    const tasks = await Task.find({ userId });
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

    // Get pomodoro data
    const pomodoroSessions = await PomodoroSession.find({
      userId,
      startedAt: { $gte: last30Days },
    });

    const totalStudyTime = analytics.reduce((acc, a) => acc + a.studyTime, 0);
    const avgDailyStudy = analytics.length > 0 ? totalStudyTime / analytics.length : 0;
    const bestDay = analytics.length > 0 
      ? analytics.reduce((best, current) => current.studyTime > best.studyTime ? current : best, analytics[0])
      : null;

    const insights = [];

    if (avgDailyStudy < 60) {
      insights.push({
        type: 'improvement',
        title: 'Increase Study Time',
        description: `Your average daily study time is ${Math.round(avgDailyStudy)} minutes. Try to reach at least 90 minutes per day.`,
        severity: 'warning',
      });
    }

    if (completionRate < 50) {
      insights.push({
        type: 'improvement',
        title: 'Task Completion Rate Low',
        description: `Your completion rate is ${completionRate.toFixed(1)}%. Try breaking tasks into smaller chunks.`,
        severity: 'warning',
      });
    }

    if (pomodoroSessions.length < 10) {
      insights.push({
        type: 'suggestion',
        title: 'Use Pomodoro More',
        description: 'You've only completed a few pomodoro sessions. Try using the timer for focused study sessions.',
        severity: 'info',
      });
    }

    insights.push({
      type: 'positive',
      title: 'Consistency Tracking',
      description: `You've tracked ${analytics.length} days of study activity. Keep it up!`,
      severity: 'success',
    });

    return {
      summary: {
        totalStudyTime,
        avgDailyStudy: Math.round(avgDailyStudy),
        completionRate: Math.round(completionRate),
        totalPomodoroSessions: pomodoroSessions.length,
        bestDay: bestDay ? {
          date: bestDay.date,
          studyTime: bestDay.studyTime,
        } : null,
      },
      insights,
      trends: analytics.map(a => ({
        date: a.date,
        studyTime: a.studyTime,
        tasksCompleted: a.tasksCompleted,
      })),
    };
  } catch (error) {
    logger.error('AI Analysis Error:', error);
    throw new Error('Failed to analyze study habits');
  }
};
