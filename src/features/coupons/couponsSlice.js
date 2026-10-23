import { createSlice } from '@reduxjs/toolkit'
import {
  fetchCouponsThunk,
  createCouponThunk,
  toggleCouponStatusThunk,
} from './couponsApi'

const couponsSlice = createSlice({
  name: 'coupons',
  initialState: {
    coupons: [],
    loadingList: false,
    isCreating: false,
    togglingId: null,
    error: null,
    createError: null,
  },
  reducers: {
    clearCouponsError: (state) => {
      state.error = null
      state.createError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCouponsThunk
      .addCase(fetchCouponsThunk.pending, (state) => {
        state.loadingList = true
        state.error = null
      })
      .addCase(fetchCouponsThunk.fulfilled, (state, action) => {
        state.loadingList = false
        state.coupons = action.payload || []
      })
      .addCase(fetchCouponsThunk.rejected, (state, action) => {
        state.loadingList = false
        state.error = action.payload
      })

      // createCouponThunk
      .addCase(createCouponThunk.pending, (state) => {
        state.isCreating = true
        state.createError = null
      })
      .addCase(createCouponThunk.fulfilled, (state, action) => {
        state.isCreating = false
        if (action.payload) {
          state.coupons.unshift(action.payload)
        }
      })
      .addCase(createCouponThunk.rejected, (state, action) => {
        state.isCreating = false
        state.createError = action.payload
      })

      // toggleCouponStatusThunk
      .addCase(toggleCouponStatusThunk.pending, (state, action) => {
        state.togglingId = action.meta.arg?.id
      })
      .addCase(toggleCouponStatusThunk.fulfilled, (state, action) => {
        state.togglingId = null
        const updated = action.payload
        const index = state.coupons.findIndex((c) => c.id === updated.id)
        if (index !== -1) {
          state.coupons[index] = {
            ...state.coupons[index],
            is_active: updated.is_active,
          }
        }
      })
      .addCase(toggleCouponStatusThunk.rejected, (state, action) => {
        state.togglingId = null
        state.error = action.payload
      })
  },
})

export const { clearCouponsError } = couponsSlice.actions
export default couponsSlice.reducer
