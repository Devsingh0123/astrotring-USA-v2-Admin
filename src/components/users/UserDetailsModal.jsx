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
import { updateUserStatusThunk } from '@/features/users/usersApi'
import { clearSelectedUser } from '@/features/users/usersSlice'
import {
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  FileText,
  User,
  Compass,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

function formatAccountDate(dateValue) {
  if (!dateValue) return '—'
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function UserDetailsModal({ open, onOpenChange }) {
  const dispatch = useDispatch()
  const { selectedUser, loadingDetails, updatingStatusId } = useSelector(
    (state) => state.users
  )
  const [copied, setCopied] = useState(false)

  const handleClose = () => {
    onOpenChange(false)
    dispatch(clearSelectedUser())
  }

  const handleCopyId = (id) => {
    if (!id) return
    navigator.clipboard.writeText(id)
    setCopied(true)
    toast.success('User ID copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleStatus = async () => {
    if (!selectedUser) return
    const nextStatus = !selectedUser.is_blocked
    const resultAction = await dispatch(
      updateUserStatusThunk({ id: selectedUser.id, is_blocked: nextStatus })
    )
    if (updateUserStatusThunk.fulfilled.match(resultAction)) {
      toast.success(
        nextStatus
          ? `User ${selectedUser.email} has been suspended.`
          : `User ${selectedUser.email} has been unblocked.`
      )
    } else {
      toast.error(resultAction.payload || 'Failed to update user status.')
    }
  }

  const isUpdatingThisUser = updatingStatusId === selectedUser?.id

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto sm:rounded-2xl">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              User Details
            </DialogTitle>
            {selectedUser && (
              <Badge
                variant="outline"
                className={`gap-1 px-2.5 py-0.5 text-xs font-medium ${
                  selectedUser.is_blocked
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-500'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                }`}
              >
                {selectedUser.is_blocked ? (
                  <>
                    <ShieldAlert className="size-3" /> Suspended
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-3" /> Active
                  </>
                )}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Complete account metadata and associated Vedic birth chart bindings.
          </DialogDescription>
        </DialogHeader>

        {loadingDetails ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading user profile & birth details...</p>
          </div>
        ) : !selectedUser ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No user information loaded.
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Primary Profile Grid */}
            <div className="rounded-xl border border-border/70 bg-card p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-base font-semibold text-foreground">
                    {selectedUser.email}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      ID: {selectedUser.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(selectedUser.id)}
                      className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                      title="Copy User ID"
                    >
                      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    Role: {selectedUser.role}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="capitalize text-primary border-primary/30 bg-primary/5"
                  >
                    Tier: {selectedUser.tier || 'free'}
                  </Badge>
                </div>
              </div>

              {/* Stats & Status Strip */}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/50 pt-3 sm:grid-cols-4">
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="size-3.5 text-primary" />
                    <span>Vaani Credits</span>
                  </div>
                  <div className="mt-1 font-mono text-base font-semibold text-foreground">
                    {selectedUser.credit_balance ?? 0}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 p-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="size-3.5 text-primary" />
                    <span>Report Credits</span>
                  </div>
                  <div className="mt-1 font-mono text-base font-semibold text-foreground">
                    {selectedUser.report_credits ?? 0}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 p-2.5">
                  <span className="text-xs text-muted-foreground">Email Verified</span>
                  <div className="mt-1 flex items-center gap-1 text-xs font-medium">
                    {selectedUser.is_email_verified ? (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <CheckCircle2 className="size-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <XCircle className="size-3.5" /> Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 p-2.5">
                  <span className="text-xs text-muted-foreground">Onboarding</span>
                  <div className="mt-1 flex items-center gap-1 text-xs font-medium">
                    {selectedUser.onboarding_completed ? (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <CheckCircle2 className="size-3.5" /> Complete
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Clock className="size-3.5" /> Incomplete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Birth Details Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Compass className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Bound Birth Details ({selectedUser.birth_details?.length || 0})
                </h3>
              </div>

              {!selectedUser.birth_details || selectedUser.birth_details.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                  No Vedic birth details bound to this user yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedUser.birth_details.map((bd) => (
                    <div
                      key={bd.id}
                      className="rounded-xl border border-border bg-card p-4 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-primary" />
                          <span className="font-semibold text-foreground">
                            {bd.full_name || 'Unnamed Profile'}
                          </span>
                          <span className="text-xs capitalize text-muted-foreground">
                            ({bd.gender || 'Unknown'})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {bd.is_primary && (
                            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] text-primary">
                              Primary Chart
                            </Badge>
                          )}
                          <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                            {bd.profile_type || 'self'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2.5 text-xs text-foreground sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          <span>Date of Birth: <strong>{bd.date_of_birth || '—'}</strong></span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="size-3.5 text-muted-foreground" />
                          <span>
                            Time of Birth: <strong>{bd.time_of_birth || 'Unknown'}</strong>{' '}
                            {bd.is_time_unknown && (
                              <span className="text-[10px] text-amber-500">(Time Unverified)</span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 sm:col-span-2">
                          <MapPin className="size-3.5 text-muted-foreground" />
                          <span>
                            Location: <strong>{bd.birth_city || '—'}</strong>{' '}
                            <span className="font-mono text-[11px] text-muted-foreground">
                              ({bd.latitude}, {bd.longitude}) • TZ: {bd.timezone}
                            </span>
                          </span>
                        </div>
                      </div>

                      {bd.chart_id && (
                        <div className="mt-3 rounded-md bg-muted/40 px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground">
                          Chart ID: {bd.chart_id}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timestamps & Modal Footer */}
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3.5 text-muted-foreground/70" />
                <span>
                  Account created:{' '}
                  <strong className="font-medium text-foreground">
                    {formatAccountDate(selectedUser.created_at || selectedUser.createdAt)}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={selectedUser.is_blocked ? 'default' : 'destructive'}
                  size="sm"
                  disabled={isUpdatingThisUser}
                  onClick={handleToggleStatus}
                  className="gap-1.5"
                >
                  {isUpdatingThisUser ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : selectedUser.is_blocked ? (
                    <ShieldCheck className="size-3.5" />
                  ) : (
                    <ShieldAlert className="size-3.5" />
                  )}
                  {selectedUser.is_blocked ? 'Unblock User' : 'Suspend User'}
                </Button>

                <Button variant="outline" size="sm" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
