import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAdminsThunk,
  updateAdminRoleThunk,
  updateAdminStatusThunk,
  deleteAdminThunk,
} from '@/features/admins/adminsApi'
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
import { AdminModal } from '@/components/admins/AdminModal'
import { DeleteAdminDialog } from '@/components/admins/DeleteAdminDialog'
import {
  ShieldAlert,
  Shield,
  ShieldCheck,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Lock,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

export function AdminsPage() {
  const dispatch = useDispatch()
  const { currentAdmin } = useSelector((state) => ({ currentAdmin: state.auth.admin }))
  const { admins, pagination, loadingList, togglingId, deletingId } = useSelector(
    (state) => state.admins
  )

  const isSuperAdmin = currentAdmin?.role === 'super_admin'

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const loadData = useCallback(() => {
    const params = {
      page,
      limit: 20,
    }
    if (search.trim()) params.search = search.trim()
    if (roleFilter !== 'all') params.role = roleFilter
    if (statusFilter !== 'all') params.status = statusFilter

    dispatch(fetchAdminsThunk(params))
  }, [dispatch, page, search, roleFilter, statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  // KPI Calculations
  const stats = useMemo(() => {
    const total = admins.length
    const superAdmins = admins.filter((a) => a.role === 'super_admin').length
    const active = admins.filter((a) => !a.is_blocked).length
    return { total, superAdmins, active }
  }, [admins])

  // Handle status toggle (suspend / activate)
  const handleToggleStatus = async (admin) => {
    if (!isSuperAdmin) {
      toast.error('Super Admin privileges are required to change account status.')
      return
    }

    if (admin.id === currentAdmin?.id) {
      toast.error('You cannot suspend your own administrator account.')
      return
    }

    const nextStatus = !admin.is_blocked
    const result = await dispatch(
      updateAdminStatusThunk({ id: admin.id, is_blocked: nextStatus })
    )

    if (updateAdminStatusThunk.fulfilled.match(result)) {
      toast.success(
        `Administrator "${admin.email}" ${nextStatus ? 'suspended' : 'activated'} successfully.`
      )
    } else {
      toast.error(result.payload || 'Failed to update administrator status.')
    }
  }

  // Handle role change
  const handleChangeRole = async (admin, newRole) => {
    if (!isSuperAdmin) {
      toast.error('Super Admin privileges are required to change roles.')
      return
    }

    if (admin.id === currentAdmin?.id && newRole !== 'super_admin') {
      toast.error('You cannot demote your own super administrator role.')
      return
    }

    const result = await dispatch(
      updateAdminRoleThunk({ id: admin.id, role: newRole })
    )

    if (updateAdminRoleThunk.fulfilled.match(result)) {
      toast.success(`Role updated to "${newRole}" for ${admin.email}.`)
    } else {
      toast.error(result.payload || 'Failed to update administrator role.')
    }
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!adminToDelete) return

    const result = await dispatch(deleteAdminThunk(adminToDelete.id))
    if (deleteAdminThunk.fulfilled.match(result)) {
      toast.success(`Administrator "${adminToDelete.email}" deleted successfully.`)
      setIsDeleteDialogOpen(false)
      setAdminToDelete(null)
    } else {
      toast.error(result.payload || 'Failed to delete administrator.')
    }
  }

  const formatAdminDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
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
              Staff Administrators
            </h1>
            <Badge
              variant="outline"
              className={
                isSuperAdmin
                  ? 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10'
                  : 'border-border/60 text-muted-foreground'
              }
            >
              {isSuperAdmin ? 'Super Admin Mode' : 'Standard View'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage staff credentials, administrator RBAC permissions, and access states.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loadingList}
            className="rounded-xl gap-2 border-border/80 hover:bg-muted/40"
          >
            <RefreshCw className={`size-3.5 ${loadingList ? 'animate-spin text-primary' : ''}`} />
            <span>Refresh</span>
          </Button>

          {isSuperAdmin && (
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl gap-2 font-semibold shadow-xs"
            >
              <Plus className="size-4" />
              <span>Invite Admin</span>
            </Button>
          )}
        </div>
      </div>

      {/* Non-Super Admin Banner */}
      {!isSuperAdmin && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2.5">
          <Lock className="size-4 shrink-0 text-amber-500" />
          <span>
            You are logged in as a <strong>Standard Administrator</strong>. Inviting staff, modifying roles, and suspending accounts requires <strong>Super Admin</strong> authorization.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Total Staff</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Registered administrators</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Super Admins</span>
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <ShieldAlert className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">{stats.superAdmins}</p>
          <p className="text-xs text-muted-foreground">Full privileges & staff management</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Active Accounts</span>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <UserCheck className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">{stats.active}</p>
          <p className="text-xs text-muted-foreground">Operational console access</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
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
            placeholder="Search staff by name or email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-background border border-border/70 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            className="h-8 rounded-xl border border-border/70 bg-card px-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="h-8 rounded-xl border border-border/70 bg-card px-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Admins Data Table */}
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/60">
              <TableHead className="w-[300px]">Staff Identity</TableHead>
              <TableHead className="w-[180px]">Role & Access</TableHead>
              <TableHead className="w-[140px]">Account Status</TableHead>
              <TableHead className="w-[160px]">Created Date</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingList ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i} className="border-border/40">
                  <TableCell><Skeleton className="h-5 w-48 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28 rounded-md" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-semibold text-foreground">No administrators found</p>
                    <p className="text-xs text-muted-foreground">
                      {search || roleFilter !== 'all' || statusFilter !== 'all'
                        ? 'Try modifying your search filter.'
                        : 'No staff members have been configured.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              admins.map((a) => {
                const isCurrent = a.id === currentAdmin?.id
                const isSuper = a.role === 'super_admin'
                const initialLetter = (a.name?.[0] || a.email?.[0] || 'A').toUpperCase()

                return (
                  <TableRow key={a.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                    {/* Identity */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {a.avatar_url ? (
                          <img
                            src={a.avatar_url}
                            alt={a.name}
                            className="size-8.5 rounded-xl object-cover ring-1 ring-border shrink-0"
                          />
                        ) : (
                          <div className="size-8.5 rounded-xl bg-gradient-to-tr from-primary/80 to-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {initialLetter}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground truncate">{a.name}</span>
                            {isCurrent && (
                              <Badge variant="secondary" className="text-[9px] px-1 py-0 uppercase">
                                You
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-mono block truncate">
                            {a.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role Dropdown / Badge */}
                    <TableCell>
                      {isSuperAdmin && !isCurrent ? (
                        <select
                          value={a.role}
                          onChange={(e) => handleChangeRole(a, e.target.value)}
                          className={`h-7 px-2 text-xs font-semibold rounded-lg border outline-none cursor-pointer transition-colors ${
                            isSuper
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400'
                              : 'bg-primary/10 border-primary/30 text-primary'
                          }`}
                        >
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      ) : (
                        <Badge
                          variant="outline"
                          className={
                            isSuper
                              ? 'border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10'
                              : 'border-primary/40 text-primary bg-primary/10'
                          }
                        >
                          {isSuper ? 'Super Admin' : 'Admin'}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Status Toggle Switch */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!a.is_blocked}
                          onCheckedChange={() => handleToggleStatus(a)}
                          disabled={!isSuperAdmin || isCurrent || togglingId === a.id}
                        />
                        <span
                          className={`text-xs font-medium ${
                            !a.is_blocked
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-500 font-semibold'
                          }`}
                        >
                          {!a.is_blocked ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {formatAdminDate(a.created_at)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      {isSuperAdmin && !isCurrent ? (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setAdminToDelete(a)
                            setIsDeleteDialogOpen(true)
                          }}
                          disabled={deletingId === a.id}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          title="Delete staff account"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invite Admin Modal */}
      <AdminModal open={isModalOpen} onOpenChange={setIsModalOpen} />

      {/* Delete Admin Confirmation Dialog */}
      <DeleteAdminDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        admin={adminToDelete}
        onConfirm={handleConfirmDelete}
        loading={deletingId !== null}
      />
    </div>
  )
}
