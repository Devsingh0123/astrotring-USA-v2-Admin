import React from 'react'
import { AlertTriangle, RefreshCw, Home, Copy, Check, ChevronDown, ChevronUp, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary caught error]:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    })
    if (typeof this.props.onReset === 'function') {
      this.props.onReset()
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleNavigateHome = () => {
    window.location.href = '/'
  }

  handleCopyDetails = () => {
    const { error, errorInfo } = this.state
    const details = [
      `Error: ${error?.name || 'Unknown Error'}: ${error?.message || 'No message provided'}`,
      '',
      '--- Stack Trace ---',
      error?.stack || 'No stack trace available',
      '',
      '--- Component Stack ---',
      errorInfo?.componentStack || 'No component stack available',
      '',
      `URL: ${window.location.href}`,
      `Timestamp: ${new Date().toISOString()}`,
    ].join('\n')

    navigator.clipboard
      .writeText(details)
      .then(() => {
        this.setState({ copied: true })
        toast.success('Diagnostic error log copied to clipboard')
        setTimeout(() => this.setState({ copied: false }), 2500)
      })
      .catch(() => {
        toast.error('Failed to copy error details to clipboard')
      })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({
              error: this.state.error,
              errorInfo: this.state.errorInfo,
              resetError: this.handleReset,
            })
          : this.props.fallback
      }

      const { error, errorInfo, showDetails, copied } = this.state
      const isStandalone = this.props.standalone || false

      return (
        <div
          role="alert"
          aria-live="assertive"
          className={`flex items-center justify-center p-4 sm:p-6 transition-colors ${
            isStandalone
              ? 'min-h-screen bg-background text-foreground'
              : 'min-h-[500px] w-full rounded-3xl border border-destructive/20 bg-card/60 backdrop-blur-md shadow-xs'
          }`}
        >
          <div className="w-full max-w-xl text-center space-y-6">
            {/* Ambient Alert Icon Pill */}
            <div className="relative inline-flex items-center justify-center mx-auto">
              <div className="absolute inset-0 rounded-2xl bg-destructive/20 blur-xl animate-pulse" />
              <div className="relative size-16 sm:size-18 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center justify-center shadow-lg">
                <AlertTriangle className="size-8 sm:size-9" />
              </div>
            </div>

            {/* Error Typography */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">
                Application Exception
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Something went wrong in this view
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                An unexpected runtime error occurred while rendering this interface. Your authentication session and data remain safe.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Button
                variant="default"
                size="sm"
                onClick={this.handleReset}
                className="rounded-xl gap-2 font-semibold shadow-xs"
              >
                <RefreshCw className="size-4" />
                Try Again
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReload}
                className="rounded-xl gap-2 border-border/80 hover:bg-muted/40 font-semibold"
              >
                Reload Window
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={this.handleNavigateHome}
                className="rounded-xl gap-2 text-muted-foreground hover:text-foreground font-medium"
              >
                <Home className="size-4" />
                Back to Dashboard
              </Button>
            </div>

            {/* Developer Diagnostics Accordion */}
            <div className="pt-2 border-t border-border/60 text-left">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => this.setState({ showDetails: !showDetails })}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-md px-1 py-0.5"
                >
                  <Terminal className="size-3.5 text-primary" />
                  <span>Technical Diagnostics</span>
                  {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>

                {showDetails && (
                  <button
                    type="button"
                    onClick={this.handleCopyDetails}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none"
                    title="Copy full stack trace"
                  >
                    {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    <span>{copied ? 'Copied' : 'Copy Log'}</span>
                  </button>
                )}
              </div>

              {showDetails && (
                <div className="mt-3 p-3.5 rounded-xl bg-muted/40 border border-border/80 font-mono text-[11px] text-muted-foreground overflow-x-auto max-h-56 space-y-2">
                  <div className="text-destructive font-semibold">
                    {error?.name || 'Error'}: {error?.message || 'Unknown runtime exception'}
                  </div>
                  {error?.stack && (
                    <pre className="text-[10px] leading-relaxed text-muted-foreground/80 whitespace-pre-wrap break-all">
                      {error.stack}
                    </pre>
                  )}
                  {errorInfo?.componentStack && (
                    <div className="pt-2 border-t border-border/40">
                      <span className="text-[10px] font-bold text-foreground">Component Stack:</span>
                      <pre className="text-[10px] text-muted-foreground/70 whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
