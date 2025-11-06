import api from './api'

export interface User {
  user_id?: number
  username: string
  email: string
  phone_number: string
  user_type: 'admin' | 'manager' | 'seller'
  status: 'active' | 'suspended' | 'inactive'
  profile_photo?: string
  created_at?: string
  last_login?: string
}

export const userService = {
  getAll: async (params?: { user_type?: string; status?: string; search?: string }) => {
    const response = await api.get('/users', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  update: async (id: number, user: Partial<User>) => {
    const response = await api.put(`/users/${id}`, user)
    return response.data
  },

  updateStatus: async (id: number, status: 'active' | 'suspended' | 'inactive') => {
    const response = await api.put(`/users/${id}/status`, { status })
    return response.data
  },

  getStatistics: async () => {
    const response = await api.get('/users/statistics')
    return response.data
  },

  countByType: async (userType: string) => {
    const response = await api.get(`/users/count/${userType}`)
    return response.data
  },
}

