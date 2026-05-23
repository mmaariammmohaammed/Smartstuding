import api from './api'
import { StudyPlan } from '@/types'

export const studyPlanApi = {
  getAll: async (): Promise<StudyPlan[]> => {
    const { data } = await api.get('/study-plans')
    return data.data.studyPlans
  },

  getById: async (id: string): Promise<StudyPlan> => {
    const { data } = await api.get(`/study-plans/${id}`)
    return data.data.studyPlan
  },

  getActive: async (): Promise<StudyPlan | null> => {
    const { data } = await api.get('/study-plans/active')
    return data.data.studyPlan
  },

  create: async (plan: Omit<StudyPlan, '_id' | 'userId' | 'createdAt' | 'updatedAt' | 'schedule' | 'aiGenerated'>): Promise<StudyPlan> => {
    const { data } = await api.post('/study-plans', plan)
    return data.data.studyPlan
  },

  update: async (id: string, plan: Partial<StudyPlan>): Promise<StudyPlan> => {
    const { data } = await api.put(`/study-plans/${id}`, plan)
    return data.data.studyPlan
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/study-plans/${id}`)
  },
}
