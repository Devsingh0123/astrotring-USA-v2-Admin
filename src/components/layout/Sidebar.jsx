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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants'
import { Button } from '@/components/ui/button'

const ICON_MAP = {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  FileText,
  Sparkles,
}

export function Sidebar({ isCollapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
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
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 lg:static',
          isCollapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="truncate text-sm font-semibold tracking-tight">
                  AstroTring
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  Command Center
                </span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onToggleCollapse}
            className="hidden lg:inline-flex"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
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
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-2xs'
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

        {/* Footer System Status */}
        <div className="border-t border-sidebar-border p-3">
          <div
            className={cn(
              'flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2 text-xs',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <ShieldCheck className="size-4 shrink-0 text-primary" />
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-medium text-foreground">Role: Admin</span>
                <span className="text-[11px] text-muted-foreground">
                  Vedic Engine v2.0
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
