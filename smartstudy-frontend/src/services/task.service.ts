import api from './api'
import { Task } from '@/types'

interface TaskFilters {
  status?: string
  priority?: string
  subjectId?: string
  search?: string
}

export const taskApi = {
  getAll: async (filters?: TaskFilters): Promise<Task[]> => {
    const { data } = await api.get('/tasks', { params: filters })
    return data.data.tasks
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await api.get(`/tasks/${id}`)
    return data.data.task
  },

  create: async (task: Omit<Task, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const { data } = await api.post('/tasks', task)
    return data.data.task
  },

  update: async (id: string, task: Partial<Task>): Promise<Task> => {
    const { data } = await api.put(`/tasks/${id}`, task)
    return data.data.task
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`)
  },

  getStats: async (): Promise<any> => {
    const { data } = await api.get('/tasks/stats')
    return data.data
  },
}
