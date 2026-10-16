import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UsersPage } from '@/pages/UsersPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { PricingPage } from '@/pages/PricingPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { AiLogsPage } from '@/pages/AiLogsPage'

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
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
              <Route path="pricing" element={<PricingPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="ai-logs" element={<AiLogsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  )
}
