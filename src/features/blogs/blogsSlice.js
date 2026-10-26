import { createSlice } from '@reduxjs/toolkit'
import {
  fetchBlogsThunk,
  fetchBlogByIdThunk,
  createBlogThunk,
  updateBlogThunk,
  toggleBlogStatusThunk,
  deleteBlogThunk,
} from './blogsApi'

const initialState = {
  blogs: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  },
  currentBlog: null,
  loadingList: false,
  loadingBlog: false,
  isSubmitting: false,
  deletingId: null,
  togglingStatusId: null,
  error: null,
}

const blogsSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    clearCurrentBlog: (state) => {
      state.currentBlog = null
      state.error = null
    },
    clearBlogsError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBlogsThunk
      .addCase(fetchBlogsThunk.pending, (state) => {
        state.loadingList = true
        state.error = null
      })
      .addCase(fetchBlogsThunk.fulfilled, (state, action) => {
        state.loadingList = false
        state.blogs = action.payload?.blogs || []
        state.pagination = action.payload?.pagination || {
          total: (action.payload?.blogs || []).length,
          page: 1,
          limit: 20,
          totalPages: 1,
        }
      })
      .addCase(fetchBlogsThunk.rejected, (state, action) => {
        state.loadingList = false
        state.error = action.payload
      })

      // fetchBlogByIdThunk
      .addCase(fetchBlogByIdThunk.pending, (state) => {
        state.loadingBlog = true
        state.error = null
      })
      .addCase(fetchBlogByIdThunk.fulfilled, (state, action) => {
        state.loadingBlog = false
        state.currentBlog = action.payload
      })
      .addCase(fetchBlogByIdThunk.rejected, (state, action) => {
        state.loadingBlog = false
        state.error = action.payload
      })

      // createBlogThunk
      .addCase(createBlogThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createBlogThunk.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (action.payload) {
          state.blogs.unshift(action.payload)
          state.pagination.total += 1
        }
      })
      .addCase(createBlogThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })

      // updateBlogThunk
      .addCase(updateBlogThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updateBlogThunk.fulfilled, (state, action) => {
        state.isSubmitting = false
        const updated = action.payload
        if (updated) {
          state.currentBlog = updated
          const idx = state.blogs.findIndex((b) => b.id === updated.id)
          if (idx !== -1) {
            state.blogs[idx] = { ...state.blogs[idx], ...updated }
          }
        }
      })
      .addCase(updateBlogThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })

      // toggleBlogStatusThunk
      .addCase(toggleBlogStatusThunk.pending, (state, action) => {
        state.togglingStatusId = action.meta.arg.id
      })
      .addCase(toggleBlogStatusThunk.fulfilled, (state, action) => {
        state.togglingStatusId = null
        const { id, status, published_at } = action.payload
        const blog = state.blogs.find((b) => b.id === id)
        if (blog) {
          blog.status = status
          if (published_at) {
            blog.published_at = published_at
          }
        }
        if (state.currentBlog?.id === id) {
          state.currentBlog.status = status
          if (published_at) {
            state.currentBlog.published_at = published_at
          }
        }
      })
      .addCase(toggleBlogStatusThunk.rejected, (state, action) => {
        state.togglingStatusId = null
        state.error = action.payload
      })

      // deleteBlogThunk
      .addCase(deleteBlogThunk.pending, (state, action) => {
        state.deletingId = action.meta.arg
      })
      .addCase(deleteBlogThunk.fulfilled, (state, action) => {
        state.deletingId = null
        state.blogs = state.blogs.filter((b) => b.id !== action.payload.id)
        state.pagination.total = Math.max(0, state.pagination.total - 1)
        if (state.currentBlog?.id === action.payload.id) {
          state.currentBlog = null
        }
      })
      .addCase(deleteBlogThunk.rejected, (state, action) => {
        state.deletingId = null
        state.error = action.payload
      })
  },
})

export const { clearCurrentBlog, clearBlogsError } = blogsSlice.actions
export default blogsSlice.reducer
