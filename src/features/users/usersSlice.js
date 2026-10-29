import { createSlice } from '@reduxjs/toolkit'
import {
  fetchUsersThunk,
  fetchUserDetailsThunk,
  updateUserStatusThunk,
  adjustUserCreditsThunk,
  exportUsersCsvThunk,
} from './usersApi'

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
    selectedUser: null,
    loadingList: false,
    loadingDetails: false,
    updatingStatusId: null,
    adjustingCredits: false,
    exportingCsv: false,
    error: null,
  },
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null
      state.loadingDetails = false
    },
    clearUsersError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsersThunk
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loadingList = true
        state.error = null
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.loadingList = false
        state.users = action.payload?.users || []
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination
        }
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loadingList = false
        state.error = action.payload
      })

      // fetchUserDetailsThunk
      .addCase(fetchUserDetailsThunk.pending, (state) => {
        state.loadingDetails = true
      })
      .addCase(fetchUserDetailsThunk.fulfilled, (state, action) => {
        state.loadingDetails = false
        state.selectedUser = action.payload
      })
      .addCase(fetchUserDetailsThunk.rejected, (state, action) => {
        state.loadingDetails = false
        state.error = action.payload
      })

      // updateUserStatusThunk
      .addCase(updateUserStatusThunk.pending, (state, action) => {
        state.updatingStatusId = action.meta.arg.id
      })
      .addCase(updateUserStatusThunk.fulfilled, (state, action) => {
        state.updatingStatusId = null
        const updated = action.payload
        if (updated?.id) {
          state.users = state.users.map((u) =>
            u.id === updated.id ? { ...u, is_blocked: updated.is_blocked } : u
          )
          if (state.selectedUser && state.selectedUser.id === updated.id) {
            state.selectedUser.is_blocked = updated.is_blocked
          }
        }
      })
      .addCase(updateUserStatusThunk.rejected, (state, action) => {
        state.updatingStatusId = null
        state.error = action.payload
      })

      // adjustUserCreditsThunk
      .addCase(adjustUserCreditsThunk.pending, (state) => {
        state.adjustingCredits = true
        state.error = null
      })
      .addCase(adjustUserCreditsThunk.fulfilled, (state, action) => {
        state.adjustingCredits = false
        const updated = action.payload
        if (updated?.id) {
          state.users = state.users.map((u) =>
            u.id === updated.id
              ? {
                  ...u,
                  credit_balance:
                    updated.credit_balance !== undefined ? updated.credit_balance : u.credit_balance,
                  report_credits:
                    updated.report_credits !== undefined ? updated.report_credits : u.report_credits,
                }
              : u
          )
          if (state.selectedUser && state.selectedUser.id === updated.id) {
            state.selectedUser = {
              ...state.selectedUser,
              credit_balance:
                updated.credit_balance !== undefined
                  ? updated.credit_balance
                  : state.selectedUser.credit_balance,
              report_credits:
                updated.report_credits !== undefined
                  ? updated.report_credits
                  : state.selectedUser.report_credits,
            }
          }
        }
      })
      .addCase(adjustUserCreditsThunk.rejected, (state, action) => {
        state.adjustingCredits = false
        state.error = action.payload
      })

      // exportUsersCsvThunk
      .addCase(exportUsersCsvThunk.pending, (state) => {
        state.exportingCsv = true
      })
      .addCase(exportUsersCsvThunk.fulfilled, (state) => {
        state.exportingCsv = false
      })
      .addCase(exportUsersCsvThunk.rejected, (state, action) => {
        state.exportingCsv = false
        state.error = action.payload
      })
  },
})

export const { clearSelectedUser, clearUsersError } = usersSlice.actions
export default usersSlice.reducer
