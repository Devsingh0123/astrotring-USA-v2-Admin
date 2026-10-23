import { createSlice } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '@/lib/constants'
import { loginAdminThunk, fetchAdminMeThunk, logoutAdminThunk } from './authApi'

const getStoredAdmin = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN))
const initialAdmin = getStoredAdmin()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    admin: initialAdmin,
    isAuthenticated: hasToken,
    isLoading: hasToken && !initialAdmin,
    isSubmitting: false,
    error: null,
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // loginAdminThunk
      .addCase(loginAdminThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(loginAdminThunk.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.admin = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginAdminThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.admin = null
        state.isAuthenticated = false
        state.error = action.payload
      })

      // fetchAdminMeThunk
      .addCase(fetchAdminMeThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchAdminMeThunk.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.admin = action.payload
          state.isAuthenticated = true
        } else {
          state.admin = null
          state.isAuthenticated = false
        }
      })
      .addCase(fetchAdminMeThunk.rejected, (state, action) => {
        state.isLoading = false
        state.admin = null
        state.isAuthenticated = false
        state.error = action.payload
      })

      // logoutAdminThunk
      .addCase(logoutAdminThunk.fulfilled, (state) => {
        state.admin = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
      })
  },
})

export const { clearAuthError } = authSlice.actions
export default authSlice.reducer
