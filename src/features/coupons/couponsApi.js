import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

export const fetchCouponsThunk = createAsyncThunk(
  'coupons/fetchCoupons',
  async ({ search = '', is_active } = {}, { rejectWithValue }) => {
    try {
      const params = {}
      if (search && search.trim()) {
        params.search = search.trim()
      }
      if (is_active !== undefined && is_active !== 'all' && is_active !== '') {
        params.is_active = is_active
      }
      const { data } = await api.get('/coupons', { params })
      return data?.data?.coupons || []
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to retrieve coupons list.'
      )
    }
  }
)

export const createCouponThunk = createAsyncThunk(
  'coupons/createCoupon',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/coupons', payload)
      return data?.data?.coupon || data?.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to create coupon.'
      )
    }
  }
)

export const toggleCouponStatusThunk = createAsyncThunk(
  'coupons/toggleStatus',
  async ({ id, is_active }, { rejectWithValue }) => {
    try {
      const body = is_active !== undefined ? { is_active } : {}
      const { data } = await api.patch(`/coupons/${id}/status`, body)
      return data?.data || { id, is_active }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update coupon status.'
      )
    }
  }
)
