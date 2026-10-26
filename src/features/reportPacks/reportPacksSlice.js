import { createSlice } from '@reduxjs/toolkit'
import {
  fetchReportPacksThunk,
  createReportPackThunk,
  updateReportPackThunk,
  toggleReportPackStatusThunk,
  deleteReportPackThunk,
} from './reportPacksApi'

const reportPacksSlice = createSlice({
  name: 'reportPacks',
  initialState: {
    packs: [],
    loadingList: false,
    isSubmitting: false,
    deletingId: null,
    togglingId: null,
    error: null,
  },
  reducers: {
    clearReportPacksError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchReportPacksThunk
      .addCase(fetchReportPacksThunk.pending, (state) => {
        state.loadingList = true
        state.error = null
      })
      .addCase(fetchReportPacksThunk.fulfilled, (state, action) => {
        state.loadingList = false
        state.packs = action.payload || []
      })
      .addCase(fetchReportPacksThunk.rejected, (state, action) => {
        state.loadingList = false
        state.error = action.payload
      })

      // createReportPackThunk
      .addCase(createReportPackThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createReportPackThunk.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (action.payload) {
          state.packs.push(action.payload)
          state.packs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        }
      })
      .addCase(createReportPackThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })

      // updateReportPackThunk
      .addCase(updateReportPackThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updateReportPackThunk.fulfilled, (state, action) => {
        state.isSubmitting = false
        const updated = action.payload
        const index = state.packs.findIndex((p) => p.id === updated.id)
        if (index !== -1) {
          state.packs[index] = { ...state.packs[index], ...updated }
          state.packs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        }
      })
      .addCase(updateReportPackThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })

      // toggleReportPackStatusThunk
      .addCase(toggleReportPackStatusThunk.pending, (state, action) => {
        state.togglingId = action.meta.arg.id
        // Optimistic update
        const pack = state.packs.find((p) => p.id === action.meta.arg.id)
        if (pack) {
          pack.is_active = action.meta.arg.is_active
        }
      })
      .addCase(toggleReportPackStatusThunk.fulfilled, (state, action) => {
        state.togglingId = null
        const updated = action.payload
        const pack = state.packs.find((p) => p.id === updated.id)
        if (pack) {
          Object.assign(pack, updated)
        }
      })
      .addCase(toggleReportPackStatusThunk.rejected, (state, action) => {
        state.togglingId = null
        state.error = action.payload
        // Rollback optimistic update
        const pack = state.packs.find((p) => p.id === action.meta.arg.id)
        if (pack) {
          pack.is_active = !action.meta.arg.is_active
        }
      })

      // deleteReportPackThunk
      .addCase(deleteReportPackThunk.pending, (state, action) => {
        state.deletingId = action.meta.arg
      })
      .addCase(deleteReportPackThunk.fulfilled, (state, action) => {
        state.deletingId = null
        state.packs = state.packs.filter((p) => p.id !== action.payload.id)
      })
      .addCase(deleteReportPackThunk.rejected, (state, action) => {
        state.deletingId = null
        state.error = action.payload
      })
  },
})

export const { clearReportPacksError } = reportPacksSlice.actions
export default reportPacksSlice.reducer
