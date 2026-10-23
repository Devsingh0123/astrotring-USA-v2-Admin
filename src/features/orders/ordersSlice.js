import { createSlice } from '@reduxjs/toolkit'
import { fetchOrdersThunk, fetchOrderDetailsThunk } from './ordersApi'

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
    selectedOrder: null,
    loadingList: false,
    loadingDetails: false,
    error: null,
  },
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null
      state.loadingDetails = false
    },
    clearOrdersError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchOrdersThunk
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.loadingList = true
        state.error = null
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.loadingList = false
        state.orders = action.payload?.orders || []
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination
        }
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.loadingList = false
        state.error = action.payload
      })

      // fetchOrderDetailsThunk
      .addCase(fetchOrderDetailsThunk.pending, (state) => {
        state.loadingDetails = true
        state.error = null
      })
      .addCase(fetchOrderDetailsThunk.fulfilled, (state, action) => {
        state.loadingDetails = false
        state.selectedOrder = action.payload
      })
      .addCase(fetchOrderDetailsThunk.rejected, (state, action) => {
        state.loadingDetails = false
        state.error = action.payload
      })
  },
})

export const { clearSelectedOrder, clearOrdersError } = ordersSlice.actions
export default ordersSlice.reducer
