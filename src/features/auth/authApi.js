import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'
import { STORAGE_KEYS } from '@/lib/constants'

export const loginAdminThunk = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const payload = data?.data || data
      const admin = payload?.admin

      if (!admin || admin.role !== 'admin') {
        return rejectWithValue('Access denied: Account does not have administrator privileges.')
      }

      if (payload.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, payload.accessToken)
      }
      if (payload.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, payload.refreshToken)
      }
      if (admin) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(admin))
      }

      return admin
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to sign in. Please verify your administrator credentials.'
      )
    }
  }
)

export const fetchAdminMeThunk = createAsyncThunk(
  'auth/fetchAdminMe',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (!token) {
      return null
    }

    try {
      const { data } = await api.get('/auth/me')
      const admin = data?.data?.admin || data?.admin
      if (!admin || admin.role !== 'admin') {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.ADMIN_USER)
        return rejectWithValue('Unauthorized administrator session.')
      }
      localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(admin))
      return admin
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.ADMIN_USER)
      }
      return rejectWithValue(
        error.response?.data?.message || 'Session expired. Please sign in again.'
      )
    }
  }
)

export const logoutAdminThunk = createAsyncThunk('auth/logoutAdmin', async () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.ADMIN_USER)
  return null
})
