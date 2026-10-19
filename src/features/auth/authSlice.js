import { createSlice } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '@/lib/constants'
import {
  sendOtpThunk,
  verifyOtpThunk,
  fetchCurrentUserThunk,
  logoutThunk,
} from './authApi'

const getStoredUser = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USER)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const initialUser = getStoredUser()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    isAuthenticated: Boolean(initialUser && initialUser.role === 'admin'),
    isLoading: Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)),
    isSubmitting: false,
    cooldownSeconds: 0,
    error: null,
  },
  reducers: {
    loginAsDemoAdmin: (state) => {
      const demoUser = {
        id: 'adm_0001_astrotring',
        email: 'admin@astrotring.com',
        fullName: 'Chief Astrologer Admin',
        role: 'admin',
        isEmailVerified: true,
        isDemo: true,
      }
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'demo_admin_token')
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser))
      state.user = demoUser
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
    },
    decrementCooldown: (state) => {
      if (state.cooldownSeconds > 0) {
        state.cooldownSeconds -= 1
      }
    },
    clearAuthError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // sendOtpThunk
      .addCase(sendOtpThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(sendOtpThunk.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.cooldownSeconds = action.payload?.data?.cooldownSeconds || 30
      })
      .addCase(sendOtpThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })

      // verifyOtpThunk
      .addCase(verifyOtpThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.user = action.payload
        state.isAuthenticated = Boolean(
          action.payload && action.payload.role === 'admin'
        )
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.user = null
        state.isAuthenticated = false
        state.error = action.payload
      })

      // fetchCurrentUserThunk
      .addCase(fetchCurrentUserThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCurrentUserThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = Boolean(
          action.payload && action.payload.role === 'admin'
        )
      })
      .addCase(fetchCurrentUserThunk.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
      })

      // logoutThunk
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
      })
  },
})

export const { loginAsDemoAdmin, decrementCooldown, clearAuthError } =
  authSlice.actions
export default authSlice.reducer
