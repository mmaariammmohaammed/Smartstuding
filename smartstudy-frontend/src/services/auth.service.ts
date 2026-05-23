import api from './api'
import { User } from '@/types'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials)
    return data.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data)
    return response.data.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me')
    return data.data.user
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/update-password', { currentPassword, newPassword })
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const { data } = await api.post('/auth/refresh', { refreshToken })
    return data.data
  },
}
