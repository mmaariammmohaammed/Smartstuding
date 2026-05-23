import api from './api'
import { Notification } from '@/types'

export const notificationApi = {
  getAll: async (unreadOnly?: boolean): Promise<{ notifications: Notification[]; unreadCount: number }> => {
    const { data } = await api.get('/notifications', { params: { unreadOnly } })
    return data.data
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.put(`/notifications/${id}/read`)
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all')
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`)
  },
}
