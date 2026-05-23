import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Play, Pause, RotateCcw, Coffee, Brain, CheckCircle } from 'lucide-react'
import { pomodoroApi } from '@/services/pomodoro.service'
import toast from 'react-hot-toast'
import { formatTime } from '@/lib/utils'

const MODES = {
  focus: { label: 'Focus', minutes: 25, color: 'bg-blue-500' },
  shortBreak: { label: 'Short Break', minutes: 5, color: 'bg-green-500' },
  longBreak: { label: 'Long Break', minutes: 15, color: 'bg-purple-500' },
}

export default function Pomodoro() {
  const [mode, setMode] = useState<keyof typeof MODES>('focus')
  const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60)
  const [isActive, setIsActive] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [completedSessions, setCompletedSessions] = useState(0)

  const queryClient = useQueryClient()

  const { data: todaySessions } = useQuery({
    queryKey: ['pomodoro-today'],
    queryFn: () => pomodoroApi.getToday(),
  })

  const startMutation = useMutation({
    mutationFn: pomodoroApi.start,
    onSuccess: (data) => {
      setSessionId(data._id)
      toast.success('Focus session started!')
    },
  })

  const completeMutation = useMutation({
    mutationFn: pomodoroApi.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro-today'] })
      setCompletedSessions((prev) => prev + 1)
      toast.success('Session completed! Great job!')
    },
  })

  const toggleTimer = () => {
    if (!isActive) {
      if (!sessionId) {
        startMutation.mutate({
          duration: MODES[mode].minutes,
          breakDuration: mode === 'focus' ? 5 : 0,
        })
      }
      setIsActive(true)
    } else {
      setIsActive(false)
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(MODES[mode].minutes * 60)
    setSessionId(null)
  }

  const switchMode = (newMode: keyof typeof MODES) => {
    setMode(newMode)
    setTimeLeft(MODES[newMode].minutes * 60)
    setIsActive(false)
    setSessionId(null)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      if (sessionId && mode === 'focus') {
        completeMutation.mutate(sessionId)
      }
      // Auto switch to break after focus
      if (mode === 'focus') {
        const nextMode = completedSessions % 4 === 3 ? 'longBreak' : 'shortBreak'
        switchMode(nextMode)
      }
    }

    return () => clearInterval(interval)
  }, [isActive, timeLeft, sessionId, mode, completedSessions])

  const progress = ((MODES[mode].minutes * 60 - timeLeft) / (MODES[mode].minutes * 60)) * 100

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pomodoro Timer</h1>
        <p className="text-muted-foreground mt-1">Stay focused and productive</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-8">
            {/* Mode Switcher */}
            <div className="flex justify-center gap-2 mb-8">
              {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === m
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent'
                  }`}
                >
                  {MODES[m].label}
                </button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-foreground">
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-sm text-muted-foreground mt-2">{MODES[mode].label}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleTimer}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 ${
                  isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
              <button
                onClick={resetTimer}
                className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-accent transition-all"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Focus Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Eliminate distractions - put your phone away
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Focus on one task at a time
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Take a 5-minute break after each session
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                After 4 sessions, take a longer 15-30 minute break
              </li>
            </ul>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Today's Sessions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Coffee className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Completed</p>
                    <p className="text-sm text-muted-foreground">Focus sessions</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{todaySessions?.completedSessions || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Total Time</p>
                    <p className="text-sm text-muted-foreground">Minutes focused</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{todaySessions?.totalMinutes || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Current Streak</p>
                    <p className="text-sm text-muted-foreground">Sessions today</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{completedSessions}</span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <h3 className="font-semibold text-primary mb-2">Pro Tip</h3>
            <p className="text-sm text-muted-foreground">
              Use the Pomodoro Technique to maintain high productivity while avoiding burnout. 
              Regular breaks help your brain consolidate information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
