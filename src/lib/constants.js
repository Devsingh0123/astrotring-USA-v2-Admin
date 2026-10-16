export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'astrotring_admin_access_token',
  REFRESH_TOKEN: 'astrotring_admin_refresh_token',
  USER: 'astrotring_admin_user',
  THEME: 'astrotring_admin_theme',
}

export const NAV_ITEMS = [
  {
    title: 'Overview',
    path: '/',
    icon: 'LayoutDashboard',
    badge: null,
  },
  {
    title: 'Users & Credits',
    path: '/users',
    icon: 'Users',
    badge: null,
  },
  {
    title: 'Orders & Billing',
    path: '/orders',
    icon: 'CreditCard',
    badge: null,
  },
  {
    title: 'Pricing Matrix',
    path: '/pricing',
    icon: 'DollarSign',
    badge: 'Multi-Currency',
  },
  {
    title: 'Reports Pipeline',
    path: '/reports',
    icon: 'FileText',
    badge: null,
  },
  {
    title: 'AI Engine Logs',
    path: '/ai-logs',
    icon: 'Sparkles',
    badge: 'Vaani',
  },
]
