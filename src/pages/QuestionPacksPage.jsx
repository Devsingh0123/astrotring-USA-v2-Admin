import { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPacksThunk,
  updatePackThunk,
} from '@/features/packs/packsApi'
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
import { PackModal } from '@/components/packs/PackModal'
import { DeletePackDialog } from '@/components/packs/DeletePackDialog'
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Coins,
  CheckCircle2,
  Sparkles,
  Filter,
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

export function QuestionPacksPage() {
  const dispatch = useDispatch()
  const { packs, loadingList } = useSelector((state) => state.packs)

  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [packToEdit, setPackToEdit] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [packToDelete, setPackToDelete] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const loadPacks = useCallback(() => {
    dispatch(
      fetchPacksThunk({
        is_active: statusFilter,
      })
    )
  }, [dispatch, statusFilter])

  useEffect(() => {
    loadPacks()
  }, [loadPacks])

  const handleOpenCreate = () => {
    setPackToEdit(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (pack) => {
    setPackToEdit(pack)
    setModalOpen(true)
  }

  const handleOpenDelete = (pack) => {
    setPackToDelete(pack)
    setDeleteDialogOpen(true)
  }

  const handleToggleStatus = async (pack) => {
    const nextStatus = !pack.is_active
    setTogglingId(pack.id)
    const result = await dispatch(
      updatePackThunk({
        id: pack.id,
        packData: { is_active: nextStatus },
      })
    )
    setTogglingId(null)

    if (updatePackThunk.fulfilled.match(result)) {
      toast.success(
        nextStatus
          ? `Pack "${pack.name}" is now active.`
          : `Pack "${pack.name}" is now deactivated.`
      )
    } else {
      toast.error(result.payload || 'Failed to update pack status.')
    }
  }

  const packList = useMemo(() => {
    if (!Array.isArray(packs)) return []
    return packs.filter((p) => {
      if (!searchInput.trim()) return true
      const q = searchInput.toLowerCase()
      return (
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.tier?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q)
      )
    })
  }, [packs, searchInput])

  // Summary Metrics
  const totalCount = Array.isArray(packs) ? packs.length : 0
  const activeCount = Array.isArray(packs)
    ? packs.filter((p) => p.is_active !== false).length
    : 0
  const totalCredits = Array.isArray(packs)
    ? packs.reduce((acc, p) => acc + (Number(p.credits) || 0), 0)
    : 0

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Package className="size-7 text-primary" />
            Question Packs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure question credit bundles, tier allocations, and multi-currency pricing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPacks}
            disabled={loadingList}
            className="gap-2 h-9.5 px-4 rounded-xl border-border/70 hover:bg-muted font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${loadingList ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-2 h-9.5 px-4 rounded-xl shadow-xs font-semibold"
          >
            <Plus className="size-4" />
            Create Pack
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Total Packs</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Package className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">{totalCount}</p>
          <p className="text-xs text-muted-foreground">Bundles in catalog</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Active in Store</span>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {activeCount}
          </p>
          <p className="text-xs text-muted-foreground">Available to purchase</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Total Catalog Credits</span>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Coins className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">{totalCredits}</p>
          <p className="text-xs text-muted-foreground">Combined question credits</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Supported Currencies</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">4 Currencies</p>
          <p className="text-xs text-muted-foreground font-mono">INR • USD • GBP • EUR</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search packs by name, code, or tier..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-background/80 border border-border/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1.5 font-medium">
            <Filter className="size-3.5" />
            Status:
          </span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
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

      {/* Question Packs Data Table */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/60 bg-muted/20">
              <TableHead className="w-[60px] font-semibold text-xs text-foreground uppercase tracking-wider text-center">
                Order
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Pack Details
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Credits
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Tier Access
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider min-w-[200px]">
                Offer Price (INR & USD)
              </TableHead>
              <TableHead className="text-center font-semibold text-xs text-foreground uppercase tracking-wider w-[120px]">
                Status
              </TableHead>
              <TableHead className="text-right font-semibold text-xs text-foreground uppercase tracking-wider w-[120px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingList ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-6 mx-auto rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-36 mb-1" />
                    <Skeleton className="h-3.5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-10 mx-auto rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-16 ml-auto rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : packList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                    <Package className="w-8 h-8 opacity-40" />
                    <p className="text-sm font-medium">No question packs found.</p>
                    <p className="text-xs">
                      Click &ldquo;Create Pack&rdquo; above to set up a new question bundle.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              packList.map((pack) => {
                const isToggling = togglingId === pack.id
                const pricesMap = parsePrices(pack.prices)

                const inrOffer = pricesMap.INR?.offerPrice
                const inrOrig = pricesMap.INR?.originalPrice
                const usdOffer = pricesMap.USD?.offerPrice
                const usdOrig = pricesMap.USD?.originalPrice

                return (
                  <TableRow
                    key={pack.id}
                    className="hover:bg-muted/30 transition-colors border-border/40 group"
                  >
                    {/* Sort Order */}
                    <TableCell className="text-center font-mono text-xs text-muted-foreground font-medium">
                      #{pack.sort_order ?? 1}
                    </TableCell>

                    {/* Pack Details: Name, Code, Title */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {pack.name}
                          </span>
                          {pack.code && (
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
                              {pack.code}
                            </span>
                          )}
                        </div>
                        {pack.title && (
                          <span className="text-xs text-muted-foreground truncate max-w-[240px]">
                            {pack.title}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Credits */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-semibold text-sm text-foreground">
                          +{pack.credits}
                        </span>
                        <span className="text-xs text-muted-foreground">Credits</span>
                      </div>
                    </TableCell>

                    {/* Tier Access */}
                    <TableCell>{getTierBadge(pack.tier)}</TableCell>

                    {/* Offer Price (INR & USD) */}
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {/* INR Row */}
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-foreground text-sm">
                            {formatINR(inrOffer)}
                          </span>
                          {Number(inrOrig) > Number(inrOffer) && (
                            <span className="text-muted-foreground line-through text-[11px]">
                              {formatINR(inrOrig)}
                            </span>
                          )}
                        </div>

                        {/* USD Row + Other currencies badge */}
                        <div className="flex items-center gap-2 font-mono text-muted-foreground text-[11px]">
                          <span>
                            USD: <strong className="text-foreground">{formatUSD(usdOffer)}</strong>
                          </span>
                          {Number(usdOrig) > Number(usdOffer) && (
                            <span className="line-through">{formatUSD(usdOrig)}</span>
                          )}
                          {(pricesMap.GBP?.offerPrice || pricesMap.EUR?.offerPrice) && (
                            <span className="text-[10px] bg-muted/80 rounded px-1 text-muted-foreground">
                              +GBP/EUR
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status & Toggle Switch */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={pack.is_active !== false}
                          onCheckedChange={() => handleToggleStatus(pack)}
                          disabled={isToggling}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                        <span
                          className={`text-xs font-medium w-12 text-left ${
                            pack.is_active !== false
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {pack.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions: Edit & Delete */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(pack)}
                          className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-lg"
                          title="Edit Pack"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDelete(pack)}
                          className="h-8 w-8 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg text-muted-foreground"
                          title="Delete Pack"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Create / Edit Modal */}
      <PackModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        packToEdit={packToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeletePackDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        pack={packToDelete}
      />
    </div>
  )
}

export default QuestionPacksPage
