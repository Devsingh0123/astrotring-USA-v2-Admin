import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Menu, Moon, Sun, LogOut, ShieldCheck } from 'lucide-react'
import { logoutAdminThunk } from '@/features/auth/authApi'
import { toggleTheme } from '@/features/theme/themeSlice'
import { NAV_ITEMS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function Header({ onOpenMobileSidebar }) {
  const dispatch = useDispatch()
  const { admin } = useSelector((state) => state.auth)
  const { theme } = useSelector((state) => state.theme)
  const location = useLocation()

  const currentNav =
    NAV_ITEMS.find((item) =>
      item.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.path)
    ) || NAV_ITEMS[0]

  const handleLogout = async () => {
    await dispatch(logoutAdminThunk())
    toast.success('Signed out of Admin Console')
  }

  const initialLetter = (admin?.email?.[0] || 'A').toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md lg:px-6">
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
            AstroTring Enterprise Administration
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground md:inline-flex">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          Enterprise Admin
        </span>

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => dispatch(toggleTheme())}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>

        <div className="hidden items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-1.5 sm:flex">
          <div className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initialLetter}
          </div>
          <div className="flex flex-col text-left">
            <span className="max-w-[180px] truncate text-xs font-medium text-foreground">
              {admin?.email || 'admin@astrotring.com'}
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
