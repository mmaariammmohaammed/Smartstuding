import api from './api'

export const aiApi = {
  generatePlan: async (data: {
    subjects: Array<{ id: string; name: string; difficulty?: string }>
    hoursPerDay: number
    startDate?: string
    endDate?: string
    preferences?: any
  }) => {
    const response = await api.post('/ai/generate-plan', data)
    return response.data.data.plan
  },

  getRecommendations: async (data: {
    currentSubjects?: string[]
    weakAreas?: string[]
    goals?: string
  }) => {
    const response = await api.post('/ai/recommendations', data)
    return response.data.data.recommendations
  },

  analyzeHabits: async () => {
    const response = await api.post('/ai/analyze-habits')
    return response.data.data.analysis
  },

  prioritizeTasks: async (tasks: any[]) => {
    const response = await api.post('/ai/prioritize-tasks', { tasks })
    return response.data.data.prioritizedTasks
  },
}
