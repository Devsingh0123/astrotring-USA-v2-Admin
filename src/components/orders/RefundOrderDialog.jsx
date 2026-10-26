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
import { refundOrderThunk } from '@/features/orders/ordersApi'
import {
  RotateCcw,
  AlertTriangle,
  Loader2,
  Coins,
  ShieldAlert,
} from 'lucide-react'
import { toast } from 'sonner'

const REASON_PRESETS = [
  'Customer requested cancellation',
  'Duplicate payment / accidental charge',
  'Technical delivery issue',
  'Dissatisfied with reading',
]

export function RefundOrderDialog({ open, onOpenChange, order, onSuccess }) {
  const dispatch = useDispatch()
  const { refundingId } = useSelector((state) => state.orders)

  const isRefunding = refundingId === order?.id

  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (order) {
      setAmount(String(order.total_amount || ''))
      setReason('')
      setValidationError('')
    }
  }, [order, open])

  const handleClose = () => {
    if (isRefunding) return
    onOpenChange(false)
  }

  const handlePresetReason = (text) => {
    setReason(text)
  }

  const handleConfirmRefund = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (!order) return

    const parsedAmount = parseFloat(amount)
    const maxAmount = parseFloat(order.total_amount)

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Please enter a valid positive refund amount.')
      return
    }

    if (parsedAmount > maxAmount) {
      setValidationError(
        `Refund amount cannot exceed the order total (${maxAmount} ${order.currency || 'INR'}).`
      )
      return
    }

    const payload = {
      orderId: order.id,
      amount: parsedAmount,
      reason: reason.trim() || 'Refund initiated by administrator',
    }

    const result = await dispatch(refundOrderThunk(payload))

    if (refundOrderThunk.fulfilled.match(result)) {
      toast.success(
        result.payload?.message ||
          `Order ${order.id.slice(0, 8)}... successfully refunded via Razorpay.`
      )
      handleClose()
      if (onSuccess) {
        onSuccess(result.payload)
      }
    } else {
      toast.error(result.payload || 'Failed to process refund.')
    }
  }

  const currencySymbol = order?.currency === 'USD' ? '$' : '₹'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 gap-0 border-border/60 shadow-2xl bg-card overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-rose-500/[0.04]">
          <DialogHeader className="gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  Refund Order
                  <Badge variant="outline" className="border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-normal">
                    Razorpay Live
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Process an automated payment refund and reclaim granted credits.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleConfirmRefund} className="p-6 space-y-5">
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Order Details Context Card */}
          {order && (
            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono text-foreground font-medium truncate max-w-[200px]">
                  {order.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium text-foreground">
                  {order.user?.email || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Item / Pack:</span>
                <span className="font-medium text-foreground">
                  {order.item_title || order.product_code || '—'}
                </span>
              </div>
              {order.credits_to_grant > 0 && (
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    Credits to Reclaim:
                  </span>
                  <span>-{order.credits_to_grant} Credits</span>
                </div>
              )}
              {order.razorpay_payment_id && (
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-muted-foreground">Razorpay Payment ID:</span>
                  <span className="font-mono text-[11px] text-foreground font-medium">
                    {order.razorpay_payment_id}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Refund Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="refund-amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Refund Amount ({order?.currency || 'INR'}) *
              </Label>
              <button
                type="button"
                onClick={() => setAmount(String(order?.total_amount || ''))}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Reset to Full Amount
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono font-bold">
                {currencySymbol}
              </span>
              <Input
                id="refund-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={order?.total_amount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8 font-mono font-semibold"
                required
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Maximum refundable: {currencySymbol}{order?.total_amount || '0'} {order?.currency}
            </p>
          </div>

          {/* Refund Reason Selection & Input */}
          <div className="space-y-2">
            <Label htmlFor="refund-reason" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Refund Reason (Notes)
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {REASON_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handlePresetReason(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    reason === preset
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border/60 bg-background/50 hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <Input
              id="refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Initiated upon customer phone call request..."
              className="text-xs"
            />
          </div>

          {/* Warning Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold">Irreversible Action:</span>
              <p className="text-[11px] leading-relaxed text-amber-800/80 dark:text-amber-300/80">
                This will trigger an immediate payment refund to the customer via Razorpay and deduct granted credits from their profile.
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="pt-3 border-t border-border/40 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isRefunding}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isRefunding}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-2 font-medium"
            >
              {isRefunding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Refund...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Confirm & Process Refund
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
