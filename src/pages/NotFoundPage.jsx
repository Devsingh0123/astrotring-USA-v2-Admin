import { useNavigate, Link } from 'react-router-dom'
import {
  Compass,
  ArrowLeft,
  LayoutDashboard,
  Users,
  Receipt,
  BookOpen,
  Package,
  FileText,
  Search,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const RECOMMENDED_ROUTES = [
  {
    title: 'Command Dashboard',
    desc: 'Real-time revenue, orders & user KPIs',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    desc: 'Browse user directory & birth charts',
    path: '/users',
    icon: Users,
  },
  {
    title: 'Orders & Payments',
    desc: 'Inspect transactions, GST & refunds',
    path: '/orders',
    icon: Receipt,
  },
  {
    title: 'Blog Management',
    desc: 'Manage published articles & SEO drafts',
    path: '/blogs',
    icon: BookOpen,
  },
]

export function NotFoundPage({ standalone = false }) {
  const navigate = useNavigate()

  return (
    <div
      className={`flex flex-col items-center justify-center text-center transition-all ${
        standalone
          ? 'min-h-screen bg-background text-foreground px-6 py-12'
          : 'min-h-[70vh] py-8 sm:py-12'
      }`}
    >
      <div className="w-full max-w-2xl space-y-8">
        {/* Glow & 404 Art Header */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div className="relative flex flex-col items-center gap-3">
            <div className="size-20 sm:size-24 rounded-3xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-xl ring-1 ring-primary/30">
              <Compass className="size-10 sm:size-12 animate-[spin_20s_linear_infinite]" />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-primary uppercase">
              <Sparkles className="size-3.5" />
              <span>HTTP 404 • Lost in Coordinates</span>
              <Sparkles className="size-3.5" />
            </div>
          </div>
        </div>

        {/* Heading & Context Message */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground font-mono">
            404 — Route Not Found
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            The administrative console route you requested does not exist, has been migrated, or is temporarily unavailable.
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
          <Button
            size="lg"
            onClick={() => navigate('/')}
            className="rounded-xl gap-2 font-semibold shadow-md px-6"
          >
            <LayoutDashboard className="size-4" />
            Return to Dashboard
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(-1)}
            className="rounded-xl gap-2 border-border/80 hover:bg-muted/40 font-semibold px-6"
          >
            <ArrowLeft className="size-4" />
            Go Back
          </Button>
        </div>

        {/* Suggested Administrative Destinations */}
        <div className="pt-6 border-t border-border/60 text-left space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center sm:text-left">
            Quick Navigation Destinations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RECOMMENDED_ROUTES.map((route) => {
              const IconComp = route.icon
              return (
                <Link
                  key={route.path}
                  to={route.path}
                  className="group flex items-start gap-3.5 p-3.5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:bg-muted/30 transition-all shadow-2xs"
                >
                  <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <IconComp className="size-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {route.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {route.desc}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
