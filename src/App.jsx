import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { fetchAdminMeThunk } from '@/features/auth/authApi'
import { purgeLegacyStorageKeys } from '@/lib/constants'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UsersPage } from '@/pages/UsersPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { CouponsPage } from '@/pages/CouponsPage'
import { QuestionPacksPage } from '@/pages/QuestionPacksPage'
import { ReportPacksPage } from '@/pages/ReportPacksPage'
import { BlogsPage } from '@/pages/BlogsPage'
import { BlogEditorPage } from '@/pages/BlogEditorPage'
import { ChatsPage } from '@/pages/ChatsPage'
import { AdminsPage } from '@/pages/AdminsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    purgeLegacyStorageKeys()
    dispatch(fetchAdminMeThunk())
  }, [dispatch])

  return (
    <>
      <ErrorBoundary standalone>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="coupons" element={<CouponsPage />} />
              <Route path="question-packs" element={<QuestionPacksPage />} />
              <Route path="report-packs" element={<ReportPacksPage />} />
              <Route path="blogs" element={<BlogsPage />} />
              <Route path="blogs/new" element={<BlogEditorPage />} />
              <Route path="blogs/edit/:id" element={<BlogEditorPage />} />
              <Route path="chats" element={<ChatsPage />} />
              <Route path="admins" element={<AdminsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              {/* Internal 404 rendered inside AdminLayout */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Standalone 404 for unauthenticated or external route errors */}
            <Route path="/404" element={<NotFoundPage standalone />} />
            <Route path="*" element={<NotFoundPage standalone />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}
