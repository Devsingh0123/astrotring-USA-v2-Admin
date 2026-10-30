import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Settings,
  User,
  Shield,
  KeyRound,
  Activity,
  Cpu,
  Database,
  Server,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Upload,
  Link as LinkIcon,
  Trash2,
  Clock,
  Sparkles,
  Lock,
  Loader2,
  Radio,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  updateAdminProfileThunk,
  changeAdminPasswordThunk,
  fetchSystemStatusThunk,
} from '@/features/auth/authApi'
import { uploadFileApi } from '@/features/uploads/uploadsApi'

function formatUptime(seconds) {
  if (!seconds || seconds <= 0) return '0s'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)
  return parts.join(' ')
}

export function SettingsPage() {
  const dispatch = useDispatch()
  const { admin, updatingProfile, changingPassword, systemStatus, loadingSystemStatus } =
    useSelector((state) => state.auth)

  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'security' | 'system'

  // Profile state
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)

  // Security state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Sync admin state
  useEffect(() => {
    if (admin) {
      setName(admin.name || '')
      setAvatarUrl(admin.avatar_url || '')
    }
  }, [admin])

  // Fetch system status on mount or tab change
  useEffect(() => {
    if (activeTab === 'system') {
      dispatch(fetchSystemStatusThunk())
    }
  }, [activeTab, dispatch])

  // Initial diagnostics load
  useEffect(() => {
    dispatch(fetchSystemStatusThunk())
  }, [dispatch])

  // Handle Avatar Upload
  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WEBP, GIF)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar file size must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)
    const toastId = toast.loading('Uploading avatar to Cloudinary...')
    try {
      const result = await uploadFileApi(file, 'japaika/admins')
      const uploadedUrl = result?.secure_url || result?.url
      if (!uploadedUrl) throw new Error('Cloudinary did not return a valid URL')

      setAvatarUrl(uploadedUrl)
      toast.success('Avatar uploaded successfully! Click Save to apply.', { id: toastId })
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload avatar', {
        id: toastId,
      })
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Display name cannot be empty')
      return
    }

    try {
      const result = await dispatch(
        updateAdminProfileThunk({
          name: name.trim(),
          avatar_url: avatarUrl.trim() || null,
        })
      ).unwrap()

      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err || 'Failed to update profile')
    }
  }

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (!currentPassword) {
      toast.error('Please enter your current password')
      return
    }

    if (!newPassword) {
      toast.error('Please enter a new password')
      return
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match')
      return
    }

    try {
      await dispatch(
        changeAdminPasswordThunk({
          current_password: currentPassword,
          new_password: newPassword,
        })
      ).unwrap()

      toast.success('Administrator password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err || 'Failed to change password')
    }
  }

  // Refresh System Status
  const handleRefreshSystemStatus = () => {
    dispatch(fetchSystemStatusThunk())
      .unwrap()
      .then(() => toast.success('Diagnostics refreshed'))
      .catch((err) => toast.error(err || 'Failed to refresh diagnostics'))
  }

  const roleLabel = admin?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'
  const initialLetter = ((admin?.name || admin?.email || 'A')[0] || 'A').toUpperCase()

  // Memory calculations
  const memUsed = systemStatus?.memory?.heap_used_mb || 0
  const memTotal = systemStatus?.memory?.heap_total_mb || 1
  const memPercent = Math.min(Math.round((memUsed / Math.max(memTotal, 1)) * 100), 100)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Settings & System Health
            </h1>
            <Badge
              variant="outline"
              className={
                admin?.role === 'super_admin'
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-500 font-semibold'
                  : 'border-primary/30 bg-primary/10 text-primary font-semibold'
              }
            >
              <Shield className="mr-1 size-3" />
              {roleLabel}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your administrator credentials, personal profile, and review live backend
            infrastructure metrics.
          </p>
        </div>

        {activeTab === 'system' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshSystemStatus}
            disabled={loadingSystemStatus}
            className="flex items-center gap-2 border-border/80 hover:bg-muted/80 self-start sm:self-auto"
          >
            <RefreshCw
              className={`size-3.5 ${loadingSystemStatus ? 'animate-spin text-primary' : ''}`}
            />
            <span>Refresh Diagnostics</span>
          </Button>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border/60 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg border-b-2 -mb-px ${
            activeTab === 'profile'
              ? 'border-primary text-foreground bg-accent/40 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          <User className="size-4" />
          <span>Profile Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg border-b-2 -mb-px ${
            activeTab === 'security'
              ? 'border-primary text-foreground bg-accent/40 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          <KeyRound className="size-4" />
          <span>Security & Password</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg border-b-2 -mb-px ${
            activeTab === 'system'
              ? 'border-primary text-foreground bg-accent/40 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          <Activity className="size-4" />
          <span>System Diagnostics</span>
          <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </button>
      </div>

      {/* Tab 1: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Avatar & Summary */}
          <Card className="border-border/60 bg-card/60 shadow-xs lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Administrator Avatar</CardTitle>
              <CardDescription className="text-xs">
                Your visual avatar shown in activity logs and the top-level command bar.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={admin?.name || 'Admin'}
                    className="size-28 rounded-2xl object-cover ring-2 ring-border shadow-md transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://placehold.co/200x200/101626/F59E0B?text=Avatar+Error'
                    }}
                  />
                ) : (
                  <div className="flex size-28 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary/70 text-4xl font-bold text-primary-foreground shadow-md ring-2 ring-primary/20">
                    {initialLetter}
                  </div>
                )}

                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/80 backdrop-blur-xs">
                    <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
                )}
              </div>

              <div className="w-full space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarFileSelect}
                  disabled={isUploadingAvatar || updatingProfile}
                  className="hidden"
                />

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar || updatingProfile}
                    className="w-full gap-2 border-border/80"
                  >
                    <Upload className="size-3.5" />
                    <span>Upload New Photo</span>
                  </Button>

                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAvatarUrl('')}
                      disabled={isUploadingAvatar || updatingProfile}
                      className="w-full gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                      <span>Remove Avatar</span>
                    </Button>
                  )}
                </div>
              </div>

              <Separator className="my-1" />

              <div className="w-full text-left space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Role:</span>
                  <Badge variant="outline" className="text-[11px] capitalize font-medium">
                    {admin?.role?.replace('_', ' ') || 'admin'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Created:</span>
                  <span className="font-mono text-foreground">
                    {admin?.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Profile Edit Form */}
          <Card className="border-border/60 bg-card/60 shadow-xs lg:col-span-2">
            <form onSubmit={handleSaveProfile}>
              <CardHeader>
                <CardTitle className="text-base">Profile Information</CardTitle>
                <CardDescription className="text-xs">
                  Update your display name and direct image resource URL.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-email" className="text-xs font-semibold">
                    Administrator Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="admin-email"
                      value={admin?.email || ''}
                      disabled
                      className="bg-muted/40 font-mono text-xs text-muted-foreground cursor-not-allowed pl-9"
                    />
                    <Lock className="absolute left-3 top-2.5 size-3.5 text-muted-foreground/60" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Email address is bound to your account and cannot be modified directly.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-name" className="text-xs font-semibold">
                    Display Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="admin-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acharya Sharma"
                    required
                    disabled={updatingProfile}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    This name will appear on audit logs, reports, and administrative notes.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-avatar-url" className="text-xs font-semibold">
                    Avatar URL (Direct link or CDN)
                  </Label>
                  <div className="relative">
                    <Input
                      id="admin-avatar-url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://res.cloudinary.com/... or https://..."
                      disabled={updatingProfile}
                      className="text-xs font-mono pl-9"
                    />
                    <LinkIcon className="absolute left-3 top-2.5 size-3.5 text-muted-foreground/60" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Optionally provide an external HTTPS image URL or use the upload button on the
                    left.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border/40 pt-4">
                <Button
                  type="submit"
                  disabled={updatingProfile || isUploadingAvatar}
                  className="gap-2"
                >
                  {updatingProfile ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      <span>Save Profile</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border/60 bg-card/60 shadow-xs lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                <span>Security Guidelines</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Best practices for administrative access and credential protection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Use at least 8 characters with a mix of letters, numbers, and symbols.</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Never share your administrator credentials with other team members.</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Sessions automatically expire. Maintain active 2FA if enabled on your corporate
                  email.
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 shadow-xs lg:col-span-2">
            <form onSubmit={handleChangePassword}>
              <CardHeader>
                <CardTitle className="text-base">Change Administrator Password</CardTitle>
                <CardDescription className="text-xs">
                  Update your credentials. You will continue to remain signed in on this device.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="current-password" className="text-xs font-semibold">
                    Current Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      disabled={changingPassword}
                      className="pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-xs font-semibold">
                    New Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      disabled={changingPassword}
                      className="pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password" className="text-xs font-semibold">
                    Confirm New Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      required
                      disabled={changingPassword}
                      className="pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border/40 pt-4">
                <Button type="submit" disabled={changingPassword} className="gap-2">
                  {changingPassword ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="size-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Tab 3: System Status & Diagnostics */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* Key Infrastructure Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Service & Runtime */}
            <Card className="border-border/60 bg-card/60 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Backend Service
                </CardTitle>
                <Server className="size-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-lg font-bold tracking-tight text-foreground truncate">
                  {systemStatus?.service || 'japaika-admin-backend'}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Node:</span>
                  <span className="font-mono font-medium text-foreground">
                    {systemStatus?.node_version || 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Environment & Uptime */}
            <Card className="border-border/60 bg-card/60 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Environment & Uptime
                </CardTitle>
                <Clock className="size-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-foreground capitalize">
                    {systemStatus?.environment || 'development'}
                  </span>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[10px] font-medium">
                    Live
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Uptime:</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatUptime(systemStatus?.uptime_seconds)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Database Engine & Latency */}
            <Card className="border-border/60 bg-card/60 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Database Health
                </CardTitle>
                <Database className="size-4 text-blue-500" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-foreground">
                    {systemStatus?.database?.engine || 'MySQL'}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      systemStatus?.database?.status === 'healthy'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[10px]'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-500 text-[10px]'
                    }
                  >
                    {systemStatus?.database?.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Query Latency:</span>
                  <span className="font-mono font-medium text-foreground">
                    {systemStatus?.database?.latency_ms != null
                      ? `${systemStatus.database.latency_ms} ms`
                      : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Heap Memory */}
            <Card className="border-border/60 bg-card/60 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Memory Utilization
                </CardTitle>
                <Cpu className="size-4 text-purple-500" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-lg font-bold tracking-tight text-foreground font-mono">
                  {memUsed} MB <span className="text-xs font-normal text-muted-foreground">/ {memTotal} MB</span>
                </div>
                <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      memPercent > 80
                        ? 'bg-destructive'
                        : memPercent > 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${memPercent}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Diagnostics Table & Integration Matrix */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Memory Telemetry Breakdown */}
            <Card className="border-border/60 bg-card/60 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HardDrive className="size-4 text-purple-500" />
                  <span>Node Process Memory Breakdown</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  V8 engine heap and resident set memory allocation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2 text-xs">
                  <span className="text-muted-foreground">Resident Set Size (RSS):</span>
                  <span className="font-mono font-semibold text-foreground">
                    {systemStatus?.memory?.rss_mb ? `${systemStatus.memory.rss_mb} MB` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2 text-xs">
                  <span className="text-muted-foreground">V8 Heap Used:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {systemStatus?.memory?.heap_used_mb
                      ? `${systemStatus.memory.heap_used_mb} MB`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2 text-xs">
                  <span className="text-muted-foreground">V8 Heap Total Allocated:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {systemStatus?.memory?.heap_total_mb
                      ? `${systemStatus.memory.heap_total_mb} MB`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-muted-foreground">Heap Utilization Rate:</span>
                  <span className="font-mono font-semibold text-emerald-500">{memPercent}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Cloud & Third-Party Integrations */}
            <Card className="border-border/60 bg-card/60 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Radio className="size-4 text-primary" />
                  <span>External Integrations Matrix</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Connected media CDNs and payment gateways status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Cloudinary */}
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                      <Upload className="size-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">Cloudinary Media CDN</div>
                      <div className="text-[11px] text-muted-foreground">Image hosting & uploads</div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      systemStatus?.integrations?.cloudinary
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[11px]'
                        : 'border-muted text-muted-foreground text-[11px]'
                    }
                  >
                    {systemStatus?.integrations?.cloudinary ? 'Active' : 'Unconfigured'}
                  </Badge>
                </div>

                {/* Razorpay */}
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Sparkles className="size-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">Razorpay Gateway</div>
                      <div className="text-[11px] text-muted-foreground">INR & UPI payments</div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      systemStatus?.integrations?.razorpay
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[11px]'
                        : 'border-muted text-muted-foreground text-[11px]'
                    }
                  >
                    {systemStatus?.integrations?.razorpay ? 'Active' : 'Unconfigured'}
                  </Badge>
                </div>

                {/* Database Engine Info */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                      <Database className="size-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">MySQL Relational DB</div>
                      <div className="text-[11px] text-muted-foreground">Core data & transactions</div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[11px]"
                  >
                    Operational
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
