import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchOrdersThunk,
  fetchOrderDetailsThunk,
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
  const { orders, pagination, loadingList } = useSelector((state) => state.orders)

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [modalOpen, setModalOpen] = useState(false)
  const [copiedOrderId, setCopiedOrderId] = useState(null)

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
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" />
            Orders & Payments
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor real-time transactions, Razorpay gateway receipts, and GST invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={loadingList}
            className="gap-2 h-9 border-border/60 hover:bg-muted"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Total Orders</span>
            <Receipt className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {pagination?.total ?? totalLoaded}
          </p>
          <p className="text-xs text-muted-foreground">Recorded in database</p>
        </div>

        <div className="p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Paid Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {paidCount}
          </p>
          <p className="text-xs text-muted-foreground">On current page</p>
        </div>

        <div className="p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {pendingCount}
          </p>
          <p className="text-xs text-muted-foreground">Awaiting payment</p>
        </div>

        <div className="p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Page Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground font-mono">
            {formatCurrency(totalVolume)}
          </p>
          <p className="text-xs text-muted-foreground">Total paid volume</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search email, order ID, Razorpay ID..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-background border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Status:
          </span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatusFilter(f.value)
                setPage(1)
              }}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
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
              <TableHead className="text-right font-semibold text-xs text-foreground uppercase tracking-wider">
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetails(order.id)}
                        className="gap-1.5 h-8 text-xs font-medium border-border/60 hover:border-primary/40 hover:text-primary"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-t border-border/60 bg-muted/10 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
              className="bg-background border border-border/60 rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>
              Showing {orders.length} of {pagination?.total ?? orders.length} orders
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span>
              Page {pagination?.page ?? page} of {pagination?.totalPages || 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loadingList}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (pagination?.totalPages || 1) || loadingList}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details & GST Breakdown Modal */}
      <OrderDetailsModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
export default OrdersPage
