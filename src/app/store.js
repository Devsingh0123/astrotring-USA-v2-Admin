import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import themeReducer from '@/features/theme/themeSlice'
import usersReducer from '@/features/users/usersSlice'
import ordersReducer from '@/features/orders/ordersSlice'
import couponsReducer from '@/features/coupons/couponsSlice'
import packsReducer from '@/features/packs/packsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    users: usersReducer,
    orders: ordersReducer,
    coupons: couponsReducer,
    packs: packsReducer,
  },
})
