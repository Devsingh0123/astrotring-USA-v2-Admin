import { createSlice } from '@reduxjs/toolkit'
import {
  fetchOrdersThunk,
  fetchOrderDetailsThunk,
  refundOrderThunk,
} from './ordersApi'

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
    refundingId: null,
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

      // refundOrderThunk
      .addCase(refundOrderThunk.pending, (state, action) => {
        state.refundingId = action.meta.arg?.orderId
        state.error = null
      })
      .addCase(refundOrderThunk.fulfilled, (state, action) => {
        state.refundingId = null
        const { orderId } = action.payload
        const orderIdx = state.orders.findIndex((o) => o.id === orderId)
        if (orderIdx !== -1) {
          state.orders[orderIdx] = {
            ...state.orders[orderIdx],
            status: 'refunded',
            is_credited: false,
          }
        }
        if (state.selectedOrder && state.selectedOrder.id === orderId) {
          state.selectedOrder = {
            ...state.selectedOrder,
            status: 'refunded',
            is_credited: false,
            invoice: state.selectedOrder.invoice
              ? {
                  ...state.selectedOrder.invoice,
                  status: 'REFUNDED',
                }
              : undefined,
          }
        }
      })
      .addCase(refundOrderThunk.rejected, (state, action) => {
        state.refundingId = null
        state.error = action.payload
      })
  },
})

export const { clearSelectedOrder, clearOrdersError } = ordersSlice.actions
export default ordersSlice.reducer
