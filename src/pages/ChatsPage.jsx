import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchChatsThunk,
  fetchChatStatsThunk,
  fetchChatThreadDetailsThunk,
} from '@/features/chats/chatsApi'
import { clearSelectedThread } from '@/features/chats/chatsSlice'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatStatsCards } from '@/components/chats/ChatStatsCards'
import { ChatThreadDetailsModal } from '@/components/chats/ChatThreadDetailsModal'
import {
  MessageSquare,
  Search,
  RefreshCw,
  Sparkles,
  BookOpen,
  Calendar,
  User,
  Cpu,
  Coins,
  ThumbsUp,
  ThumbsDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'

const ENGINE_FILTERS = [
  { label: 'All Engines', value: 'all' },
  { label: 'Jyotish (Astrology)', value: 'jyotish' },
  { label: 'Shastra (Wisdom)', value: 'shastra' },
]

export function ChatsPage() {
  const dispatch = useDispatch()
  const {
    threads,
    pagination,
    stats,
    selectedThread,
    loadingThreads,
    loadingStats,
    loadingThreadDetails,
  } = useSelector((state) => state.chats)

  // Filters & Search State
  const [search, setSearch] = useState('')
  const [engineFilter, setEngineFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Fetch Stats
  const loadStats = useCallback(() => {
    dispatch(fetchChatStatsThunk())
  }, [dispatch])

  // Fetch Threads List
  const loadThreads = useCallback(() => {
    const params = {
      page,
      limit: 20,
    }
    if (engineFilter !== 'all') {
      params.engine = engineFilter
    }
    if (search.trim()) {
      params.search = search.trim()
    }
    if (fromDate) {
      params.from = fromDate
    }
    if (toDate) {
      params.to = toDate
    }

    dispatch(fetchChatsThunk(params))
  }, [dispatch, page, engineFilter, search, fromDate, toDate])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadThreads()
  }, [loadThreads])

  const handleOpenThread = (threadId) => {
    dispatch(fetchChatThreadDetailsThunk(threadId))
    setIsDetailsOpen(true)
  }

  const handleCloseModal = () => {
    setIsDetailsOpen(false)
    dispatch(clearSelectedThread())
  }

  const formatThreadDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
              AI Chat Monitoring
            </h1>
            <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary bg-primary/10">
              Live Logs
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time conversation logs, prompt auditing, and telemetry for Jyotish & Shastra AI chats.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadStats()
            loadThreads()
          }}
          disabled={loadingThreads || loadingStats}
          className="rounded-xl gap-2 border-border/80 hover:bg-muted/40 self-start sm:self-auto"
        >
          <RefreshCw className={`size-3.5 ${loadingThreads || loadingStats ? 'animate-spin text-primary' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <ChatStatsCards stats={stats} loading={loadingStats} />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by topic title or user email..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-background border border-border/70 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Engine Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {ENGINE_FILTERS.map((ef) => (
              <button
                key={ef.value}
                onClick={() => {
                  setEngineFilter(ef.value)
                  setPage(1)
                }}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors whitespace-nowrap ${
                  engineFilter === ef.value
                    ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {ef.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/40 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="size-3.5" />
            Date Range:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value)
                setPage(1)
              }}
              className="px-2.5 py-1 rounded-lg border border-border/70 bg-background text-foreground text-xs"
            />
            <span>to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value)
                setPage(1)
              }}
              className="px-2.5 py-1 rounded-lg border border-border/70 bg-background text-foreground text-xs"
            />
            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={() => {
                  setFromDate('')
                  setToDate('')
                  setPage(1)
                }}
                className="text-[11px] text-primary hover:underline ml-1"
              >
                Reset Dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Threads Table */}
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/60">
              <TableHead className="w-[280px]">User & Identity</TableHead>
              <TableHead>Topic Title</TableHead>
              <TableHead className="w-[120px]">Engine</TableHead>
              <TableHead className="w-[110px] text-center">Turns</TableHead>
              <TableHead className="w-[120px] text-right">Tokens / Credits</TableHead>
              <TableHead className="w-[110px] text-center">Feedback</TableHead>
              <TableHead className="w-[140px]">Last Updated</TableHead>
              <TableHead className="w-[100px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingThreads ? (
              [...Array(6)].map((_, i) => (
                <TableRow key={i} className="border-border/40">
                  <TableCell><Skeleton className="h-4 w-40 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-56 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 mx-auto rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 mx-auto rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 rounded-md" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : threads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <MessageSquare className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-semibold text-foreground">No chat threads found</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      {search || engineFilter !== 'all' || fromDate || toDate
                        ? 'Try clearing search terms or date boundaries.'
                        : 'No customer conversations have been logged yet.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              threads.map((t) => {
                const isJyotish = t.engine === 'jyotish'
                const userInitial = (t.user?.email?.[0] || 'U').toUpperCase()

                return (
                  <TableRow
                    key={t.id}
                    onClick={() => handleOpenThread(t.id)}
                    className="cursor-pointer hover:bg-muted/30 transition-colors border-border/40"
                  >
                    {/* User */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {userInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate max-w-[190px]" title={t.user?.email}>
                            {t.user?.email || 'Dayamns user'}
                          </p>
                          <span className="text-[10px] text-muted-foreground capitalize">
                            Tier: {t.user?.tier || 'Free'}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Topic Title */}
                    <TableCell>
                      <p className="text-xs font-semibold text-foreground line-clamp-1 max-w-[280px]" title={t.title}>
                        {t.title || 'General astrological query'}
                      </p>
                      <span className="font-mono text-[10px] text-muted-foreground truncate block">
                        ID: {t.id?.slice(0, 13)}...
                      </span>
                    </TableCell>

                    {/* Engine Badge */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize font-mono text-[10px] ${
                          isJyotish
                            ? 'border-primary/40 text-primary bg-primary/10'
                            : 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10'
                        }`}
                      >
                        {isJyotish ? <Sparkles className="size-2.5 mr-1" /> : <BookOpen className="size-2.5 mr-1" />}
                        {t.engine || 'jyotish'}
                      </Badge>
                    </TableCell>

                    {/* Message Count */}
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-muted/60 font-mono text-xs font-semibold text-foreground">
                        {t.message_count ?? (t.user_message_count + t.assistant_message_count) ?? 0}
                      </span>
                    </TableCell>

                    {/* Tokens & Credits */}
                    <TableCell className="text-right font-mono text-xs">
                      <div className="font-semibold text-foreground">
                        {t.total_tokens_used ? `${t.total_tokens_used.toLocaleString()} tok` : '—'}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                        <Coins className="size-2.5 text-amber-500" />
                        <span>{t.total_credits_debited ?? 0} credits</span>
                      </div>
                    </TableCell>

                    {/* User Rating / Feedback */}
                    <TableCell className="text-center text-xs">
                      {t.feedback ? (
                        <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <ThumbsUp className="size-3" />
                            {t.feedback.positive ?? 0}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-rose-500 flex items-center gap-0.5">
                            <ThumbsDown className="size-3" />
                            {t.feedback.negative ?? 0}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>

                    {/* Last Updated */}
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {formatThreadDate(t.updated_at || t.created_at)}
                    </TableCell>

                    {/* Action Button */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenThread(t.id)}
                        className="rounded-lg h-8 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Eye className="size-3.5" />
                        <span>Inspect</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        {pagination?.totalPages > 1 && (
          <div className="p-4 border-t border-border/40 flex items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>
              Showing Page <strong className="text-foreground">{pagination.page}</strong> of{' '}
              <strong className="text-foreground">{pagination.totalPages}</strong> ({pagination.total} total threads)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="rounded-xl h-8 gap-1"
              >
                <ChevronLeft className="size-3.5" />
                <span>Prev</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-xl h-8 gap-1"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Details & Transcript Inspection Modal */}
      <ChatThreadDetailsModal
        open={isDetailsOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal()
        }}
        thread={selectedThread}
        loading={loadingThreadDetails}
      />
    </div>
  )
}
