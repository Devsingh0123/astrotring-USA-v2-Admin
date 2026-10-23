import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

export const fetchUsersThunk = createAsyncThunk(
  'users/fetchUsers',
  async ({ page = 1, limit = 20, search = '' } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit }
      if (search && search.trim()) {
        params.search = search.trim()
      }
      const { data } = await api.get('/users', { params })
      return data?.data || data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to retrieve users list.'
      )
    }
  }
)

export const fetchUserDetailsThunk = createAsyncThunk(
  'users/fetchUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/users/${userId}`)
      return data?.data?.user || data?.data || data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to retrieve user details.'
      )
    }
  }
)

export const updateUserStatusThunk = createAsyncThunk(
  'users/updateUserStatus',
  async ({ id, is_blocked }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/users/${id}/status`, { is_blocked })
      return data?.data || { id, is_blocked }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update user block status.'
      )
    }
  }
)
