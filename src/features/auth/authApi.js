import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'
import { STORAGE_KEYS } from '@/lib/constants'

const isAdminRole = (role) => ['admin', 'super_admin'].includes(role)

export const loginAdminThunk = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const payload = data?.data || data
      const admin = payload?.admin

      if (!admin || !isAdminRole(admin.role)) {
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
      if (!admin || !isAdminRole(admin.role)) {
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

/**
 * Update authenticated admin's profile (name, avatar_url)
 */
export const updateAdminProfileThunk = createAsyncThunk(
  'auth/updateAdminProfile',
  async ({ name, avatar_url }, { rejectWithValue }) => {
    try {
      const response = await api.patch('/auth/profile', { name, avatar_url })
      const updatedAdmin = response.data?.data?.admin || response.data?.data || response.data
      if (updatedAdmin) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(updatedAdmin))
      }
      return updatedAdmin
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update administrator profile.'
      )
    }
  }
)

/**
 * Change administrator password
 */
export const changeAdminPasswordThunk = createAsyncThunk(
  'auth/changeAdminPassword',
  async ({ current_password, new_password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/change-password', {
        current_password,
        new_password,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to change administrator password.'
      )
    }
  }
)

/**
 * Fetch live system, memory & database diagnostics
 */
export const fetchSystemStatusThunk = createAsyncThunk(
  'auth/fetchSystemStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/system-status')
      return response.data?.data || response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch system status diagnostics.'
      )
    }
  }
)
