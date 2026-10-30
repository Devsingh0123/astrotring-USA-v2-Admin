const rawUserFrontendUrl = import.meta.env.VITE_USER_FRONTEND_URL || 'https://japaika.com'
const normalizedUserUrl = rawUserFrontendUrl.replace(/\/+$/, '')
const normalizedUserDomain = normalizedUserUrl.replace(/^https?:\/\//, '')

export const BRAND = {
  NAME: 'Japaika',
  CONSOLE_TITLE: 'Japaika Console',
  ENTERPRISE_SUBTITLE: 'Japaika Enterprise Administration',
  ADMIN_DOMAIN: 'admin.japaika.com',
  ADMIN_URL: 'https://admin.japaika.com',
  ADMIN_BACKEND_DOMAIN: 'adminbackend.japaika.com',
  ADMIN_BACKEND_URL: 'https://adminbackend.japaika.com',
  USER_DOMAIN: normalizedUserDomain,
  USER_URL: normalizedUserUrl,
  USER_BACKEND_DOMAIN: 'backend.japaika.com',
  USER_BACKEND_URL: 'https://backend.japaika.com',
  ADMIN_EMAIL_PLACEHOLDER: 'admin@japaika.com',
  STAFF_EMAIL_PLACEHOLDER: 'staff@japaika.com',
  BACKEND_SERVICE_FALLBACK: 'japaika-admin-backend',
}

export const API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? `${BRAND.ADMIN_BACKEND_URL}/api/v1/admin`
    : 'http://localhost:5001/api/v1/admin')

export const CLOUDINARY_FOLDERS = {
  BLOGS: 'japaika/blogs',
  ADMINS: 'japaika/admins',
}

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'japaika_admin_access_token',
  REFRESH_TOKEN: 'japaika_admin_refresh_token',
  ADMIN_USER: 'japaika_admin_user',
  THEME: 'japaika_admin_theme',
}

// One-time cleanup of pre-rebrand localStorage keys so stale tokens do not linger
const LEGACY_STORAGE_KEYS = [
  'astrotring_admin_access_token',
  'astrotring_admin_refresh_token',
  'astrotring_admin_user',
  'astrotring_admin_theme',
]

export function purgeLegacyStorageKeys() {
  if (typeof window === 'undefined') return
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(key)
    }
  } catch {
    // Ignore storage access errors in restricted browsing contexts
  }
}

export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    badge: null,
  },
  {
    title: 'Users',
    path: '/users',
    icon: 'Users',
    badge: null,
  },
  {
    title: 'Orders',
    path: '/orders',
    icon: 'Receipt',
    badge: null,
  },
  {
    title: 'Coupons',
    path: '/coupons',
    icon: 'Tag',
    badge: null,
  },
  {
    title: 'Question Packs',
    path: '/question-packs',
    icon: 'Package',
    badge: null,
  },
  {
    title: 'Report Packs',
    path: '/report-packs',
    icon: 'FileText',
    badge: null,
  },
  {
    title: 'Blogs',
    path: '/blogs',
    icon: 'BookOpen',
    badge: null,
  },
  {
    title: 'AI Chats',
    path: '/chats',
    icon: 'MessageSquare',
    badge: null,
  },
  {
    title: 'Staff Admins',
    path: '/admins',
    icon: 'ShieldCheck',
    badge: null,
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: 'Settings',
    badge: null,
  },
]
