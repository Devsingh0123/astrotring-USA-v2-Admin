import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

export const fetchDashboardStatsThunk = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/dashboard')
      return data?.data || {}
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to retrieve dashboard telemetry.'
      )
    }
  }
)
