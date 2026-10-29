import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { adjustUserCreditsThunk } from '@/features/users/usersApi'
import { Sparkles, FileText, Plus, Minus, Equal, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function AdjustCreditsModal({ open, onOpenChange, user }) {
  const dispatch = useDispatch()
  const { adjustingCredits } = useSelector((state) => state.users)

  const [creditType, setCreditType] = useState('questions') // 'questions' | 'reports'
  const [action, setAction] = useState('add') // 'add' | 'deduct' | 'set'
  const [amount, setAmount] = useState(1)
  const [reason, setReason] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setCreditType('questions')
      setAction('add')
      setAmount(1)
      setReason('')
    }
  }, [open, user])

  if (!user) return null

  const currentQuestions = user.credit_balance ?? 0
  const currentReports = user.report_credits ?? 0
  const currentVal = creditType === 'questions' ? currentQuestions : currentReports

  const parsedAmount = Math.max(0, parseInt(amount, 10) || 0)

  let calculatedNewVal = currentVal
  if (action === 'add') {
    calculatedNewVal = currentVal + parsedAmount
  } else if (action === 'deduct') {
    calculatedNewVal = Math.max(0, currentVal - parsedAmount)
  } else if (action === 'set') {
    calculatedNewVal = parsedAmount
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (parsedAmount < 0) {
      toast.error('Credit amount must be 0 or greater')
      return
    }

    try {
      const resultAction = await dispatch(
        adjustUserCreditsThunk({
          id: user.id,
          credit_type: creditType,
          action,
          amount: parsedAmount,
          reason: reason.trim() || undefined,
        })
      ).unwrap()

      toast.success(
        `Successfully updated ${
          creditType === 'questions' ? 'question' : 'report'
        } credits to ${calculatedNewVal}.`
      )
      onOpenChange(false)
    } catch (err) {
      toast.error(err || 'Failed to adjust user credits.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <span>Adjust User Credits</span>
              </DialogTitle>
              <Badge variant="outline" className="border-border text-xs font-mono">
                {user.email}
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Manually grant, deduct, or reset question or report credits with an audit trail note.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Balances Header */}
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
              <div className="flex flex-col">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" /> Jyotish Questions
                </span>
                <span className="mt-1 font-mono text-base font-bold text-foreground">
                  {currentQuestions}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5 text-primary" /> Astro Reports
                </span>
                <span className="mt-1 font-mono text-base font-bold text-foreground">
                  {currentReports}
                </span>
              </div>
            </div>

            {/* Credit Type Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Credit Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCreditType('questions')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                    creditType === 'questions'
                      ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                      : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <Sparkles className="size-3.5" />
                  <span>Question Credits</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreditType('reports')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                    creditType === 'reports'
                      ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                      : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <FileText className="size-3.5" />
                  <span>Report Credits</span>
                </button>
              </div>
            </div>

            {/* Action Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Action</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAction('add')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-medium transition-all ${
                    action === 'add'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold ring-1 ring-emerald-500/30'
                      : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <Plus className="size-3.5" />
                  <span>Add (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAction('deduct')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-medium transition-all ${
                    action === 'deduct'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-500 font-semibold ring-1 ring-rose-500/30'
                      : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <Minus className="size-3.5" />
                  <span>Deduct (-)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAction('set')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-medium transition-all ${
                    action === 'set'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-500 font-semibold ring-1 ring-blue-500/30'
                      : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <Equal className="size-3.5" />
                  <span>Set (=)</span>
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <Label htmlFor="credit-amount" className="text-xs font-semibold">
                Amount
              </Label>
              <Input
                id="credit-amount"
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={adjustingCredits}
                className="text-sm font-mono"
              />
            </div>

            {/* Reason Input */}
            <div className="space-y-1.5">
              <Label htmlFor="credit-reason" className="text-xs font-semibold">
                Reason / Internal Audit Note (Optional)
              </Label>
              <Input
                id="credit-reason"
                type="text"
                placeholder="e.g. Compensation for consultation disconnect, VIP promotional grant"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={adjustingCredits}
                className="text-xs"
              />
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-accent/30 p-3 text-xs">
              <span className="text-muted-foreground">Balance Preview:</span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-muted-foreground">{currentVal}</span>
                <span className="font-bold text-foreground">
                  {action === 'add' ? `+${parsedAmount}` : action === 'deduct' ? `-${parsedAmount}` : `→`}
                </span>
                <ArrowRight className="size-3 text-muted-foreground" />
                <span className="rounded-md bg-primary/20 px-2 py-0.5 text-sm font-bold text-primary">
                  {calculatedNewVal}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 pt-4 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={adjustingCredits}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={adjustingCredits} className="gap-2">
              {adjustingCredits ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Adjusting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Confirm Adjustment</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
