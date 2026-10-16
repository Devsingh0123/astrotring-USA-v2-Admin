import { useLocation } from 'react-router-dom'
import { Menu, Moon, Sun, LogOut, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { NAV_ITEMS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function Header({ onOpenMobileSidebar }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const currentNav =
    NAV_ITEMS.find((item) =>
      item.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.path)
    ) || NAV_ITEMS[0]

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out of Admin Command Center')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-xs lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          onClick={onOpenMobileSidebar}
          aria-label="Open menu"
        >
          <Menu className="size-4" />
        </Button>

        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {currentNav.title}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            AstroTring Platform Administration
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {user?.isDemo && (
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground md:inline-flex">
            <ShieldAlert className="size-3.5 text-primary" />
            Demo Preview Mode
          </span>
        )}

        <Button
          variant="outline"
          size="icon-sm"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>

        <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 sm:flex">
          <div className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {(user?.email || 'A')[0].toUpperCase()}
          </div>
          <div className="flex flex-col text-left">
            <span className="max-w-[160px] truncate text-xs font-medium text-foreground">
              {user?.email || 'admin@astrotring.com'}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5"
        >
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  )
}
