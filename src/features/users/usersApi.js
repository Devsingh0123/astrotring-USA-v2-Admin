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

/**
 * Adjust user credits (questions or reports: add, deduct, set)
 */
export const adjustUserCreditsThunk = createAsyncThunk(
  'users/adjustUserCredits',
  async ({ id, credit_type, action, amount, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/users/${id}/credits`, {
        credit_type,
        action,
        amount: Number(amount),
        reason: reason?.trim() || undefined,
      })
      return data?.data?.user || data?.data || data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to adjust user credits.'
      )
    }
  }
)

/**
 * Export users data to CSV file
 */
export const exportUsersCsvThunk = createAsyncThunk(
  'users/exportUsersCsv',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/export', {
        params: filters,
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const contentDisposition = response.headers?.['content-disposition']
      let filename = `astrotring-users-${new Date().toISOString().split('T')[0]}.csv`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/)
        if (match && match[1]) filename = match[1]
      }

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return { success: true, filename }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to export users CSV.'
      )
    }
  }
)
