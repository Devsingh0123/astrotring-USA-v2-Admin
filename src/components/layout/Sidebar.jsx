import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Receipt,
  Tag,
  Package,
  BookOpen,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { logoutAdminThunk } from '@/features/auth/authApi'
import { toast } from 'sonner'

const ICON_MAP = {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  FileText,
  Sparkles,
  Receipt,
  Tag,
  Package,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Settings,
}

export function Sidebar({ isCollapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const dispatch = useDispatch()
  const { admin } = useSelector((state) => state.auth)

  const handleLogout = async () => {
    await dispatch(logoutAdminThunk())
    toast.success('Signed out of Admin Console')
  }

  const adminEmail = admin?.email || 'admin@japaika.com'
  const adminName = admin?.name || adminEmail
  const initialLetter = (adminName[0] || 'J').toUpperCase()
  const roleLabel = admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 lg:static lg:h-full shrink-0',
          isCollapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-sidebar-border transition-all duration-200',
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          )}
        >
          {isCollapsed ? (
            /* When collapsed: hide logo, menu toggle button takes place of logo */
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleCollapse}
              className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all active:scale-95"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <Menu className="size-4.5" />
            </Button>
          ) : (
            /* When expanded: show logo & title on left, collapse button on right */
            <>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                    Japaika
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    Command Center
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onToggleCollapse}
                className="hidden lg:inline-flex text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-lg transition-colors"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="size-4" />
              </Button>
            </>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon] || LayoutDashboard
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                    isCollapsed && 'justify-center px-2'
                  )
                }
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className="size-4 shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 truncate">{item.title}</span>
                    {item.badge && (
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer Admin Profile & Integrated Sign Out */}
        <div className="border-t border-sidebar-border p-3">
          {!isCollapsed ? (
            <div className="group relative flex items-center justify-between rounded-xl border border-sidebar-border/80 bg-sidebar-accent/25 p-2 transition-all hover:border-sidebar-border hover:bg-sidebar-accent/50 shadow-2xs">
              {/* User Avatar + Metadata */}
              <NavLink
                to="/settings"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 min-w-0 pr-1 hover:opacity-85 transition-opacity"
                title="Account Settings & Diagnostics"
              >
                {admin?.avatar_url ? (
                  <div className="relative size-8 shrink-0">
                    <img
                      src={admin.avatar_url}
                      alt={adminName}
                      className="size-8 rounded-lg object-cover ring-1 ring-sidebar-border"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 flex size-2 items-center justify-center">
                      <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
                    </span>
                  </div>
                ) : (
                  <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-primary/80 font-bold text-xs text-primary-foreground shadow-xs ring-1 ring-primary/20">
                    {initialLetter}
                    <span className="absolute -bottom-0.5 -right-0.5 flex size-2 items-center justify-center">
                      <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
                    </span>
                  </div>
                )}

                <div className="flex min-w-0 flex-1 flex-col">
                  <span
                    className="truncate text-xs font-semibold text-sidebar-foreground tracking-tight"
                    title={adminName}
                  >
                    {adminName}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 capitalize">
                      <ShieldCheck className="size-3 shrink-0" />
                      {roleLabel}
                    </span>
                    <span>•</span>
                    <span className="truncate">{admin?.name ? adminEmail : 'Online'}</span>
                  </div>
                </div>
              </NavLink>

              {/* Integrated Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground/80 transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive/30"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          ) : (
            /* Collapsed Mode */
            <div className="flex flex-col items-center gap-2">
              {admin?.avatar_url ? (
                <div className="relative size-8" title={adminName}>
                  <img
                    src={admin.avatar_url}
                    alt={adminName}
                    className="size-8 rounded-lg object-cover ring-1 ring-sidebar-border"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 flex size-2 items-center justify-center">
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
                  </span>
                </div>
              ) : (
                <div
                  className="relative flex size-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-primary/80 font-bold text-xs text-primary-foreground shadow-xs ring-1 ring-primary/20"
                  title={adminName}
                >
                  {initialLetter}
                  <span className="absolute -bottom-0.5 -right-0.5 flex size-2 items-center justify-center">
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground/80 transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
