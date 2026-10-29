import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchOrdersThunk,
  fetchOrderDetailsThunk,
  openOrderInvoicePrintThunk,
  exportOrdersCsvThunk,
} from '@/features/orders/ordersApi'
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
import { OrderDetailsModal } from '@/components/orders/OrderDetailsModal'
import { RefundOrderDialog } from '@/components/orders/RefundOrderDialog'
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Receipt,
  TrendingUp,
  Copy,
  Check,
  Filter,
  RotateCcw,
  Printer,
  Download,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
]

export function OrdersPage() {
  const dispatch = useDispatch()
  const { orders, pagination, loadingList, exportingCsv, printingInvoiceId } = useSelector(
    (state) => state.orders
  )

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [modalOpen, setModalOpen] = useState(false)
  const [copiedOrderId, setCopiedOrderId] = useState(null)
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [orderToRefund, setOrderToRefund] = useState(null)

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loadOrders = useCallback(() => {
    dispatch(
      fetchOrdersThunk({
        page,
        limit,
        status: statusFilter,
        search: debouncedSearch,
      })
    )
  }, [dispatch, page, limit, statusFilter, debouncedSearch])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleOpenDetails = (orderId) => {
    dispatch(fetchOrderDetailsThunk(orderId))
    setModalOpen(true)
  }

  const handlePrintInvoice = async (e, orderId) => {
    e.stopPropagation()
    try {
      await dispatch(openOrderInvoicePrintThunk(orderId)).unwrap()
    } catch (err) {
      toast.error(err || 'Failed to open printable invoice.')
    }
  }

  const handleExportCsv = async () => {
    try {
      const filters = {}
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter
      if (debouncedSearch && debouncedSearch.trim()) filters.search = debouncedSearch.trim()
      const res = await dispatch(exportOrdersCsvThunk(filters)).unwrap()
      toast.success(`Exported orders CSV: ${res.filename}`)
    } catch (err) {
      toast.error(err || 'Failed to export orders CSV.')
    }
  }

  const handleOpenRefund = (e, order) => {
    e.stopPropagation()
    setOrderToRefund(order)
    setRefundModalOpen(true)
  }

  const handleCopyId = (e, id) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopiedOrderId(id)
    toast.success('Order ID copied')
    setTimeout(() => setCopiedOrderId(null), 2000)
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium gap-1">
            <XCircle className="w-3 h-3" />
            Failed
          </Badge>
        )
      case 'refunded':
        return (
          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium gap-1">
            <AlertCircle className="w-3 h-3" />
            Refunded
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 font-medium gap-1">
            <XCircle className="w-3 h-3" />
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  // Calculate high-level summary metrics from currently loaded/paginated view
  const orderList = Array.isArray(orders) ? orders : []
  const totalLoaded = orderList.length
  const paidCount = orderList.filter((o) => o?.status === 'paid').length
  const pendingCount = orderList.filter((o) => o?.status === 'pending').length
  const totalVolume = orderList
    .filter((o) => o?.status === 'paid')
    .reduce((sum, o) => sum + (Number(o?.total_amount) || 0), 0)

  return (
    <div className="space-y-7">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Receipt className="size-7 text-primary" />
            Orders & Payments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor real-time transactions, Razorpay gateway receipts, and GST invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={exportingCsv || loadingList}
            className="gap-2 h-9.5 px-3.5 rounded-xl border-border/70 hover:bg-muted font-medium"
            title="Download Orders list with GST breakdown as CSV"
          >
            {exportingCsv ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <Download className="size-3.5 text-primary" />
            )}
            <span>{exportingCsv ? 'Exporting...' : 'Export CSV'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={loadingList}
            className="gap-2 h-9.5 px-3.5 rounded-xl border-border/70 hover:bg-muted font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${loadingList ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Total Orders</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Receipt className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
            {pagination?.total ?? totalLoaded}
          </p>
          <p className="text-xs text-muted-foreground">Recorded in database</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Paid Orders</span>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {paidCount}
          </p>
          <p className="text-xs text-muted-foreground">On current page</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Pending</span>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono">
            {pendingCount}
          </p>
          <p className="text-xs text-muted-foreground">Awaiting payment</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Page Revenue</span>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
            {formatCurrency(totalVolume)}
          </p>
          <p className="text-xs text-muted-foreground">Total paid volume</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search email, order ID, Razorpay ID..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-background/80 border border-border/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1.5 font-medium">
            <Filter className="size-3.5" />
            Status:
          </span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatusFilter(f.value)
                setPage(1)
              }}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/60 bg-muted/20">
              <TableHead className="w-[180px] font-semibold text-xs text-foreground uppercase tracking-wider">
                Order ID
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Customer Email
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Pack / Item
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Amount
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Date
              </TableHead>
              <TableHead className="text-right font-semibold text-xs text-foreground uppercase tracking-wider w-[160px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingList ? (
              // Loading Skeleton Rows
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-44" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-16 ml-auto rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : orderList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                    <Receipt className="w-8 h-8 opacity-40" />
                    <p className="text-sm font-medium">No orders found.</p>
                    <p className="text-xs">
                      Try adjusting your search criteria or status filter.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orderList.map((order) => {
                const orderId = order.id || ''
                const shortId =
                  orderId.length > 12
                    ? `${orderId.substring(0, 8)}...${orderId.substring(orderId.length - 4)}`
                    : orderId

                return (
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/30 transition-colors border-border/40 group cursor-pointer"
                    onClick={() => handleOpenDetails(order.id)}
                  >
                    {/* Order ID */}
                    <TableCell className="font-mono text-xs text-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <span>{shortId}</span>
                        <button
                          onClick={(e) => handleCopyId(e, order.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-primary transition-opacity text-muted-foreground rounded"
                          title="Copy Full ID"
                        >
                          {copiedOrderId === order.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Customer Email */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {order.user?.email || 'N/A'}
                        </span>
                        {order.razorpay_order_id && (
                          <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[200px]">
                            {order.razorpay_order_id}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Pack / Item Title */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground font-medium">
                          {order.item_title || order.product_code || '—'}
                        </span>
                        {order.credits_to_grant && (
                          <span className="text-xs text-primary font-medium">
                            +{order.credits_to_grant} Credits
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Total Amount */}
                    <TableCell className="font-mono font-semibold text-sm text-foreground">
                      {formatCurrency(order.total_amount, order.currency)}
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(order.status)}</TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(order.created_at)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status === 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handlePrintInvoice(e, order.id)}
                            disabled={printingInvoiceId === order.id}
                            className="gap-1 h-8 text-xs font-medium border-border/70 hover:border-primary/40 hover:text-primary"
                            title="Print / View GST Invoice"
                          >
                            {printingInvoiceId === order.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                            ) : (
                              <Printer className="w-3.5 h-3.5 text-primary" />
                            )}
                            <span>Invoice</span>
                          </Button>
                        )}
                        {order.status === 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleOpenRefund(e, order)}
                            className="gap-1 h-8 text-xs font-medium border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50"
                            title="Refund this order via Razorpay"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Refund
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetails(order.id)}
                          className="gap-1.5 h-8 text-xs font-medium border-border/60 hover:border-primary/40 hover:text-primary"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-t border-border/50 bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
              className="bg-card border border-border/70 rounded-lg px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-muted-foreground/80">
              Showing <strong className="text-foreground font-mono">{orders.length}</strong> of{' '}
              <strong className="text-foreground font-mono">{pagination?.total ?? orders.length}</strong> orders
            </span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span>
              Page <strong className="text-foreground font-mono">{pagination?.page ?? page}</strong> of{' '}
              <strong className="text-foreground font-mono">{pagination?.totalPages || 1}</strong>
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg border-border/70"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loadingList}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg border-border/70"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (pagination?.totalPages || 1) || loadingList}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details & GST Breakdown Modal */}
      <OrderDetailsModal open={modalOpen} onOpenChange={setModalOpen} />

      {/* Refund Confirmation Dialog */}
      <RefundOrderDialog
        open={refundModalOpen}
        onOpenChange={setRefundModalOpen}
        order={orderToRefund}
        onSuccess={loadOrders}
      />
    </div>
  )
}
export default OrdersPage
