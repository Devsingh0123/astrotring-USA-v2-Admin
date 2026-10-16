import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, Mail, KeyRound, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const { isAuthenticated, sendOtp, verifyOtp, loginAsDemoAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleSendOtp = async (e) => {
    e?.preventDefault()
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      toast.error('Please enter a valid administrator email address.')
      return
    }

    setSubmitting(true)
    try {
      const response = await sendOtp(trimmedEmail)
      const waitSec = response?.data?.cooldownSeconds || 30
      setCooldown(waitSec)
      setStep('otp')
      toast.success(response?.message || '6-digit verification code sent to your email.')
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to dispatch OTP. Is the backend server running?'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const cleanOtp = otp.trim()
    if (cleanOtp.length !== 6) {
      toast.error('Please enter the 6-digit verification code.')
      return
    }

    setSubmitting(true)
    try {
      await verifyOtp(email.trim().toLowerCase(), cleanOtp)
      toast.success('Administrator session authenticated.')
      navigate(from, { replace: true })
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Invalid OTP or insufficient administrator permissions.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDemoAccess = () => {
    loginAsDemoAdmin()
    toast.success('Entered Admin Panel in Demo Preview Mode')
    navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Identity */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AstroTring Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Passwordless OTP authentication for authorized administrators
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-medium text-foreground"
                >
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@astrotring.com"
                    className="h-9 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                Code sent to <span className="font-semibold text-foreground">{email}</span>.
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setOtp('')
                  }}
                  className="ml-2 font-medium text-primary underline-offset-2 hover:underline"
                >
                  Change
                </button>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="admin-otp"
                  className="block text-xs font-medium text-foreground"
                >
                  6-Digit One-Time Passcode
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="admin-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="h-9 w-full rounded-lg border border-input bg-background pr-3 pl-9 font-mono text-sm tracking-widest text-foreground outline-none transition-colors placeholder:tracking-normal placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting || otp.length !== 6}
                className="w-full gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Enter Command Center
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                <span>Didn&apos;t receive the email?</span>
                <button
                  type="button"
                  disabled={cooldown > 0 || submitting}
                  onClick={handleSendOtp}
                  className="font-medium text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Development Helper
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleDemoAccess}
            className="w-full gap-2"
          >
            <ShieldCheck className="size-4 text-primary" />
            Preview Admin Dashboard (Demo Session)
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Protected by JWT + Role-Based Access Control (`role === &apos;admin&apos;`)
        </p>
      </div>
    </div>
  )
}
