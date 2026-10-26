import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp,
  Receipt,
  Users,
  Coins,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'

function formatCurrency(amount, currency = 'INR') {
  if (amount === undefined || amount === null) return '—'
  const num = Number(amount)
  if (isNaN(num)) return amount
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 2,
  }).format(num)
}

function formatNumber(num) {
  if (num === undefined || num === null) return '0'
  return new Intl.NumberFormat('en-IN').format(Number(num))
}

export function MetricCards({ metrics, loading }) {
  if (loading && !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx} className="p-5 border-border/60 bg-card/60 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-36 mb-2" />
            <Skeleton className="h-3.5 w-44" />
          </Card>
        ))}
      </div>
    )
  }

  const revenueByCurrency = metrics?.revenueByCurrency || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Total Revenue Card */}
      <Card className="relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </span>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="size-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                {formatCurrency(metrics?.totalRevenue ?? 0, metrics?.currency)}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-muted-foreground">
              {revenueByCurrency.length > 0 ? (
                revenueByCurrency.map((item) => (
                  <span
                    key={item.currency}
                    className="inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px]"
                  >
                    {item.currency}: {formatCurrency(item.revenue, item.currency)}
                  </span>
                ))
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                  <ArrowUpRight className="size-3.5" />
                  Verified paid platform transactions
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Total Paid Orders Card */}
      <Card className="relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Paid Orders
            </span>
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
              <Receipt className="size-5" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
              {formatNumber(metrics?.totalPaidOrders ?? 0)}
            </h3>

            <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              <span>Fulfilled orders & credit grant completions</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Total Users Card */}
      <Card className="relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Users
            </span>
            <div className="size-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20 group-hover:scale-105 transition-transform">
              <Users className="size-5" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
              {formatNumber(metrics?.totalUsers ?? 0)}
            </h3>

            <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1.5">
              <Coins className="size-3.5 text-amber-500" />
              <span>Customer accounts registered on platform</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
