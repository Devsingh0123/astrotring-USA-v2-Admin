import { createSlice } from '@reduxjs/toolkit'
import {
  fetchChatsThunk,
  fetchChatStatsThunk,
  fetchChatThreadDetailsThunk,
} from './chatsApi'

const initialState = {
  threads: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  },
  stats: null,
  selectedThread: null,
  loadingThreads: false,
  loadingStats: false,
  loadingThreadDetails: false,
  error: null,
}

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    clearChatsError: (state) => {
      state.error = null
    },
    clearSelectedThread: (state) => {
      state.selectedThread = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchChatsThunk
      .addCase(fetchChatsThunk.pending, (state) => {
        state.loadingThreads = true
        state.error = null
      })
      .addCase(fetchChatsThunk.fulfilled, (state, action) => {
        state.loadingThreads = false
        state.threads = action.payload?.threads || []
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination
        }
      })
      .addCase(fetchChatsThunk.rejected, (state, action) => {
        state.loadingThreads = false
        state.error = action.payload
      })

      // fetchChatStatsThunk
      .addCase(fetchChatStatsThunk.pending, (state) => {
        state.loadingStats = true
      })
      .addCase(fetchChatStatsThunk.fulfilled, (state, action) => {
        state.loadingStats = false
        state.stats = action.payload
      })
      .addCase(fetchChatStatsThunk.rejected, (state, action) => {
        state.loadingStats = false
      })

      // fetchChatThreadDetailsThunk
      .addCase(fetchChatThreadDetailsThunk.pending, (state) => {
        state.loadingThreadDetails = true
        state.error = null
      })
      .addCase(fetchChatThreadDetailsThunk.fulfilled, (state, action) => {
        state.loadingThreadDetails = false
        state.selectedThread = action.payload
      })
      .addCase(fetchChatThreadDetailsThunk.rejected, (state, action) => {
        state.loadingThreadDetails = false
        state.error = action.payload
      })
  },
})

export const { clearChatsError, clearSelectedThread } = chatsSlice.actions
export default chatsSlice.reducer
