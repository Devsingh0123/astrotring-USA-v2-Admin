import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

/**
 * Fetch all report packs with optional active or deleted filter
 */
export const fetchReportPacksThunk = createAsyncThunk(
  'reportPacks/fetchReportPacks',
  async ({ is_active, include_deleted } = {}, { rejectWithValue }) => {
    try {
      const params = {}
      if (is_active !== undefined && is_active !== 'all' && is_active !== '') {
        params.is_active = is_active
      }
      if (include_deleted) {
        params.include_deleted = 'true'
      }

      const { data } = await api.get('/report-packs', { params })
      return data?.data?.packs || []
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to retrieve report consultation packs.'
      )
    }
  }
)

/**
 * Create a new report pack
 */
export const createReportPackThunk = createAsyncThunk(
  'reportPacks/createReportPack',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/report-packs', payload)
      return data?.data?.pack || data?.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to create report pack.'
      )
    }
  }
)

/**
 * Update an existing report pack
 */
export const updateReportPackThunk = createAsyncThunk(
  'reportPacks/updateReportPack',
  async ({ id, packData }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/report-packs/${id}`, packData)
      return data?.data?.pack || data?.data || { id, ...packData }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update report pack.'
      )
    }
  }
)

/**
 * Quick toggle status for a report pack
 */
export const toggleReportPackStatusThunk = createAsyncThunk(
  'reportPacks/toggleStatus',
  async ({ id, is_active }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/report-packs/${id}`, { is_active })
      return data?.data?.pack || data?.data || { id, is_active }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to toggle report pack status.'
      )
    }
  }
)

/**
 * Soft delete a report pack
 */
export const deleteReportPackThunk = createAsyncThunk(
  'reportPacks/deleteReportPack',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/report-packs/${id}`)
      return { id, message: data?.message }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete report pack.'
      )
    }
  }
)
