import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

/**
 * Fetch paginated staff administrators
 */
export const fetchAdminsThunk = createAsyncThunk(
  'admins/fetchAdmins',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admins', { params })
      return response.data?.data || response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch staff administrators.'
      )
    }
  }
)

/**
 * Create a new staff administrator (Super Admin only)
 */
export const createAdminThunk = createAsyncThunk(
  'admins/createAdmin',
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admins', adminData)
      return response.data?.data?.admin || response.data?.data || response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create administrator account.'
      )
    }
  }
)

/**
 * Update an administrator role (promote/demote between admin & super_admin)
 */
export const updateAdminRoleThunk = createAsyncThunk(
  'admins/updateAdminRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admins/${id}/role`, { role })
      return response.data?.data?.admin || response.data?.data || response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update administrator role.'
      )
    }
  }
)

/**
 * Suspend or activate administrator account
 */
export const updateAdminStatusThunk = createAsyncThunk(
  'admins/updateAdminStatus',
  async ({ id, is_blocked }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admins/${id}/status`, { is_blocked })
      return response.data?.data?.admin || response.data?.data || response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update administrator status.'
      )
    }
  }
)

/**
 * Delete administrator account (Super Admin only)
 */
export const deleteAdminThunk = createAsyncThunk(
  'admins/deleteAdmin',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admins/${id}`)
      return { id, ...(response.data?.data || {}) }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete administrator account.'
      )
    }
  }
)
