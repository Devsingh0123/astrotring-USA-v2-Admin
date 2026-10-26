import { createSlice } from '@reduxjs/toolkit'
import { fetchDashboardStatsThunk } from './dashboardApi'

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    metrics: null,
    chartData: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearDashboardError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStatsThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStatsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.metrics = action.payload?.metrics || null
        state.chartData = action.payload?.chartData || []
      })
      .addCase(fetchDashboardStatsThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearDashboardError } = dashboardSlice.actions
export default dashboardSlice.reducer
