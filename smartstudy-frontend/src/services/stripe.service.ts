import api from './api'

export const stripeApi = {
  createCheckout: async (): Promise<{ url: string; mockMode?: boolean }> => {
    const { data } = await api.post('/stripe/checkout')
    return data.data
  },

  getSubscription: async () => {
    const { data } = await api.get('/stripe/subscription')
    return data.data
  },

  createPortal: async (): Promise<{ url: string; mockMode?: boolean }> => {
    const { data } = await api.post('/stripe/portal')
    return data.data
  },
}
