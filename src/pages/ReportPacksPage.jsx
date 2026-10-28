import { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchReportPacksThunk,
  toggleReportPackStatusThunk,
} from '@/features/reportPacks/reportPacksApi'
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
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ReportPackModal } from '@/components/reportPacks/ReportPackModal'
import { DeleteReportPackDialog } from '@/components/reportPacks/DeleteReportPackDialog'
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Coins,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

const STATUS_FILTERS = [
  { label: 'All Packs', value: 'all' },
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]

function parsePrices(prices) {
  if (!prices) return {}
  if (typeof prices === 'object') return prices
  if (typeof prices === 'string') {
    try {
      return JSON.parse(prices)
    } catch {
      return {}
    }
  }
  return {}
}

function formatINR(val) {
  if (val === undefined || val === null || isNaN(Number(val))) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val))
}

function formatUSD(val) {
  if (val === undefined || val === null || isNaN(Number(val))) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(val))
}



function getTierBadge(tier) {
  switch (tier?.toLowerCase()) {
    case 'diamond':
      return (
        <Badge
          variant="outline"
          className="border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-500/10 font-medium"
        >
          Diamond
        </Badge>
      )
    case 'gold':
      return (
        <Badge
          variant="outline"
          className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-medium"
        >
          Gold
        </Badge>
      )
    case 'silver':
      return (
        <Badge
          variant="outline"
          className="border-slate-400/40 text-slate-700 dark:text-slate-300 bg-slate-500/10 font-medium"
        >
          Silver
        </Badge>
      )
    case 'custom':
    default:
      return (
        <Badge
          variant="outline"
          className="border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10 font-medium capitalize"
        >
          {tier || 'Custom'}
        </Badge>
      )
  }
}

export function ReportPacksPage() {
  const dispatch = useDispatch()
  const { packs, loadingList, togglingId } = useSelector((state) => state.reportPacks)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [selectedCurrencyView, setSelectedCurrencyView] = useState('INR')

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [packToEdit, setPackToEdit] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [packToDelete, setPackToDelete] = useState(null)
  const [copiedCode, setCopiedCode] = useState('')

  const loadData = useCallback(() => {
    dispatch(
      fetchReportPacksThunk({
        is_active: statusFilter === 'all' ? undefined : statusFilter === 'true',
        include_deleted: includeDeleted,
      })
    )
  }, [dispatch, statusFilter, includeDeleted])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter packs locally by search query
  const filteredPacks = useMemo(() => {
    if (!search.trim()) return packs
    const q = search.trim().toLowerCase()
    return packs.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(q)
      const matchCode = p.code?.toLowerCase().includes(q)
      const matchTitle = p.title?.toLowerCase().includes(q)
      const matchTier = p.tier?.toLowerCase().includes(q)
      return matchName || matchCode || matchTitle || matchTier
    })
  }, [packs, search])

  // KPI Calculations
  const stats = useMemo(() => {
    const totalPacks = packs.length
    const activePacks = packs.filter((p) => p.is_active).length
    const totalCredits = packs.filter((p) => p.is_active).reduce((sum, p) => sum + (Number(p.credits) || 0), 0)
    return { totalPacks, activePacks, totalCredits }
  }, [packs])

  // Toggle active status
  const handleToggleActive = async (pack) => {
    const nextStatus = !pack.is_active
    const result = await dispatch(
      toggleReportPackStatusThunk({ id: pack.id, is_active: nextStatus })
    )
    if (toggleReportPackStatusThunk.fulfilled.match(result)) {
      toast.success(
        `Report Pack "${pack.name}" is now ${nextStatus ? 'Active in store' : 'Hidden from store'}.`
      )
    } else {
      toast.error(result.payload || 'Failed to update pack status.')
    }
  }

  // Copy code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Copied "${code}" to clipboard.`)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const handleOpenCreate = () => {
    setPackToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (pack) => {
    setPackToEdit(pack)
    setIsModalOpen(true)
  }

  const handleOpenDelete = (pack) => {
    setPackToDelete(pack)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Report Packs
            </h1>
            <Badge
              variant="outline"
              className="border-primary/40 text-primary bg-primary/10 text-[11px] font-semibold"
            >
              Astrology Reports
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure report consultation packages, report credit quotas, and multi-currency pricing for Kundli, Dosha, and Varshphal reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loadingList}
            className="rounded-xl gap-1.5 text-xs"
          >
            <RefreshCw className={`size-3.5 ${loadingList ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="rounded-xl gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Plus className="size-3.5" />
            Create Report Pack
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Packs */}
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Report Packs</span>
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{stats.totalPacks}</span>
            <span className="text-[11px] text-muted-foreground font-mono">tiers configured</span>
          </div>
        </div>

        {/* Card 2: Active Packs */}
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active in Storefront</span>
            <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.activePacks}
            </span>
            <span className="text-[11px] text-muted-foreground">available to users</span>
          </div>
        </div>

        {/* Card 3: Report Credits Quota */}
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Report Credits In Tiers</span>
            <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {stats.totalCredits}
            </span>
            <span className="text-[11px] text-muted-foreground">credits total across active</span>
          </div>
        </div>

        {/* Card 4: Multi-Currency Rates */}
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Currencies Supported</span>
            <div className="size-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Coins className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 font-mono text-xs font-bold text-foreground">
            <span className="px-1.5 py-0.5 rounded bg-muted/60">INR ₹</span>
            <span className="px-1.5 py-0.5 rounded bg-muted/60">USD $</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters, Currency Switcher */}
      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by pack name, code, tier..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/70 bg-background/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
          />
        </div>

        {/* Right: Status Filter & Currency View Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border/60">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  statusFilter === f.value
                    ? 'bg-background text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Currency Display Switcher */}
          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground px-1.5 flex items-center gap-1">
              <Coins className="size-3 text-primary" /> View:
            </span>
            {['INR', 'USD'].map((curr) => (
              <button
                key={curr}
                onClick={() => setSelectedCurrencyView(curr)}
                className={`px-2 py-0.5 text-xs rounded-md font-mono font-medium transition-colors ${
                  selectedCurrencyView === curr
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Include Deleted Toggle */}
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none px-2">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary size-3.5"
            />
            <span>Include Archived</span>
          </label>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border/60 hover:bg-transparent">
                <TableHead className="w-[80px] text-xs font-semibold text-muted-foreground">Order</TableHead>
                <TableHead className="min-w-[220px] text-xs font-semibold text-muted-foreground">Pack Details</TableHead>
                <TableHead className="w-[120px] text-xs font-semibold text-muted-foreground">Tier</TableHead>
                <TableHead className="w-[140px] text-xs font-semibold text-muted-foreground">Report Credits</TableHead>
                <TableHead className="min-w-[240px] text-xs font-semibold text-muted-foreground">
                  Pricing Rates ({selectedCurrencyView})
                </TableHead>
                <TableHead className="w-[120px] text-xs font-semibold text-muted-foreground text-center">
                  Storefront
                </TableHead>
                <TableHead className="w-[110px] text-xs font-semibold text-muted-foreground text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loadingList ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/40">
                    <TableCell><Skeleton className="h-4 w-6 rounded" /></TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-3 w-48 rounded" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32 rounded" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-9 rounded-full mx-auto" /></TableCell>
                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-16 rounded-xl ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredPacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <FileText className="size-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">No report packs found</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {search
                          ? `No report packs matching "${search}". Try adjusting your search query.`
                          : 'No report consultation packs configured yet. Create one to display in the user store.'}
                      </p>
                      {!search && (
                        <Button
                          size="sm"
                          onClick={handleOpenCreate}
                          className="rounded-xl gap-1.5 text-xs font-semibold mt-2"
                        >
                          <Plus className="size-3.5" />
                          Create First Report Pack
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPacks.map((pack) => {
                  const pricesObj = parsePrices(pack.prices)
                  const currPrice = pricesObj[selectedCurrencyView] || {}
                  const origPrice = Number(currPrice.originalPrice)
                  const offerPrice = Number(currPrice.offerPrice)
                  const discount =
                    origPrice && offerPrice && origPrice > offerPrice
                      ? Math.round(((origPrice - offerPrice) / origPrice) * 100)
                      : 0

                  const isToggling = togglingId === pack.id
                  const isDeleted = Boolean(pack.deleted_at)

                  return (
                    <TableRow
                      key={pack.id}
                      className={`border-b border-border/40 hover:bg-muted/20 transition-colors ${
                        isDeleted ? 'opacity-50 bg-destructive/5' : ''
                      }`}
                    >
                      {/* Sort Order */}
                      <TableCell className="text-xs font-mono font-bold text-muted-foreground">
                        <span className="size-6 rounded-lg bg-muted/50 border border-border/60 flex items-center justify-center">
                          #{pack.sort_order ?? 0}
                        </span>
                      </TableCell>

                      {/* Pack Details */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-foreground">
                              {pack.name}
                            </span>
                            {isDeleted && (
                              <Badge variant="destructive" className="text-[10px] py-0 px-1 font-mono">
                                Archived
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <code className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40 flex items-center gap-1">
                              {pack.code}
                              <button
                                type="button"
                                onClick={() => handleCopyCode(pack.code)}
                                className="text-muted-foreground hover:text-primary transition-colors ml-0.5"
                                title="Copy code"
                              >
                                {copiedCode === pack.code ? (
                                  <Check className="size-3 text-emerald-500" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
                            </code>
                          </div>

                          {pack.title && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {pack.title}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Tier Badge */}
                      <TableCell>{getTierBadge(pack.tier)}</TableCell>

                      {/* Report Credits */}
                      <TableCell>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                          <FileText className="size-3.5" />
                          <span>+{pack.credits} Report{Number(pack.credits) > 1 ? 's' : ''}</span>
                        </div>
                      </TableCell>

                      {/* Pricing Rates */}
                      <TableCell>
                        <div className="space-y-1">
                          {offerPrice ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-extrabold text-foreground">
                                {selectedCurrencyView === 'INR' ? formatINR(offerPrice) : formatUSD(offerPrice)}
                              </span>
                              {origPrice > 0 && origPrice !== offerPrice && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {selectedCurrencyView === 'INR' ? formatINR(origPrice) : formatUSD(origPrice)}
                                </span>
                              )}
                              {discount > 0 && (
                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0 px-1 font-semibold">
                                  Save {discount}%
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">Not configured</span>
                          )}

                          {/* Quick currency badge indicators */}
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            {['INR', 'USD'].map((c) => (
                              <span
                                key={c}
                                className={`px-1 rounded ${
                                  pricesObj[c]?.offerPrice
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                                    : 'text-muted-foreground/50 bg-muted/40'
                                }`}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </TableCell>

                      {/* Active Status Switch */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={Boolean(pack.is_active)}
                            disabled={isToggling || isDeleted}
                            onCheckedChange={() => handleToggleActive(pack)}
                            title={pack.is_active ? 'Click to deactivate' : 'Click to activate'}
                          />
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleOpenEdit(pack)}
                            disabled={isDeleted}
                            className="text-muted-foreground hover:text-foreground"
                            title="Edit Pack"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleOpenDelete(pack)}
                            disabled={isDeleted}
                            className="text-muted-foreground hover:text-destructive"
                            title="Delete Pack"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create & Edit Modal */}
      <ReportPackModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        packToEdit={packToEdit}
      />

      {/* Soft Delete Dialog */}
      <DeleteReportPackDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        pack={packToDelete}
      />
    </div>
  )
}
