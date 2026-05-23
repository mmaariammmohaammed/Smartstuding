import api from './api'

export const analyticsApi = {
  getDashboard: async () => {
    const { data } = await api.get('/analytics/dashboard')
    return data
  },

  getStudyTime: async (period?: string) => {
    const { data } = await api.get('/analytics/study-time', { params: { period } })
    return data
  },

  record: async (data: { studyTime?: number; tasksCompleted?: number; pomodoroSessions?: number }) => {
    const response = await api.post('/analytics/record', data)
    return response.data
  },
}
