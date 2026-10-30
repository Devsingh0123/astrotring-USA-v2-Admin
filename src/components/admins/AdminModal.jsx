import { useState } from 'react'
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
import { createAdminThunk } from '@/features/admins/adminsApi'
import { clearAdminsError } from '@/features/admins/adminsSlice'
import { BRAND } from '@/lib/constants'
import { ShieldAlert, Shield, ShieldCheck, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export function AdminModal({ open, onOpenChange }) {
  const dispatch = useDispatch()
  const { submitting, error } = useSelector((state) => state.admins)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('admin')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState('')

  const handleClose = () => {
    setName('')
    setEmail('')
    setPassword('')
    setRole('admin')
    setShowPassword(false)
    setValidationError('')
    dispatch(clearAdminsError())
    onOpenChange(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError('Please provide a valid email address.')
      return
    }

    if (!password || password.length < 6) {
      setValidationError('Password must be at least 6 characters long.')
      return
    }

    const payload = {
      name: name.trim() || 'Administrator',
      email: email.trim().toLowerCase(),
      password,
      role,
    }

    const result = await dispatch(createAdminThunk(payload))
    if (createAdminThunk.fulfilled.match(result)) {
      toast.success(`Staff administrator "${payload.email}" created successfully!`)
      handleClose()
    } else {
      toast.error(result.payload || 'Failed to create administrator.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/60 shadow-2xl bg-card">
        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-muted/20">
          <DialogHeader className="gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-semibold border border-purple-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Invite Administrator
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Grant administrative console access and define RBAC privilege tier.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {(validationError || error) && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="admin-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name
            </Label>
            <Input
              id="admin-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acharya Sharma or Editorial Lead"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address *
            </Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={BRAND.STAFF_EMAIL_PLACEHOLDER}
              required
            />
          </div>

          {/* Initial Password */}
          <div className="space-y-1.5">
            <Label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Initial Password * (min 6 characters)
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              The administrator can change this password after signing in via Settings.
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Role & Privileges *
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  role === 'admin'
                    ? 'border-primary/50 bg-primary/10 text-primary shadow-xs'
                    : 'border-border/60 bg-card/40 hover:bg-muted/30 text-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="size-4" />
                  <span className="text-xs font-bold text-foreground">Standard Admin</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Can manage users, orders, coupons, blogs, and report packs.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('super_admin')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  role === 'super_admin'
                    ? 'border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'border-border/60 bg-card/40 hover:bg-muted/30 text-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="size-4 text-purple-500" />
                  <span className="text-xs font-bold text-foreground">Super Admin</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Full control: manage staff accounts, roles, and system settings.
                </p>
              </button>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/40 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="rounded-xl gap-2 font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Administrator</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
