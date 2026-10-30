import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MessageSquare,
  Sparkles,
  BookOpen,
  User,
  Cpu,
  Coins,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Clock,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'

export function ChatThreadDetailsModal({ open, onOpenChange, thread, loading }) {
  const [copiedTranscript, setCopiedTranscript] = useState(false)
  const [expandedThinkingMap, setExpandedThinkingMap] = useState({})

  const toggleThinking = (msgId) => {
    setExpandedThinkingMap((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }))
  }

  const handleCopyTranscript = () => {
    if (!thread) return

    const lines = [
      `=== Japaika AI Conversation Log ===`,
      `Thread ID: ${thread.id}`,
      `Engine: ${thread.engine?.toUpperCase() || 'JYOTISH'}`,
      `Title: ${thread.title || 'Untitled Thread'}`,
      `User: ${thread.user?.email || 'Unknown User'}`,
      `Created: ${thread.created_at || 'Unknown'}`,
      `=========================================\n`,
    ]

    const messages = thread.messages || []
    messages.forEach((m, idx) => {
      const roleTitle = m.role === 'user' ? 'USER' : `AI (${thread.engine?.toUpperCase() || 'ASSISTANT'})`
      lines.push(`[${idx + 1}] ${roleTitle} (${m.created_at || ''})`)
      lines.push(`${m.content || ''}`)
      if (m.structured_data?.suggestedQuestions?.length) {
        lines.push(`Suggested Follow-ups: ${m.structured_data.suggestedQuestions.join(' | ')}`)
      }
      lines.push(`Tokens: ${m.tokens_used || 0} | Credits Debited: ${m.credits_debited || 0}`)
      lines.push('-----------------------------------------\n')
    })

    navigator.clipboard
      .writeText(lines.join('\n'))
      .then(() => {
        setCopiedTranscript(true)
        toast.success('Conversation transcript copied to clipboard')
        setTimeout(() => setCopiedTranscript(false), 2500)
      })
      .catch(() => toast.error('Failed to copy conversation transcript'))
  }

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const formatThreadDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const isJyotish = thread?.engine === 'jyotish'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-full max-h-[92vh] overflow-y-auto p-0 gap-0 border-border/60 shadow-2xl bg-card">
        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-muted/20">
          <DialogHeader className="gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`size-10 rounded-xl flex items-center justify-center font-bold border shadow-xs ${
                    isJyotish
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  }`}
                >
                  {isJyotish ? <Sparkles className="size-5" /> : <BookOpen className="size-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground line-clamp-1">
                      {thread?.title || 'AI Chat Thread Inspection'}
                    </DialogTitle>
                    <Badge
                      variant="outline"
                      className={`capitalize font-mono text-[10px] ${
                        isJyotish
                          ? 'border-primary/40 text-primary bg-primary/10'
                          : 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10'
                      }`}
                    >
                      {thread?.engine || 'jyotish'}
                    </Badge>
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    <Clock className="size-3" />
                    <span>Started: {formatThreadDate(thread?.created_at)}</span>
                  </DialogDescription>
                </div>
              </div>

              {thread && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTranscript}
                  className="rounded-xl gap-1.5 border-border/80 hover:bg-muted/40 text-xs shrink-0"
                >
                  {copiedTranscript ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  <span>{copiedTranscript ? 'Copied' : 'Copy Transcript'}</span>
                </Button>
              )}
            </div>

            {/* Linked User Meta Ribbon */}
            {thread?.user && (
              <div className="mt-3 p-3 rounded-xl bg-card border border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                    <User className="size-3.5" />
                  </div>
                  <span className="font-semibold text-foreground">{thread.user.email}</span>
                  <Badge variant="secondary" className="text-[10px] capitalize px-1.5 py-0">
                    {thread.user.tier || 'User'}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <Coins className="size-3 text-primary" />
                    <span>Balance:</span>
                    <strong className="text-foreground">{thread.user.credit_balance ?? 0}</strong> Q
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Shield className="size-3 text-sky-500" />
                    <span>Reports:</span>
                    <strong className="text-foreground">{thread.user.report_credits ?? 0}</strong>
                  </span>
                </div>
              </div>
            )}
          </DialogHeader>
        </div>

        {/* Message Stream */}
        <div className="p-6 space-y-6">
          {loading && !thread ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 p-4 rounded-2xl bg-muted/20 border border-border/40">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                  <Skeleton className="h-16 w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : !thread?.messages || thread.messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <MessageSquare className="size-8 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">No message turns recorded</p>
              <p className="text-xs">This conversation has not exchanged any dialogue yet.</p>
            </div>
          ) : (
            thread.messages.map((m, idx) => {
              const isUserMsg = m.role === 'user'
              const isThinkingOpen = Boolean(expandedThinkingMap[m.id || idx])

              return (
                <div
                  key={m.id || idx}
                  className={`flex flex-col gap-2 rounded-2xl p-4 transition-all ${
                    isUserMsg
                      ? 'bg-muted/30 border border-border/60 ml-4 sm:ml-12'
                      : 'bg-card border border-border/80 mr-4 sm:mr-12 shadow-xs'
                  }`}
                >
                  {/* Sender Banner */}
                  <div className="flex items-center justify-between text-xs pb-1.5 border-b border-border/40">
                    <div className="flex items-center gap-2 font-semibold">
                      {isUserMsg ? (
                        <>
                          <div className="size-5 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                            <User className="size-3" />
                          </div>
                          <span className="text-foreground">User Prompt</span>
                        </>
                      ) : (
                        <>
                          <div
                            className={`size-5 rounded-md flex items-center justify-center ${
                              isJyotish ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-500'
                            }`}
                          >
                            {isJyotish ? <Sparkles className="size-3" /> : <BookOpen className="size-3" />}
                          </div>
                          <span className={isJyotish ? 'text-primary' : 'text-emerald-500'}>
                            {isJyotish ? 'Jyotish Vedic Engine' : 'Shastra Wisdom Scholar'}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px]">
                      {m.tokens_used > 0 && (
                        <span className="flex items-center gap-1">
                          <Cpu className="size-3" />
                          <span>{m.tokens_used} tok</span>
                        </span>
                      )}
                      <span>{formatMessageTime(m.created_at)}</span>
                    </div>
                  </div>

                  {/* Thinking Steps / Astrological Calculations (Assistant only) */}
                  {!isUserMsg && m.structured_data && (m.structured_data.openingThought || m.structured_data.thinkingSteps?.length > 0) && (
                    <div className="my-1 rounded-xl bg-muted/40 border border-border/60 overflow-hidden text-xs">
                      <button
                        type="button"
                        onClick={() => toggleThinking(m.id || idx)}
                        className="w-full flex items-center justify-between p-2.5 hover:bg-muted/60 transition-colors text-left font-medium text-muted-foreground"
                      >
                        <div className="flex items-center gap-2">
                          <Cpu className="size-3.5 text-primary" />
                          <span>Vedic Reasoning & Chart Verification ({m.structured_data.thinkingSteps?.length || 1} steps)</span>
                        </div>
                        {isThinkingOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                      </button>

                      {isThinkingOpen && (
                        <div className="p-3 pt-0 border-t border-border/40 space-y-2 text-muted-foreground">
                          {m.structured_data.openingThought && (
                            <p className="italic text-[11px] text-foreground/90 bg-background/50 p-2 rounded-lg">
                              &ldquo;{m.structured_data.openingThought}&rdquo;
                            </p>
                          )}
                          {m.structured_data.thinkingSteps?.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2 text-[11px]">
                              <span className="size-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[9px] mt-0.5">
                                {sIdx + 1}
                              </span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Core Content Body */}
                  <div className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {m.structured_data?.paragraphs?.length
                      ? m.structured_data.paragraphs.join('\n\n')
                      : m.content}
                  </div>

                  {/* Suggested Follow-up Questions Chips */}
                  {!isUserMsg && m.structured_data?.suggestedQuestions?.length > 0 && (
                    <div className="pt-2 border-t border-border/40 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                        <HelpCircle className="size-3" />
                        Suggested Next Inquiries:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.structured_data.suggestedQuestions.map((q, qIdx) => (
                          <span
                            key={qIdx}
                            className="inline-block px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground border border-border/40 text-[11px]"
                          >
                            {q}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Turn Footer: Credits Debited & User Feedback */}
                  {!isUserMsg && (
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-mono">
                          <Coins className="size-3 text-amber-500" />
                          <span>Debited:</span>
                          <strong className="text-foreground">{m.credits_debited ?? 0}</strong>
                        </span>
                      </div>

                      {/* User Rating Feedback Pill */}
                      {m.feedback !== null && m.feedback !== undefined && (
                        <div className="flex items-center gap-1 font-medium">
                          {m.feedback === 'yes' || m.feedback === true ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px]">
                              <ThumbsUp className="size-3" />
                              Helpful
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 text-[10px]">
                              <ThumbsDown className="size-3" />
                              Unhelpful
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
