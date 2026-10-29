import { MessageSquare, Sparkles, Cpu, ThumbsUp, Compass, BookOpen } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function ChatStatsCards({ stats, loading }) {
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-20 rounded-md" />
            <Skeleton className="h-3.5 w-32 rounded-md" />
          </div>
        ))}
      </div>
    )
  }

  const totalThreads = stats?.threads?.total ?? 0
  const jyotishCount = stats?.threads?.jyotish ?? 0
  const shastraCount = stats?.threads?.shastra ?? 0

  const totalMessages = stats?.messages?.total ?? 0
  const totalTokens = stats?.messages?.total_tokens_used ?? 0

  const satisfactionRate = stats?.feedback?.satisfaction_rate ?? 0
  const positiveFeedback = stats?.feedback?.positive ?? 0
  const negativeFeedback = stats?.feedback?.negative ?? 0

  const formatTokens = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
    return String(val)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Conversations */}
      <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5 transition-all hover:border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          <span>Active Threads</span>
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <MessageSquare className="size-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
          {totalThreads.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{jyotishCount}</span> Jyotish •{' '}
          <span className="font-semibold text-foreground">{shastraCount}</span> Shastra
        </p>
      </div>

      {/* 2. Total Messages Exchanged */}
      <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5 transition-all hover:border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          <span>Messages Logged</span>
          <div className="size-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Sparkles className="size-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
          {totalMessages.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          Turn-by-turn user & AI queries
        </p>
      </div>

      {/* 3. AI Tokens Consumed */}
      <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5 transition-all hover:border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          <span>AI Tokens Used</span>
          <div className="size-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Cpu className="size-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
          {formatTokens(totalTokens)}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          {totalTokens.toLocaleString()} total prompt+completion
        </p>
      </div>

      {/* 4. User Satisfaction Rate */}
      <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5 transition-all hover:border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          <span>User Satisfaction</span>
          <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ThumbsUp className="size-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
          {satisfactionRate}%
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{positiveFeedback}</span> helpful •{' '}
          <span className="font-semibold text-rose-500">{negativeFeedback}</span> negative
        </p>
      </div>
    </div>
  )
}
