import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Flame,
  BookOpen,
} from 'lucide-react'
import { analyticsApi } from '@/services/analytics.service'
import { formatTime } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => analyticsApi.getDashboard(),
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  const data = analytics?.data

  const weeklyData = data?.dailyActivity?.map((day: any) => ({
    day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: Math.round((day.studyTime / 60) * 10) / 10,
    tasks: day.tasksCompleted,
  })) || []

  const completionData = [
    { name: 'Completed', value: data?.completedTasks || 0 },
    { name: 'Remaining', value: (data?.totalTasks || 0) - (data?.completedTasks || 0) },
  ]

  const stats = [
    {
      title: 'Total Study Time',
      value: formatTime((data?.weekly?.totalStudyTime || 0)),
      icon: Clock,
      color: 'bg-blue-500',
    },
    {
      title: 'Tasks Completed',
      value: data?.weekly?.totalTasksCompleted || 0,
      icon: Target,
      color: 'bg-green-500',
    },
    {
      title: 'Pomodoro Sessions',
      value: data?.weekly?.totalPomodoroSessions || 0,
      icon: Flame,
      color: 'bg-orange-500',
    },
    {
      title: 'Completion Rate',
      value: `${data?.completionRate || 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your study performance and productivity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Time Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Study Time (Hours)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Completion Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Task Completion
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {completionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {completionData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-sm text-muted-foreground">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Trend */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Tasks Completed Over Time
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Study Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
            <p className="font-medium text-blue-900">Study Streak</p>
            <p className="text-2xl font-bold text-blue-700">{data?.today?.streakDays || 0} days</p>
            <p className="text-sm text-blue-600 mt-1">Keep it up!</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <Target className="w-8 h-8 text-green-600 mb-2" />
            <p className="font-medium text-green-900">Productivity</p>
            <p className="text-2xl font-bold text-green-700">{data?.completionRate || 0}%</p>
            <p className="text-sm text-green-600 mt-1">Task completion rate</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <Flame className="w-8 h-8 text-purple-600 mb-2" />
            <p className="font-medium text-purple-900">Focus Score</p>
            <p className="text-2xl font-bold text-purple-700">{data?.pomodoro?.totalSessions || 0}</p>
            <p className="text-sm text-purple-600 mt-1">Total pomodoro sessions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
