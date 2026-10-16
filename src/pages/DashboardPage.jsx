import { Link } from 'react-router-dom'
import {
  Users,
  Sparkles,
  CreditCard,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const KPI_CARDS = [
  {
    label: 'Total Registered Users',
    value: '2,840',
    delta: '+14.2% this week',
    icon: Users,
    href: '/users',
  },
  {
    label: 'Gross Revenue (USD Eq.)',
    value: '$18,490',
    delta: 'Across USD, INR, GBP, EUR',
    icon: CreditCard,
    href: '/orders',
  },
  {
    label: 'Vaani AI Consultations',
    value: '14,920',
    delta: '99.4% stream completion',
    icon: Sparkles,
    href: '/ai-logs',
  },
  {
    label: 'Artha Sutram Reports',
    value: '312',
    delta: '4 currently generating',
    icon: FileText,
    href: '/reports',
  },
]

const RECENT_ORDERS = [
  {
    id: 'ord_918204',
    user: 'alex.mercer@example.com',
    product: 'Artha Sutram — 23-Section Blueprint',
    amount: '$29.99',
    currency: 'USD',
    status: 'paid',
    time: '6 mins ago',
  },
  {
    id: 'ord_918203',
    user: 'priya.sharma@example.in',
    product: 'Diamond Pack (20 Questions)',
    amount: '₹1,499',
    currency: 'INR',
    status: 'paid',
    time: '19 mins ago',
  },
  {
    id: 'ord_918202',
    user: 'oliver.grant@example.co.uk',
    product: 'Gold Pack (12 Questions)',
    amount: '£11.99',
    currency: 'GBP',
    status: 'paid',
    time: '42 mins ago',
  },
  {
    id: 'ord_918201',
    user: 'elena.rossi@example.eu',
    product: 'Career & Professional Destiny',
    amount: '€13.99',
    currency: 'EUR',
    status: 'pending',
    time: '1 hr ago',
  },
]

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            AstroTring Operations Overview
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Monitor Vedic chart bindings, Vaani AI consultations, multi-currency orders, and Artha Sutram report pipelines.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/pricing">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Globe className="size-3.5" />
              Pricing Matrix
            </Button>
          </Link>
          <Link to="/users">
            <Button size="sm" className="gap-1.5">
              Manage Users & Credits
              <ArrowUpRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              to={card.href}
              className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {card.label}
                </span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{card.delta}</p>
            </Link>
          )
        })}
      </div>

      {/* Two Column Operational Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Multi-Currency Orders */}
        <div className="rounded-2xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Recent Multi-Currency Orders
              </h3>
              <p className="text-xs text-muted-foreground">
                Live Razorpay ledger across USD, INR, GBP, and EUR
              </p>
            </div>
            <Link to="/orders">
              <Button variant="ghost" size="xs" className="gap-1">
                View All
                <ArrowUpRight className="size-3" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {RECENT_ORDERS.map((order) => (
              <div
                key={order.id}
                className="flex flex-col justify-between gap-2 px-5 py-3.5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-foreground">
                      {order.id}
                    </span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {order.currency}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {order.user} — {order.product}
                  </p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-sm font-semibold text-foreground">
                    {order.amount}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      order.status === 'paid'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {order.status === 'paid' ? (
                      <CheckCircle2 className="size-3" />
                    ) : (
                      <Clock className="size-3" />
                    )}
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Health & Phase Roadmap */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Core Platform Engines
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Real-time status of AstroTring subsystems
          </p>

          <div className="mt-4 space-y-3">
            {[
              {
                name: 'OTP Auth & JWT Guard',
                detail: '/api/v1/auth',
                status: 'Operational',
              },
              {
                name: 'Swiss Ephemeris Vedic Engine',
                detail: '/api/v1/vedic',
                status: 'Operational',
              },
              {
                name: 'Vaani SSE Chat Stream',
                detail: '/api/v1/chat/vaani',
                status: 'Operational',
              },
              {
                name: 'Artha Sutram PDF Generator',
                detail: '23-Section Worker',
                status: 'Operational',
              },
            ].map((sys) => (
              <div
                key={sys.name}
                className="flex items-center justify-between rounded-xl border border-border bg-background p-3"
              >
                <div>
                  <p className="text-xs font-medium text-foreground">{sys.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {sys.detail}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {sys.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
