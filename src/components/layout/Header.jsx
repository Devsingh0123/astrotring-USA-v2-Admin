import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Menu, Moon, Sun, ShieldCheck } from 'lucide-react'
import { toggleTheme } from '@/features/theme/themeSlice'
import { NAV_ITEMS } from '@/lib/constants'
import { Button } from '@/components/ui/button'

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

  const displayName = admin?.name || admin?.email || 'Administrator'
  const initialLetter = (displayName[0] || 'A').toUpperCase()
  const roleLabel = admin?.role === 'super_admin' ? 'Super Admin' : 'Enterprise Admin'

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/85 px-6 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-3.5">
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
          <h1 className="text-base font-bold tracking-tight text-foreground">
            {currentNav.title}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            AstroTring Enterprise Administration
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground md:inline-flex">
          <ShieldCheck className="size-3.5 text-primary" />
          {roleLabel}
        </span>

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => dispatch(toggleTheme())}
          aria-label="Toggle color theme"
          className="rounded-xl border-border/60"
        >
          {theme === 'dark' ? (
            <Sun className="size-4 text-primary" />
          ) : (
            <Moon className="size-4 text-foreground" />
          )}
        </Button>

        <div className="hidden items-center gap-2.5 rounded-xl border border-border/80 bg-card/60 px-3 py-1.5 backdrop-blur-sm sm:flex">
          {admin?.avatar_url ? (
            <img
              src={admin.avatar_url}
              alt={displayName}
              className="size-6.5 rounded-lg object-cover ring-1 ring-border"
            />
          ) : (
            <div className="flex size-6.5 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-primary/80 text-xs font-bold text-primary-foreground shadow-xs">
              {initialLetter}
            </div>
          )}
          <div className="flex flex-col text-left">
            <span className="max-w-[180px] truncate text-xs font-medium text-foreground" title={displayName}>
              {displayName}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
