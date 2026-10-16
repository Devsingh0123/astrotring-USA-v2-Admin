import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '@/lib/api'
import { STORAGE_KEYS } from '@/lib/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    setUser(null)
  }, [])

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (!token) {
      setIsLoading(false)
      return
    }

    // Support local demo mode token without calling backend
    if (token === 'demo_admin_token') {
      setIsLoading(false)
      return
    }

    try {
      const { data } = await api.get('/auth/me')
      const profile = data?.data?.user || data?.user
      if (!profile || profile.role !== 'admin') {
        clearSession()
      } else {
        setUser(profile)
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile))
      }
    } catch {
      clearSession()
    } finally {
      setIsLoading(false)
    }
  }, [clearSession])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const sendOtp = async (email) => {
    const { data } = await api.post('/auth/send-otp', { email })
    return data
  }

  const verifyOtp = async (email, otp) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp })
    const payload = data?.data || data
    const verifiedUser = payload?.user

    if (!verifiedUser) {
      throw new Error('Invalid authentication response from server.')
    }

    if (verifiedUser.role !== 'admin') {
      // Immediately revoke token if non-admin tries to log into Admin Panel
      if (payload.refreshToken) {
        try {
          await api.post('/auth/logout', { refreshToken: payload.refreshToken })
        } catch {
          // ignore
        }
      }
      throw new Error('Access denied: Your account does not have Administrator privileges.')
    }

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, payload.accessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, payload.refreshToken)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(verifiedUser))
    setUser(verifiedUser)
    return verifiedUser
  }

  const loginAsDemoAdmin = () => {
    const demoUser = {
      id: 'adm_0001_astrotring',
      email: 'admin@astrotring.com',
      fullName: 'Chief Astrologer Admin',
      role: 'admin',
      isEmailVerified: true,
      isDemo: true,
    }
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'demo_admin_token')
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser))
    setUser(demoUser)
    return demoUser
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken })
      } catch {
        // Ignore network errors on logout
      }
    }
    clearSession()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user && user.role === 'admin'),
        isLoading,
        sendOtp,
        verifyOtp,
        loginAsDemoAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
