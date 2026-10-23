import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchUsersThunk,
  fetchUserDetailsThunk,
  updateUserStatusThunk,
} from '@/features/users/usersApi'
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
import { UserDetailsModal } from '@/components/users/UserDetailsModal'
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Users,
  Sparkles,
  FileText,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

export function UsersPage() {
  const dispatch = useDispatch()
  const { users, pagination, loadingList, updatingStatusId } = useSelector(
    (state) => state.users
  )

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [modalOpen, setModalOpen] = useState(false)

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1) // Reset to page 1 on new search
    }, 400)
    return () => clearInterval(timer)
  }, [searchInput])

  const loadUsers = useCallback(() => {
    dispatch(fetchUsersThunk({ page, limit, search: debouncedSearch }))
  }, [dispatch, page, limit, debouncedSearch])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleOpenDetails = (userId) => {
    dispatch(fetchUserDetailsThunk(userId))
    setModalOpen(true)
  }

  const handleToggleBlock = async (user) => {
    const nextStatus = !user.is_blocked
    const resultAction = await dispatch(
      updateUserStatusThunk({ id: user.id, is_blocked: nextStatus })
    )

    if (updateUserStatusThunk.fulfilled.match(resultAction)) {
      toast.success(
        nextStatus
          ? `User ${user.email} suspended.`
          : `User ${user.email} unblocked.`
      )
    } else {
      toast.error(resultAction.payload || 'Failed to update user status.')
    }
  }

  const getTierBadge = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'diamond':
        return (
          <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-500 font-medium">
            Diamond
          </Badge>
        )
      case 'gold':
        return (
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 font-medium">
            Gold
          </Badge>
        )
      case 'silver':
        return (
          <Badge variant="outline" className="border-slate-400/30 bg-slate-400/10 text-slate-400 font-medium">
            Silver
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-border text-muted-foreground font-normal">
            Free
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              User Management
            </h1>
            <Badge variant="outline" className="border-border bg-muted/60 text-xs font-semibold">
              {pagination?.total ?? users.length} Accounts
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Inspect customer accounts, review Vedic birth charts, track credit balances, and manage status.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadUsers}
          disabled={loadingList}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`size-3.5 ${loadingList ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search users by email..."
            className="h-9 w-full rounded-lg border border-input bg-card pr-8 pl-9 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-muted-foreground">Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value))
              setPage(1)
            }}
            className="h-8 rounded-lg border border-input bg-card px-2 text-xs text-foreground outline-none focus:border-ring"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-b border-border">
              <TableHead className="font-semibold text-xs">User / Email</TableHead>
              <TableHead className="font-semibold text-xs">Tier & Role</TableHead>
              <TableHead className="font-semibold text-xs">Credits</TableHead>
              <TableHead className="font-semibold text-xs">Onboarding</TableHead>
              <TableHead className="font-semibold text-xs">Joined</TableHead>
              <TableHead className="font-semibold text-xs text-center">Status</TableHead>
              <TableHead className="font-semibold text-xs text-center">Block Toggle</TableHead>
              <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {loadingList ? (
              // Loading Skeleton Rows
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="size-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-36" />
                        <Skeleton className="h-2.5 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-5 w-10 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-7 w-20 rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Users className="size-8 opacity-40" />
                    <p className="text-sm font-medium">No users found</p>
                    <p className="text-xs">
                      {debouncedSearch
                        ? `No users match the search term "${debouncedSearch}".`
                        : 'No customer accounts registered yet.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
                const initial = (u.email?.[0] || 'U').toUpperCase()
                const isBlocked = Boolean(u.is_blocked)
                const isUpdating = updatingStatusId === u.id

                return (
                  <TableRow
                    key={u.id}
                    className="transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted"
                  >
                    {/* User Identity */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-medium text-foreground truncate">
                            <span className="truncate">{u.email}</span>
                            {u.is_email_verified && (
                              <CheckCircle2
                                className="size-3.5 shrink-0 text-emerald-500"
                                title="Email Verified"
                              />
                            )}
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground truncate">
                            {u.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Tier & Role */}
                    <TableCell className="py-3.5">
                      <div className="flex flex-col items-start gap-1">
                        {getTierBadge(u.tier)}
                        <span className="text-[11px] capitalize text-muted-foreground">
                          {u.role || 'user'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Credits */}
                    <TableCell className="py-3.5">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1 text-foreground">
                          <Sparkles className="size-3 text-primary" />
                          <span className="font-mono font-medium">{u.credit_balance ?? 0}</span>
                          <span className="text-[10px] text-muted-foreground">questions</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                          <FileText className="size-3" />
                          <span className="font-mono">{u.report_credits ?? 0}</span>
                          <span className="text-[10px]">reports</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Onboarding Status */}
                    <TableCell className="py-3.5">
                      {u.onboarding_completed ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                          <CheckCircle2 className="size-3.5" />
                          <span>Complete</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3.5 text-amber-500" />
                          <span>Pending</span>
                        </span>
                      )}
                    </TableCell>

                    {/* Registration Date */}
                    <TableCell className="py-3.5 text-xs text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </TableCell>

                    {/* Status Pill */}
                    <TableCell className="py-3.5 text-center">
                      <Badge
                        variant="outline"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium ${
                          isBlocked
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-500'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                        }`}
                      >
                        {isBlocked ? (
                          <>
                            <ShieldAlert className="size-3" /> Blocked
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="size-3" /> Active
                          </>
                        )}
                      </Badge>
                    </TableCell>

                    {/* Block / Unblock Switch */}
                    <TableCell className="py-3.5 text-center">
                      <div className="inline-flex items-center justify-center">
                        <Switch
                          checked={!isBlocked}
                          disabled={isUpdating}
                          onCheckedChange={() => handleToggleBlock(u)}
                          aria-label={`Toggle access for ${u.email}`}
                        />
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleOpenDetails(u.id)}
                        className="gap-1.5 text-xs"
                      >
                        <Eye className="size-3" />
                        <span>Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
          <div className="text-xs text-muted-foreground">
            {pagination?.total > 0 ? (
              <>
                Showing{' '}
                <strong className="text-foreground">
                  {(pagination.page - 1) * pagination.limit + 1}
                </strong>{' '}
                to{' '}
                <strong className="text-foreground">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </strong>{' '}
                of <strong className="text-foreground">{pagination.total}</strong> users
              </>
            ) : (
              '0 users'
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-xs"
              disabled={pagination?.page <= 1 || loadingList}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <span className="px-2 text-xs font-medium text-foreground">
              Page {pagination?.page || 1} of {pagination?.totalPages || 1}
            </span>

            <Button
              variant="outline"
              size="icon-xs"
              disabled={pagination?.page >= pagination?.totalPages || loadingList}
              onClick={() => setPage((prev) => prev + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
