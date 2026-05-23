import api from './api'
import { PomodoroSession } from '@/types'

export const pomodoroApi = {
  getAll: async (): Promise<PomodoroSession[]> => {
    const { data } = await api.get('/pomodoro')
    return data.data.sessions
  },

  getToday: async () => {
    const { data } = await api.get('/pomodoro/today')
    return data.data
  },

  start: async (data: { duration?: number; breakDuration?: number; taskId?: string; subjectId?: string }): Promise<PomodoroSession> => {
    const response = await api.post('/pomodoro', data)
    return response.data.data.session
  },

  complete: async (id: string): Promise<void> => {
    await api.put(`/pomodoro/${id}/complete`)
  },

  getStats: async () => {
    const { data } = await api.get('/pomodoro/stats')
    return data.data
  },
}
