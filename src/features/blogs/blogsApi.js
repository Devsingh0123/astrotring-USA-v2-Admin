import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

/**
 * Fetch paginated blogs with filtering and search
 */
export const fetchBlogsThunk = createAsyncThunk(
  'blogs/fetchBlogs',
  async (
    {
      page = 1,
      limit = 20,
      search = '',
      status = 'all',
      category = 'all',
      sort_by = 'created_at',
      order = 'DESC',
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = { page, limit, sort_by, order }
      if (search && search.trim()) {
        params.search = search.trim()
      }
      if (status && status !== 'all') {
        params.status = status
      }
      if (category && category !== 'all') {
        params.category = category
      }

      const { data } = await api.get('/blogs', { params })
      return data?.data || data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to retrieve blogs list.'
      )
    }
  }
)

/**
 * Fetch single blog by ID or slug
 */
export const fetchBlogByIdThunk = createAsyncThunk(
  'blogs/fetchBlogById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/blogs/${id}`)
      return data?.data?.blog || data?.data || data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to retrieve blog article details.'
      )
    }
  }
)

/**
 * Create a new blog post
 */
export const createBlogThunk = createAsyncThunk(
  'blogs/createBlog',
  async (blogData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/blogs', blogData)
      return data?.data?.blog || data?.data || data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to create blog post.'
      )
    }
  }
)

/**
 * Update existing blog post
 */
export const updateBlogThunk = createAsyncThunk(
  'blogs/updateBlog',
  async ({ id, blogData }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/blogs/${id}`, blogData)
      return data?.data?.blog || data?.data || data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update blog post.'
      )
    }
  }
)

/**
 * Quick toggle blog publishing status ('draft' | 'published' | 'archived')
 */
export const toggleBlogStatusThunk = createAsyncThunk(
  'blogs/toggleBlogStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/blogs/${id}/status`, { status })
      return data?.data || { id, status }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update blog status.'
      )
    }
  }
)

/**
 * Soft delete blog post
 */
export const deleteBlogThunk = createAsyncThunk(
  'blogs/deleteBlog',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/blogs/${id}`)
      return { id, message: data?.message || 'Blog deleted successfully' }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete blog post.'
      )
    }
  }
)
