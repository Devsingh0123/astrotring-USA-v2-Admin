export const API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5001/api/v1/admin'

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'astrotring_admin_access_token',
  REFRESH_TOKEN: 'astrotring_admin_refresh_token',
  ADMIN_USER: 'astrotring_admin_user',
  THEME: 'astrotring_admin_theme',
}

export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    badge: 'Soon',
  },
  {
    title: 'Users',
    path: '/users',
    icon: 'Users',
    badge: null,
  },
]
