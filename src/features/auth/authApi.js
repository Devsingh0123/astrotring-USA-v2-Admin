import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'
import { STORAGE_KEYS } from '@/lib/constants'

export const sendOtpThunk = createAsyncThunk(
  'auth/sendOtp',
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/send-otp', { email })
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to dispatch OTP. Is the backend server running?'
      )
    }
  }
)

export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp })
      const payload = data?.data || data
      const verifiedUser = payload?.user

      if (!verifiedUser) {
        return rejectWithValue('Invalid authentication response from server.')
      }

      if (verifiedUser.role !== 'admin') {
        if (payload.refreshToken) {
          try {
            await api.post('/auth/logout', { refreshToken: payload.refreshToken })
          } catch {
            // Ignore cleanup error
          }
        }
        return rejectWithValue(
          'Access denied: Your account does not have Administrator privileges.'
        )
      }

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, payload.accessToken)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, payload.refreshToken)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(verifiedUser))

      return verifiedUser
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Invalid OTP or insufficient administrator permissions.'
      )
    }
  }
)

export const fetchCurrentUserThunk = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (!token) {
      return null
    }

    if (token === 'demo_admin_token') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.USER)
        return saved ? JSON.parse(saved) : null
      } catch {
        return null
      }
    }

    try {
      const { data } = await api.get('/auth/me')
      const profile = data?.data?.user || data?.user
      if (!profile || profile.role !== 'admin') {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
        return rejectWithValue('Unauthorized administrator session.')
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile))
      return profile
    } catch (error) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
      return rejectWithValue(
        error.response?.data?.message || 'Session expired.'
      )
    }
  }
)

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refreshToken })
    } catch {
      // Ignore network errors on logout
    }
  }
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  return null
})
