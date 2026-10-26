import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar,
  TrendingUp,
} from 'lucide-react'

function formatCompactINR(val) {
  if (val === undefined || val === null || isNaN(Number(val))) return '₹0'
  const num = Number(val)
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`
  return `₹${num}`
}

function formatFullINR(val) {
  if (val === undefined || val === null || isNaN(Number(val))) return '₹0.00'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(val))
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  return (
    <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-2xl backdrop-blur-md text-popover-foreground min-w-[170px] space-y-2">
      <div className="flex items-center justify-between border-b border-border/50 pb-1.5 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Calendar className="size-3.5 text-primary" />
          {data.label}
        </span>
        <span className="text-[10px] font-mono">{data.date}</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Revenue:</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {formatFullINR(data.revenue)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Paid Orders:</span>
          <span className="font-mono font-semibold text-foreground">
            {data.ordersCount} orders
          </span>
        </div>
      </div>
    </div>
  )
}

export function RevenueAreaChart({ chartData = [], loading = false }) {
  if (loading && (!chartData || chartData.length === 0)) {
    return (
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="pt-2">
          <Skeleton className="h-[320px] w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  // Calculate 7-day stats
  const total7DayRevenue = chartData.reduce((acc, d) => acc + (Number(d.revenue) || 0), 0)
  const total7DayOrders = chartData.reduce((acc, d) => acc + (Number(d.ordersCount) || 0), 0)
  const avgDailyRevenue = chartData.length > 0 ? total7DayRevenue / chartData.length : 0

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="size-5 text-emerald-500" />
            Revenue Velocity (Last 7 Days)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Continuous daily revenue rolling window across all completed purchases
          </CardDescription>
        </div>

        {/* Telemetry Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">
              7D Volume:
            </span>
            <span className="font-mono font-bold">
              {formatFullINR(total7DayRevenue)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/50 border border-border/60 text-xs font-medium text-muted-foreground">
            <span className="text-[11px] uppercase font-semibold">
              Orders:
            </span>
            <span className="font-mono font-bold text-foreground">
              {total7DayOrders}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/50 border border-border/60 text-xs font-medium text-muted-foreground">
            <span className="text-[11px] uppercase font-semibold">
              Daily Avg:
            </span>
            <span className="font-mono font-bold text-foreground">
              {formatFullINR(avgDailyRevenue)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="stroke-border/40"
              />

              <XAxis
                dataKey="label"
                stroke="currentColor"
                className="text-muted-foreground text-xs"
                tickLine={false}
                axisLine={false}
                dy={8}
              />

              <YAxis
                stroke="currentColor"
                className="text-muted-foreground text-xs"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCompactINR}
                dx={-4}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                activeDot={{
                  r: 6,
                  fill: '#10b981',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
