import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStatsThunk } from '@/features/dashboard/dashboardApi'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { RevenueAreaChart } from '@/components/dashboard/RevenueAreaChart'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Zap,
  Globe2,
} from 'lucide-react'

export function DashboardPage() {
  const dispatch = useDispatch()
  const { metrics, chartData, loading, error } = useSelector(
    (state) => state.dashboard
  )

  const loadStats = useCallback(() => {
    dispatch(fetchDashboardStatsThunk())
  }, [dispatch])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <LayoutDashboard className="size-7 text-primary" />
            Executive Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time telemetry, paid transaction velocity, and platform user growth.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            disabled={loading}
            className="gap-2 h-9.5 px-4 rounded-xl border-border/70 hover:bg-muted font-medium"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            className="border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 h-8 rounded-lg"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Top Metric Cards */}
      <MetricCards metrics={metrics} loading={loading} />

      {/* 7-Day Revenue Area Chart */}
      <RevenueAreaChart chartData={chartData} loading={loading} />

      {/* Platform Telemetry & System Health Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs flex items-center gap-3.5">
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">Razorpay India Gateway</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Live & Webhook Active
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs flex items-center gap-3.5">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Zap className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">Vedic Astrology Engine</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
              <span className="size-2 rounded-full bg-primary" />
              Swiss Ephemeris v2.0
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs flex items-center gap-3.5">
          <div className="size-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Globe2 className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">Multi-Currency Billing</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
              <span className="size-2 rounded-full bg-sky-500" />
              INR • USD
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
