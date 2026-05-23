import api from './api'
import { Subject } from '@/types'

export const subjectApi = {
  getAll: async (): Promise<Subject[]> => {
    const { data } = await api.get('/subjects')
    return data.data.subjects
  },

  getById: async (id: string): Promise<Subject> => {
    const { data } = await api.get(`/subjects/${id}`)
    return data.data.subject
  },

  create: async (subject: Omit<Subject, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Subject> => {
    const { data } = await api.post('/subjects', subject)
    return data.data.subject
  },

  update: async (id: string, subject: Partial<Subject>): Promise<Subject> => {
    const { data } = await api.put(`/subjects/${id}`, subject)
    return data.data.subject
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/subjects/${id}`)
  },
}
