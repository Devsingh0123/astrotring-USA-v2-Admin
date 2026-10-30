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

export const refundOrderThunk = createAsyncThunk(
  'orders/refundOrder',
  async ({ orderId, amount, reason } = {}, { rejectWithValue }) => {
    try {
      const payload = {}
      if (amount !== undefined && amount !== null && amount !== '') {
        const parsed = parseFloat(amount)
        if (!isNaN(parsed) && parsed > 0) {
          payload.amount = parsed
        }
      }
      if (reason && reason.trim()) {
        payload.reason = reason.trim()
      }
      const { data } = await api.post(`/orders/${orderId}/refund`, payload)
      return {
        orderId,
        refund: data?.data?.refund,
        status: data?.data?.status || 'refunded',
        message: data?.message || 'Order refunded successfully',
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to process order refund.'
      )
    }
  }
)

/**
 * Fetch and open print-ready GST HTML Invoice in a new window
 */
export const openOrderInvoicePrintThunk = createAsyncThunk(
  'orders/openOrderInvoicePrint',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice?format=html`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')
      if (!printWindow) {
        throw new Error('Pop-up window was blocked. Please allow pop-ups for this domain.')
      }
      return { success: true }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to load printable invoice.'
      )
    }
  }
)

/**
 * Export orders data as CSV with filters
 */
export const exportOrdersCsvThunk = createAsyncThunk(
  'orders/exportOrdersCsv',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = {}
      if (filters.status && filters.status !== 'all') params.status = filters.status
      if (filters.currency && filters.currency !== 'all') params.currency = filters.currency
      if (filters.product_type && filters.product_type !== 'all') params.product_type = filters.product_type
      if (filters.search && filters.search.trim()) params.search = filters.search.trim()
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to

      const response = await api.get('/orders/export', {
        params,
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const contentDisposition = response.headers?.['content-disposition']
      let filename = `japaika-orders-${new Date().toISOString().split('T')[0]}.csv`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/)
        if (match && match[1]) filename = match[1]
      }

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return { success: true, filename }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to export orders CSV.'
      )
    }
  }
)
