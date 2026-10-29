import { createSlice } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '@/lib/constants'
import {
  loginAdminThunk,
  fetchAdminMeThunk,
  logoutAdminThunk,
  updateAdminProfileThunk,
  changeAdminPasswordThunk,
  fetchSystemStatusThunk,
} from './authApi'

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
    updatingProfile: false,
    changingPassword: false,
    systemStatus: null,
    loadingSystemStatus: false,
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
        state.systemStatus = null
        state.error = null
      })

      // updateAdminProfileThunk
      .addCase(updateAdminProfileThunk.pending, (state) => {
        state.updatingProfile = true
      })
      .addCase(updateAdminProfileThunk.fulfilled, (state, action) => {
        state.updatingProfile = false
        if (action.payload) {
          state.admin = { ...state.admin, ...action.payload }
        }
      })
      .addCase(updateAdminProfileThunk.rejected, (state) => {
        state.updatingProfile = false
      })

      // changeAdminPasswordThunk
      .addCase(changeAdminPasswordThunk.pending, (state) => {
        state.changingPassword = true
      })
      .addCase(changeAdminPasswordThunk.fulfilled, (state) => {
        state.changingPassword = false
      })
      .addCase(changeAdminPasswordThunk.rejected, (state) => {
        state.changingPassword = false
      })

      // fetchSystemStatusThunk
      .addCase(fetchSystemStatusThunk.pending, (state) => {
        state.loadingSystemStatus = true
      })
      .addCase(fetchSystemStatusThunk.fulfilled, (state, action) => {
        state.loadingSystemStatus = false
        state.systemStatus = action.payload
      })
      .addCase(fetchSystemStatusThunk.rejected, (state) => {
        state.loadingSystemStatus = false
      })
  },
})

export const { clearAuthError } = authSlice.actions
export default authSlice.reducer
