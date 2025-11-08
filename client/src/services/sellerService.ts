import api from './api'

export interface Seller {
  seller_id?: number
  user_id?: number
  full_name: string
  id_number: string
  business_name?: string
  business_type?: string
  tin_number?: string
  emergency_contact?: string
  address?: string
  registration_date?: string
  verification_status?: 'pending' | 'verified' | 'rejected'
  username?: string
  email?: string
  phone_number?: string
  account_status?: string
}

export const sellerService = {
  getAll: async (params?: { verification_status?: string; business_type?: string; search?: string }) => {
    const response = await api.get('/sellers', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/sellers/${id}`)
    return response.data
  },

  getByUserId: async (userId: number) => {
    const response = await api.get(`/sellers/user/${userId}`)
    return response.data
  },

  update: async (id: number, seller: Partial<Seller>) => {
    const response = await api.put(`/sellers/${id}`, seller)
    return response.data
  },

  updateVerificationStatus: async (id: number, status: 'pending' | 'verified' | 'rejected') => {
    const response = await api.put(`/sellers/${id}/verification`, { verification_status: status })
    return response.data
  },

  getStatistics: async (id: number) => {
    const response = await api.get(`/sellers/${id}/statistics`)
    return response.data
  },

  getAllocations: async (id: number) => {
    const response = await api.get(`/sellers/${id}/allocations`)
    return response.data
  },

  getPayments: async (id: number) => {
    const response = await api.get(`/sellers/${id}/payments`)
    return response.data
  },

  countByStatus: async () => {
    const response = await api.get('/sellers/count-by-status')
    return response.data
  },
}

