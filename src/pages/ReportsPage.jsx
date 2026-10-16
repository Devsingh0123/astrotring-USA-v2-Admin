import { useState } from 'react'
import { RefreshCw, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const INITIAL_REPORTS = [
  {
    id: 'rep_9012',
    userEmail: 'alex.mercer@example.com',
    personName: 'Alex Mercer',
    slug: 'artha-sutram',
    title: 'Artha Sutram — Master Wealth Blueprint (23 Sections)',
    status: 'ready',
    createdAt: '12 mins ago',
  },
  {
    id: 'rep_9011',
    userEmail: 'priya.sharma@example.in',
    personName: 'Priya Sharma',
    slug: 'artha-sutram',
    title: 'Artha Sutram — Master Wealth Blueprint (23 Sections)',
    status: 'generating',
    createdAt: '3 mins ago',
  },
  {
    id: 'rep_9010',
    userEmail: 'marcus.vance@example.com',
    personName: 'Marcus Vance',
    slug: 'career-destiny',
    title: 'Career & Professional Destiny Report (12 Sections)',
    status: 'failed',
    createdAt: '28 mins ago',
  },
]

export function ReportsPage() {
  const [reports, setReports] = useState(INITIAL_REPORTS)

  const retryReport = (id) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'ready' } : r))
    )
    toast.success(`Report ${id} re-generated and marked Ready.`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Reports Delivery & Generation Pipeline
        </h2>
        <p className="text-sm text-muted-foreground">
          Monitor 23-section Artha Sutram blueprints and re-queue failed report builds.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Report ID</th>
                <th className="px-4 py-3 font-medium">User / Chart</th>
                <th className="px-4 py-3 font-medium">Blueprint Title</th>
                <th className="px-4 py-3 font-medium">Pipeline Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3.5 font-mono text-xs font-medium text-foreground">
                    {r.id}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-foreground">
                      {r.personName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.userEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs font-medium text-foreground">
                      {r.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Requested {r.createdAt}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-foreground">
                      {r.status === 'ready' && (
                        <CheckCircle2 className="size-3.5 text-primary" />
                      )}
                      {r.status === 'generating' && (
                        <Loader2 className="size-3.5 animate-spin text-primary" />
                      )}
                      {r.status === 'failed' && (
                        <AlertCircle className="size-3.5 text-destructive" />
                      )}
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {r.status === 'failed' && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => retryReport(r.id)}
                        className="gap-1"
                      >
                        <RefreshCw className="size-3" />
                        Retry Generation
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
