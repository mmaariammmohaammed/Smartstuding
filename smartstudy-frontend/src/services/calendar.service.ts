import api from './api'
import { CalendarEvent } from '@/types'

export const calendarApi = {
  getAll: async (params?: { start?: string; end?: string; type?: string }): Promise<CalendarEvent[]> => {
    const { data } = await api.get('/calendar', { params })
    return data.data.events
  },

  getByRange: async (start: string, end: string): Promise<CalendarEvent[]> => {
    const { data } = await api.get('/calendar/range', { params: { start, end } })
    return data.data.events
  },

  getById: async (id: string): Promise<CalendarEvent> => {
    const { data } = await api.get(`/calendar/${id}`)
    return data.data.event
  },

  create: async (event: Omit<CalendarEvent, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> => {
    const { data } = await api.post('/calendar', event)
    return data.data.event
  },

  update: async (id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const { data } = await api.put(`/calendar/${id}`, event)
    return data.data.event
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/calendar/${id}`)
  },
}
