import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

export const fetchPacksThunk = createAsyncThunk(
  'packs/fetchPacks',
  async ({ is_active, include_deleted } = {}, { rejectWithValue }) => {
    try {
      const params = {}
      if (is_active !== undefined && is_active !== 'all' && is_active !== '') {
        params.is_active = is_active
      }
      if (include_deleted) {
        params.include_deleted = 'true'
      }
      const { data } = await api.get('/question-packs', { params })
      return data?.data?.packs || []
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to retrieve question packs.'
      )
    }
  }
)

export const createPackThunk = createAsyncThunk(
  'packs/createPack',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/question-packs', payload)
      return data?.data?.pack || data?.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to create question pack.'
      )
    }
  }
)

export const updatePackThunk = createAsyncThunk(
  'packs/updatePack',
  async ({ id, packData }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/question-packs/${id}`, packData)
      return data?.data?.pack || data?.data || { id, ...packData }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update question pack.'
      )
    }
  }
)

export const deletePackThunk = createAsyncThunk(
  'packs/deletePack',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/question-packs/${id}`)
      return { id, message: data?.message }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete question pack.'
      )
    }
  }
)
