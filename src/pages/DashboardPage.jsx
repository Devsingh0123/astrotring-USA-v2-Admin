import { LayoutDashboard } from 'lucide-react'

export function DashboardPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <LayoutDashboard className="size-7" />
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
        Dashboard Overview
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Analytics, system telemetry, and platform KPI widgets will be integrated here in future phases.
      </p>
      <span className="mt-4 inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
        Coming Soon
      </span>
    </div>
  )
}
