import { createSlice } from '@reduxjs/toolkit'
import {
  fetchPacksThunk,
  createPackThunk,
  updatePackThunk,
  deletePackThunk,
} from './packsApi'

const packsSlice = createSlice({
  name: 'packs',
  initialState: {
    packs: [],
    loadingList: false,
    isSubmitting: false,
    deletingId: null,
    error: null,
  },
  reducers: {
    clearPacksError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPacksThunk
      .addCase(fetchPacksThunk.pending, (state) => {
        state.loadingList = true
        state.error = null
      })
      .addCase(fetchPacksThunk.fulfilled, (state, action) => {
        state.loadingList = false
        state.packs = action.payload || []
      })
      .addCase(fetchPacksThunk.rejected, (state, action) => {
        state.loadingList = false
        state.error = action.payload
      })

      // createPackThunk
      .addCase(createPackThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createPackThunk.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (action.payload) {
          state.packs.push(action.payload)
          state.packs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        }
      })
      .addCase(createPackThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })

      // updatePackThunk
      .addCase(updatePackThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updatePackThunk.fulfilled, (state, action) => {
        state.isSubmitting = false
        const updated = action.payload
        const index = state.packs.findIndex((p) => p.id === updated.id)
        if (index !== -1) {
          state.packs[index] = { ...state.packs[index], ...updated }
          state.packs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        }
      })
      .addCase(updatePackThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })

      // deletePackThunk
      .addCase(deletePackThunk.pending, (state, action) => {
        state.deletingId = action.meta.arg
      })
      .addCase(deletePackThunk.fulfilled, (state, action) => {
        state.deletingId = null
        state.packs = state.packs.filter((p) => p.id !== action.payload.id)
      })
      .addCase(deletePackThunk.rejected, (state, action) => {
        state.deletingId = null
        state.error = action.payload
      })
  },
})

export const { clearPacksError } = packsSlice.actions
export default packsSlice.reducer
