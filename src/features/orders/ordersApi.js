import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

export const fetchOrdersThunk = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page = 1, limit = 20, status = '', search = '' } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit }
      if (status && status !== 'all') {
        params.status = status
      }
      if (search && search.trim()) {
        params.search = search.trim()
      }
      const { data } = await api.get('/orders', { params })
      return data?.data || data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to retrieve orders list.'
      )
    }
  }
)

export const fetchOrderDetailsThunk = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/${orderId}`)
      return data?.data?.order || data?.data || data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to retrieve order details.'
      )
    }
  }
)
