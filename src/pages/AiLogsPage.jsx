import { Sparkles, BookOpen } from 'lucide-react'

const LOG_ENTRIES = [
  {
    id: 'thr_8812a',
    engine: 'vaani',
    userEmail: 'alex.mercer@example.com',
    query: 'When will I experience a major career breakthrough during my Jupiter Antardasha?',
    tokensUsed: 1420,
    creditsDebited: 1,
    latency: '1.14s',
    time: '4 mins ago',
  },
  {
    id: 'thr_public_9',
    engine: 'astropedia',
    userEmail: 'anonymous_session',
    query: 'What is Gajakesari Yoga and how does it cancel Kemadruma Dosha?',
    tokensUsed: 860,
    creditsDebited: 0,
    latency: '0.82s',
    time: '11 mins ago',
  },
  {
    id: 'thr_8810c',
    engine: 'vaani',
    userEmail: 'priya.sharma@example.in',
    query: 'Is 2027 favorable for marriage based on my 7th house Venus placement?',
    tokensUsed: 1650,
    creditsDebited: 1,
    latency: '1.31s',
    time: '23 mins ago',
  },
]

export function AiLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          AI Consultation Logs (Vaani & Astropedia)
        </h2>
        <p className="text-sm text-muted-foreground">
          Inspect dual-engine consultation threads, token consumption, and credit debits.
        </p>
      </div>

      <div className="space-y-3">
        {LOG_ENTRIES.map((log) => (
          <div
            key={log.id}
            className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                  {log.engine === 'vaani' ? (
                    <Sparkles className="size-3" />
                  ) : (
                    <BookOpen className="size-3" />
                  )}
                  {log.engine}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {log.id}
                </span>
                <span className="text-xs text-foreground">{log.userEmail}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Tokens: {log.tokensUsed}</span>
                <span>Credits Debited: {log.creditsDebited}</span>
                <span>TTFT: {log.latency}</span>
                <span>{log.time}</span>
              </div>
            </div>

            <p className="mt-2.5 text-sm text-foreground">&ldquo;{log.query}&rdquo;</p>
          </div>
        ))}
      </div>
    </div>
  )
}
