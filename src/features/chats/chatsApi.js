import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

/**
 * Fetch paginated list of AI chat threads with filters
 */
export const fetchChatsThunk = createAsyncThunk(
  'chats/fetchChats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/chats', { params })
      return response.data?.data || response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch AI chat threads.'
      )
    }
  }
)

/**
 * Fetch aggregate AI chat metrics and telemetry KPIs
 */
export const fetchChatStatsThunk = createAsyncThunk(
  'chats/fetchChatStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chats/stats')
      return response.data?.data || response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch AI chat statistics.'
      )
    }
  }
)

/**
 * Fetch turn-by-turn conversation messages and metadata by thread ID
 */
export const fetchChatThreadDetailsThunk = createAsyncThunk(
  'chats/fetchChatThreadDetails',
  async (threadId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chats/${threadId}`)
      return response.data?.data?.thread || response.data?.data || response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch chat thread conversation.'
      )
    }
  }
)
