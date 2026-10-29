import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { clearSelectedOrder } from '@/features/orders/ordersSlice'
import { openOrderInvoicePrintThunk } from '@/features/orders/ordersApi'
import { RefundOrderDialog } from './RefundOrderDialog'
import {
  Copy,
  Check,
  Receipt,
  CreditCard,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  FileCheck,
  Layers,
  RotateCcw,
  Printer,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

export function OrderDetailsModal({ open, onOpenChange }) {
  const dispatch = useDispatch()
  const { selectedOrder, loadingDetails, printingInvoiceId } = useSelector((state) => state.orders)
  const [copiedKey, setCopiedKey] = useState(null)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)

  const handleClose = () => {
    onOpenChange(false)
    dispatch(clearSelectedOrder())
  }

  const handleCopy = (text, key) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Paid
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </Badge>
        )
      case 'refunded':
        return (
          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Refunded
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 font-medium gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="font-medium capitalize">
            {status || 'Unknown'}
          </Badge>
        )
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return dateStr
    }
  }

  const formatCurrency = (amount, currency = 'INR') => {
    if (amount === undefined || amount === null) return '—'
    const num = Number(amount)
    if (isNaN(num)) return amount
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 2,
    }).format(num)
  }

  const invoice = selectedOrder?.invoice

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/60 shadow-2xl bg-card">
        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-muted/20">
          <DialogHeader className="gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold border border-primary/20">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    Order Details
                    {selectedOrder && getStatusBadge(selectedOrder.status)}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Complete transaction logs and GST tax invoice breakdown
                  </DialogDescription>
                </div>
              </div>

              {selectedOrder && (
                <div className="flex items-center gap-1.5 bg-background border border-border/60 rounded-lg px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
                  <span className="font-mono text-foreground font-medium">
                    {selectedOrder.id}
                  </span>
                  <button
                    onClick={() => handleCopy(selectedOrder.id, 'order-id')}
                    className="p-1 hover:text-foreground transition-colors rounded hover:bg-muted"
                    title="Copy Order ID"
                  >
                    {copiedKey === 'order-id' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {loadingDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          ) : !selectedOrder ? (
            <div className="py-12 text-center text-muted-foreground">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No order details found.</p>
            </div>
          ) : (
            <>
              {/* Primary Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* User Info */}
                <div className="rounded-xl border border-border/50 bg-background/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <User className="w-3.5 h-3.5 text-primary" />
                    Customer Details
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {selectedOrder.user?.email || selectedOrder.user_id}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="text-xs uppercase font-mono">
                        Tier: {selectedOrder.user?.tier || 'Free'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Bal: <strong className="text-foreground">{selectedOrder.user?.credit_balance ?? 0}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pack / Item Info */}
                <div className="rounded-xl border border-border/50 bg-background/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    Item Purchased
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {selectedOrder.item_title || selectedOrder.product_code}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                      <span>Credits: <strong className="text-foreground">+{selectedOrder.credits_to_grant ?? 0}</strong></span>
                      <span className="text-muted-foreground">•</span>
                      <span className={selectedOrder.is_credited ? 'text-emerald-500 font-medium' : 'text-amber-500'}>
                        {selectedOrder.is_credited ? 'Credited' : 'Uncredited'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transaction & Date */}
                <div className="rounded-xl border border-border/50 bg-background/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Date & Method
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(selectedOrder.created_at)}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                      <span className="capitalize">Method: <strong className="text-foreground uppercase">{selectedOrder.payment_method || 'Razorpay'}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Gateways IDs */}
              <div className="rounded-xl border border-border/50 bg-muted/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-primary" />
                    Payment Gateway References
                  </span>
                  <span className="text-xs text-muted-foreground">Provider: Razorpay India</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border/50">
                    <span className="text-muted-foreground">Razorpay Order ID:</span>
                    <div className="flex items-center gap-1.5 font-mono text-foreground font-medium">
                      <span>{selectedOrder.razorpay_order_id || 'N/A'}</span>
                      {selectedOrder.razorpay_order_id && (
                        <button
                          onClick={() => handleCopy(selectedOrder.razorpay_order_id, 'rp-order')}
                          className="p-1 hover:text-foreground text-muted-foreground rounded hover:bg-muted"
                        >
                          {copiedKey === 'rp-order' ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border/50">
                    <span className="text-muted-foreground">Razorpay Payment ID:</span>
                    <div className="flex items-center gap-1.5 font-mono text-foreground font-medium">
                      <span>{selectedOrder.razorpay_payment_id || 'N/A'}</span>
                      {selectedOrder.razorpay_payment_id && (
                        <button
                          onClick={() => handleCopy(selectedOrder.razorpay_payment_id, 'rp-payment')}
                          className="p-1 hover:text-foreground text-muted-foreground rounded hover:bg-muted"
                        >
                          {copiedKey === 'rp-payment' ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* GST Tax Invoice Card */}
              <div className="rounded-xl border border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.03] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border/40 bg-primary/5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm text-foreground">
                      GST Tax Invoice Breakdown
                    </span>
                    {invoice?.invoice_number ? (
                      <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                        {invoice.invoice_number}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        System Calculated
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="bg-background/80 border border-border/60 rounded px-2 py-0.5 font-mono">
                        SAC: {invoice?.sac_code || '998431'}
                      </span>
                      {selectedOrder.billing_state && (
                        <span className="bg-background/80 border border-border/60 rounded px-2 py-0.5">
                          State: <strong className="text-foreground">{selectedOrder.billing_state}</strong>
                        </span>
                      )}
                    </div>

                    {selectedOrder.status === 'paid' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => dispatch(openOrderInvoicePrintThunk(selectedOrder.id))}
                        disabled={printingInvoiceId === selectedOrder.id}
                        className="gap-1 border-primary/40 text-primary hover:bg-primary/10 text-xs ml-1"
                        title="Print or Save GST Tax Invoice (HTML / PDF)"
                      >
                        {printingInvoiceId === selectedOrder.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        ) : (
                          <Printer className="w-3 h-3 text-primary" />
                        )}
                        <span>Print</span>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Financial Breakdown Table */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground py-1">
                      <span>Base Subtotal</span>
                      <span className="font-mono text-foreground">
                        {formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}
                      </span>
                    </div>

                    {Number(selectedOrder.discount_amount) > 0 && (
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 py-1">
                        <span className="flex items-center gap-1.5">
                          Discount Applied
                          {selectedOrder.coupon_code && (
                            <Badge variant="secondary" className="text-xs font-mono">
                              {selectedOrder.coupon_code}
                            </Badge>
                          )}
                        </span>
                        <span className="font-mono">
                          - {formatCurrency(selectedOrder.discount_amount, selectedOrder.currency)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-muted-foreground py-1">
                      <span>Taxable Value</span>
                      <span className="font-mono text-foreground">
                        {formatCurrency(selectedOrder.taxable_amount || selectedOrder.subtotal, selectedOrder.currency)}
                      </span>
                    </div>

                    <Separator className="my-1.5" />

                    {/* GST Component Lines */}
                    {Number(selectedOrder.cgst) > 0 && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground py-0.5">
                        <span>CGST (9%)</span>
                        <span className="font-mono text-foreground">
                          {formatCurrency(selectedOrder.cgst, selectedOrder.currency)}
                        </span>
                      </div>
                    )}

                    {Number(selectedOrder.sgst) > 0 && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground py-0.5">
                        <span>SGST (9%)</span>
                        <span className="font-mono text-foreground">
                          {formatCurrency(selectedOrder.sgst, selectedOrder.currency)}
                        </span>
                      </div>
                    )}

                    {Number(selectedOrder.igst) > 0 && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground py-0.5">
                        <span>IGST (18%)</span>
                        <span className="font-mono text-foreground">
                          {formatCurrency(selectedOrder.igst, selectedOrder.currency)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground py-0.5">
                      <span>Total GST Tax (18%)</span>
                      <span className="font-mono text-foreground font-medium">
                        {formatCurrency(selectedOrder.tax_amount, selectedOrder.currency)}
                      </span>
                    </div>

                    <Separator className="my-2" />

                    {/* Total Net Amount */}
                    <div className="flex items-center justify-between text-base font-bold py-1">
                      <span className="text-foreground">Grand Total Paid</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 text-lg">
                        {formatCurrency(selectedOrder.total_amount, selectedOrder.currency)}
                      </span>
                    </div>
                  </div>

                  {invoice?.issued_at && (
                    <div className="pt-2 border-t border-border/30 text-xs text-muted-foreground flex items-center justify-between">
                      <span>Issued At: {formatDate(invoice.issued_at)}</span>
                      <span>Customer: {invoice.customer_name || invoice.customer_email || '—'}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border/40 bg-muted/10 flex items-center justify-between gap-3">
          {selectedOrder && selectedOrder.status === 'paid' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefundDialogOpen(true)}
              className="text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500/50 gap-1.5 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Refund Order
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {selectedOrder?.status === 'paid' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(openOrderInvoicePrintThunk(selectedOrder.id))}
                disabled={printingInvoiceId === selectedOrder.id}
                className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10 font-medium"
              >
                {printingInvoiceId === selectedOrder.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Printer className="w-3.5 h-3.5" />
                )}
                <span>Print GST Invoice</span>
              </Button>
            )}

            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Refund Dialog */}
        <RefundOrderDialog
          open={refundDialogOpen}
          onOpenChange={setRefundDialogOpen}
          order={selectedOrder}
        />
      </DialogContent>
    </Dialog>
  )
}
