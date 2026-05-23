import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  CheckSquare,
  Timer,
  TrendingUp,
  Calendar,
  ArrowRight,
  Flame,
} from 'lucide-react'
import { analyticsApi } from '@/services/analytics.service'
import { taskApi } from '@/services/task.service'
import { subjectApi } from '@/services/subject.service'
import { formatTime } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { data: analytics } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => analyticsApi.getDashboard(),
  })

  const { data: tasks } = useQuery({
    queryKey: ['recent-tasks'],
    queryFn: () => taskApi.getAll({ status: 'pending' }),
  })

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectApi.getAll(),
  })

  const stats = [
    {
      title: 'Study Time Today',
      value: formatTime(analytics?.data?.today?.studyTime || 0),
      icon: Timer,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Tasks Completed',
      value: analytics?.data?.today?.tasksCompleted || 0,
      icon: CheckSquare,
      color: 'bg-green-500',
      trend: '+5%',
    },
    {
      title: 'Current Streak',
      value: `${analytics?.data?.today?.streakDays || 0} days`,
      icon: Flame,
      color: 'bg-orange-500',
      trend: 'On fire!',
    },
    {
      title: 'Subjects',
      value: subjects?.length || 0,
      icon: BookOpen,
      color: 'bg-purple-500',
      trend: 'Active',
    },
  ]

  const chartData = analytics?.data?.dailyActivity?.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    studyTime: day.studyTime,
    tasks: day.tasksCompleted,
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your study progress and productivity</p>
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
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">{stat.trend}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Activity Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Study Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                  dataKey="studyTime"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/pomodoro"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium">Start Pomodoro</p>
                <p className="text-sm text-muted-foreground">25 min focus session</p>
              </div>
            </Link>

            <Link
              to="/tasks"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Add Task</p>
                <p className="text-sm text-muted-foreground">Track your assignments</p>
              </div>
            </Link>

            <Link
              to="/calendar"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">View Calendar</p>
                <p className="text-sm text-muted-foreground">Plan your schedule</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Tasks</h2>
          <Link
            to="/tasks"
            className="text-sm text-primary flex items-center gap-1 hover:underline"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {tasks && tasks.length > 0 ? (
            tasks.slice(0, 5).map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">No tasks yet. Create your first task!</p>
          )}
        </div>
      </div>
    </div>
  )
}
