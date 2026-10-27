import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { createReportPackThunk, updateReportPackThunk } from '@/features/reportPacks/reportPacksApi'
import { clearReportPacksError } from '@/features/reportPacks/reportPacksSlice'
import {
  FileText,
  Loader2,
  AlertCircle,
  Coins,
  Check,
  Eye,
  Crown,
  Gem,
  Sun,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_REPORT_PRICES = {
  INR: { originalPrice: '2999', offerPrice: '1999' },
  USD: { originalPrice: '29.99', offerPrice: '19.99' },
    }

const CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', step: '1', min: '1', defaultOffer: '1999', defaultOrig: '2999' },
  { code: 'USD', label: 'US Dollar', symbol: '$', step: '0.01', min: '0.01', defaultOffer: '19.99', defaultOrig: '29.99' },
    ]

const TIERS = [
  {
    id: 'silver',
    label: 'Silver',
    icon: Shield,
    desc: 'Entry single consultation',
    badgeClass: 'border-slate-400/50 text-slate-700 dark:text-slate-300 bg-slate-500/10',
    cardBorder: 'border-slate-400/40 hover:border-slate-400/80',
    activeBg: 'bg-slate-500/10 border-slate-400 text-slate-900 dark:text-slate-100 ring-1 ring-slate-400',
  },
  {
    id: 'gold',
    label: 'Gold',
    icon: Sun,
    desc: 'Most popular pair package',
    badgeClass: 'border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10',
    cardBorder: 'border-amber-500/40 hover:border-amber-500/80',
    activeBg: 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-100 ring-1 ring-amber-500',
  },
  {
    id: 'diamond',
    label: 'Diamond',
    icon: Gem,
    desc: 'Full family comprehensive',
    badgeClass: 'border-sky-500/50 text-sky-600 dark:text-sky-400 bg-sky-500/10',
    cardBorder: 'border-sky-500/40 hover:border-sky-500/80',
    activeBg: 'bg-sky-500/10 border-sky-500 text-sky-900 dark:text-sky-100 ring-1 ring-sky-500',
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: Crown,
    desc: 'Bespoke corporate / VIP tier',
    badgeClass: 'border-purple-500/50 text-purple-600 dark:text-purple-400 bg-purple-500/10',
    cardBorder: 'border-purple-500/40 hover:border-purple-500/80',
    activeBg: 'bg-purple-500/10 border-purple-500 text-purple-900 dark:text-purple-100 ring-1 ring-purple-500',
  },
]

const CREDIT_PRESETS = [1, 2, 4, 6, 8]

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

export function ReportPackModal({ open, onOpenChange, packToEdit = null }) {
  const dispatch = useDispatch()
  const { isSubmitting, error } = useSelector((state) => state.reportPacks)

  const isEdit = Boolean(packToEdit)

  // Active Wizard Tab: 'details' | 'pricing'
  const [activeTab, setActiveTab] = useState('details')

  // Form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [tier, setTier] = useState('silver')
  const [credits, setCredits] = useState('1')
  const [sortOrder, setSortOrder] = useState('1')
  const [isActive, setIsActive] = useState(true)

  const [prices, setPrices] = useState(DEFAULT_REPORT_PRICES)
  const [activePreviewCurrency, setActivePreviewCurrency] = useState('INR')
  const [validationError, setValidationError] = useState('')

  const resetForm = useCallback(() => {
    setActiveTab('details')
    setName('')
    setCode('')
    setTitle('')
    setTier('silver')
    setCredits('1')
    setSortOrder('1')
    setIsActive(true)
    setPrices(DEFAULT_REPORT_PRICES)
    setValidationError('')
    dispatch(clearReportPacksError())
  }, [dispatch])

  // Populate form on edit
  useEffect(() => {
    if (packToEdit) {
      setName(packToEdit.name || '')
      setCode(packToEdit.code || '')
      setTitle(packToEdit.title || '')
      setTier(packToEdit.tier || 'silver')
      setCredits(String(packToEdit.credits ?? '1'))
      setSortOrder(String(packToEdit.sort_order ?? '0'))
      setIsActive(packToEdit.is_active ?? true)

      const parsed = parsePrices(packToEdit.prices)
      setPrices({
        INR: {
          originalPrice: parsed.INR?.originalPrice !== undefined ? String(parsed.INR.originalPrice) : '',
          offerPrice: parsed.INR?.offerPrice !== undefined ? String(parsed.INR.offerPrice) : '',
        },
        USD: {
          originalPrice: parsed.USD?.originalPrice !== undefined ? String(parsed.USD.originalPrice) : '',
          offerPrice: parsed.USD?.offerPrice !== undefined ? String(parsed.USD.offerPrice) : '',
        },
      })
      setValidationError('')
      setActiveTab('details')
    } else {
      resetForm()
    }
  }, [packToEdit, resetForm])

  // Auto-generate code and title
  const handleNameChange = (val) => {
    setName(val)
    if (!isEdit) {
      const clean = val.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')
      setCode(clean ? `report_${clean}_${credits}` : '')
      setTitle(val.trim() ? `${val.trim()} Report Pack (${credits} Report Credit${Number(credits) > 1 ? 's' : ''})` : '')
    }
  }

  const handleCreditsChange = (val) => {
    setCredits(val)
    if (!isEdit && name.trim()) {
      const clean = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')
      setCode(`report_${clean}_${val}`)
      setTitle(`${name.trim()} Report Pack (${val} Report Credit${Number(val) > 1 ? 's' : ''})`)
    }
  }

  const handlePriceChange = (curr, field, val) => {
    setPrices((prev) => ({
      ...prev,
      [curr]: {
        ...prev[curr],
        [field]: val,
      },
    }))
  }

  // Calculate discount percentage helper
  const computeDiscount = useCallback(
    (currCode) => {
      const orig = Number(prices[currCode]?.originalPrice)
      const offer = Number(prices[currCode]?.offerPrice)
      if (orig && offer && orig > offer) {
        return Math.round(((orig - offer) / orig) * 100)
      }
      return 0
    },
    [prices]
  )

  const previewDiscount = useMemo(
    () => computeDiscount(activePreviewCurrency),
    [computeDiscount, activePreviewCurrency]
  )

  const validateStep1 = () => {
    if (!name.trim()) {
      setValidationError('Please enter a pack name.')
      return false
    }
    const parsedCredits = parseInt(credits, 10)
    if (isNaN(parsedCredits) || parsedCredits <= 0) {
      setValidationError('Report credits must be at least 1.')
      return false
    }
    setValidationError('')
    return true
  }

  const handleContinueToPricing = () => {
    if (validateStep1()) {
      setActiveTab('pricing')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (!validateStep1()) {
      setActiveTab('details')
      return
    }

    // Build prices payload
    const structuredPrices = {}
    for (const curr of ['INR', 'USD']) {
      const orig = Number(prices[curr]?.originalPrice)
      const offer = Number(prices[curr]?.offerPrice)

      if (!isNaN(offer) && offer > 0) {
        structuredPrices[curr] = {
          offerPrice: offer,
          originalPrice: !isNaN(orig) && orig > 0 ? orig : offer,
        }
      }
    }

    if (Object.keys(structuredPrices).length === 0) {
      setActiveTab('pricing')
      setValidationError('Please configure at least one currency price (e.g. INR or USD).')
      return
    }

    const payload = {
      name: name.trim(),
      credits: parseInt(credits, 10),
      tier,
      prices: structuredPrices,
      is_active: isActive,
      sort_order: parseInt(sortOrder, 10) || 0,
    }

    if (code.trim()) {
      payload.code = code.trim().toLowerCase()
    }
    if (title.trim()) {
      payload.title = title.trim()
    }

    if (isEdit) {
      const result = await dispatch(updateReportPackThunk({ id: packToEdit.id, packData: payload }))
      if (updateReportPackThunk.fulfilled.match(result)) {
        toast.success(`Report pack "${payload.name}" updated successfully.`)
        onOpenChange(false)
      } else {
        toast.error(result.payload || 'Failed to update report pack.')
      }
    } else {
      const result = await dispatch(createReportPackThunk(payload))
      if (createReportPackThunk.fulfilled.match(result)) {
        toast.success(`Report pack "${payload.name}" created successfully.`)
        onOpenChange(false)
      } else {
        toast.error(result.payload || 'Failed to create report pack.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl md:max-w-5xl w-full max-h-[90vh] overflow-hidden p-0 gap-0 border-border/70 bg-card shadow-2xl rounded-3xl flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border/50 bg-muted/15 shrink-0">
          <DialogHeader className="gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
                  <FileText className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                    {isEdit ? 'Edit Report Consultation Pack' : 'Create Report Consultation Pack'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Configure astrological consultation tiers, report credit allowances, and multi-currency pricing.
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Stepper Tabs Bar */}
            <div className="flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'details'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }`}
              >
                <span className="size-5 rounded-full bg-background/20 text-current flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                Pack Details & Tier
              </button>

              <button
                type="button"
                onClick={handleContinueToPricing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'pricing'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }`}
              >
                <span className="size-5 rounded-full bg-background/20 text-current flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                Multi-Currency Pricing & Preview
              </button>
            </div>
          </DialogHeader>
        </div>

        {/* Error Notification Banner */}
        {(validationError || error) && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2.5">
            <AlertCircle className="size-4 shrink-0" />
            <span className="font-medium">{validationError || error}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form
          id="report-pack-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6"
        >
          {activeTab === 'details' ? (
            /* TAB 1: DETAILS & CREDITS */
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Section 1: Name & Tier */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rp-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Pack Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="rp-name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Silver, Gold, Diamond, Vedic Master"
                    className="h-11 text-sm font-semibold rounded-xl bg-background/70 border-border/80"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    The customer-facing name of the report package.
                  </p>
                </div>

                {/* Astrological Tier Selector Cards */}
                <div className="space-y-2 pt-1">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Astrological Tier <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TIERS.map((t) => {
                      const IconComp = t.icon
                      const isSelected = tier === t.id
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTier(t.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                            isSelected
                              ? t.activeBg
                              : 'border-border/60 bg-card/40 hover:bg-muted/20 text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <IconComp className={`size-4.5 ${isSelected ? 'text-current' : 'text-muted-foreground'}`} />
                            {isSelected && (
                              <CheckCircle2 className="size-4 text-current" />
                            )}
                          </div>
                          <p className={`text-xs font-bold ${isSelected ? 'text-current' : 'text-foreground'}`}>
                            {t.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                            {t.desc}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Section 2: Report Credits Counter */}
              <div className="p-5 rounded-2xl border border-border/60 bg-muted/15 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="rp-credits" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <FileText className="size-4 text-primary" /> Report Credits Awarded <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Number of comprehensive PDF Vedic consultation reports this package grants.
                    </p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30 bg-primary/10">
                    +{credits} Report{Number(credits) > 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {CREDIT_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleCreditsChange(String(p))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        Number(credits) === p
                          ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                          : 'border-border/70 bg-background/80 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {p} Report{p > 1 ? 's' : ''}
                    </button>
                  ))}
                  <div className="w-24 ml-auto">
                    <Input
                      id="rp-credits"
                      type="number"
                      min="1"
                      value={credits}
                      onChange={(e) => handleCreditsChange(e.target.value)}
                      placeholder="Custom"
                      className="h-9 text-xs font-bold text-center rounded-xl bg-background"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Title & System Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rp-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Storefront Subtitle / Marketing Tagline
                  </Label>
                  <Input
                    id="rp-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Silver Report Pack (1 Report Credit)"
                    className="h-10 text-xs rounded-xl bg-background/70 border-border/80"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Displayed directly beneath the pack name in the storefront.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rp-code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Database Unique Code
                  </Label>
                  <Input
                    id="rp-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. report_silver_1"
                    className="h-10 text-xs font-mono rounded-xl bg-background/70 border-border/80"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Internal lookup slug used by billing & checkout APIs.
                  </p>
                </div>
              </div>

              {/* Section 4: Display Order & Active Switch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="rp-sort" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Storefront Display Sort Order
                  </Label>
                  <Input
                    id="rp-sort"
                    type="number"
                    min="0"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-background/70 border-border/80"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Lower numbers display first (1 = leftmost featured pack).
                  </p>
                </div>

                <div className="flex flex-col justify-end">
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-muted/20">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">Storefront Active Status</p>
                      <p className="text-[11px] text-muted-foreground">Immediately available to users</p>
                    </div>
                    <Switch
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: MULTI-CURRENCY PRICING & STOREFRONT PREVIEW */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: 4 Spacious Currency Cards (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-border/40">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Coins className="size-4 text-primary" /> Multi-Currency Rates
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Set retail and offer prices for customers globally.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {CURRENCIES.map((curr) => {
                    const orig = Number(prices[curr.code]?.originalPrice)
                    const offer = Number(prices[curr.code]?.offerPrice)
                    const discount = computeDiscount(curr.code)

                    return (
                      <div
                        key={curr.code}
                        className="p-4 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xs space-y-3 shadow-xs hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="size-7 rounded-xl bg-primary/10 text-primary font-mono font-bold flex items-center justify-center text-xs">
                              {curr.symbol}
                            </span>
                            <span className="text-xs font-bold text-foreground">
                              {curr.label}
                            </span>
                          </div>
                          {discount > 0 && (
                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                              Save {discount}%
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2.5">
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                              <span>Offer Price (Selling)</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                                {curr.symbol}{offer || 0}
                              </span>
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-xs font-mono text-muted-foreground pointer-events-none">
                                {curr.symbol}
                              </span>
                              <Input
                                type="number"
                                step={curr.step}
                                min={curr.min}
                                value={prices[curr.code]?.offerPrice || ''}
                                onChange={(e) => handlePriceChange(curr.code, 'offerPrice', e.target.value)}
                                placeholder={curr.defaultOffer}
                                className="h-9 pl-7 text-xs font-bold text-emerald-600 dark:text-emerald-400 rounded-xl bg-background"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                              <span>Original Price (Strike)</span>
                              <span className="text-muted-foreground line-through font-mono text-[10px]">
                                {curr.symbol}{orig || 0}
                              </span>
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-xs font-mono text-muted-foreground pointer-events-none">
                                {curr.symbol}
                              </span>
                              <Input
                                type="number"
                                step={curr.step}
                                min={curr.min}
                                value={prices[curr.code]?.originalPrice || ''}
                                onChange={(e) => handlePriceChange(curr.code, 'originalPrice', e.target.value)}
                                placeholder={curr.defaultOrig}
                                className="h-9 pl-7 text-xs rounded-xl text-muted-foreground bg-background"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Column: High-Fidelity Storefront Preview Card (lg:col-span-5) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-border/40">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Eye className="size-4 text-primary" /> Storefront Preview
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono uppercase text-primary border-primary/30">
                    Live Demo
                  </Badge>
                </div>

                {/* Customer Storefront Card */}
                <div className="rounded-3xl border-2 border-border/80 bg-gradient-to-b from-card via-card/90 to-card/70 p-6 shadow-xl relative overflow-hidden space-y-4">
                  {/* Astrological Cosmic Ambient Glow */}
                  <div className="absolute -top-16 -right-16 size-40 bg-primary/15 rounded-full blur-2xl pointer-events-none" />

                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-extrabold text-foreground tracking-tight">
                        {name || 'Report Pack Name'}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {title || 'Comprehensive Vedic Astrology Report'}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs font-bold uppercase px-2.5 py-0.5 ${
                        TIERS.find((t) => t.id === tier)?.badgeClass || ''
                      }`}
                    >
                      {tier}
                    </Badge>
                  </div>

                  {/* Credits Highlight Pill */}
                  <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                        <FileText className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          +{credits || 1} Full Report{Number(credits) > 1 ? 's' : ''} Included
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Comprehensive Kundli & Dosha charts
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Currency Interactive Switcher on Preview */}
                  <div className="pt-1 space-y-2">
                    <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl w-fit">
                      {CURRENCIES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setActivePreviewCurrency(c.code)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-mono font-medium transition-colors ${
                            activePreviewCurrency === c.code
                              ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {c.code}
                        </button>
                      ))}
                    </div>

                    {/* Price Tag Display */}
                    <div className="flex items-baseline gap-2.5 pt-1">
                      <span className="text-3xl font-black text-foreground tracking-tight">
                        {CURRENCIES.find((c) => c.code === activePreviewCurrency)?.symbol}
                        {prices[activePreviewCurrency]?.offerPrice || '—'}
                      </span>
                      {prices[activePreviewCurrency]?.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through font-mono">
                          {CURRENCIES.find((c) => c.code === activePreviewCurrency)?.symbol}
                          {prices[activePreviewCurrency].originalPrice}
                        </span>
                      )}
                      {previewDiscount > 0 && (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs py-0.5 px-2 font-bold ml-auto">
                          Save {previewDiscount}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="pt-3 border-t border-border/50 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Check className="size-3.5 text-primary shrink-0" />
                      <span>Complete Planetary Kundli & Lagna chart</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="size-3.5 text-primary shrink-0" />
                      <span>Dosha analysis & astrological remedies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="size-3.5 text-primary shrink-0" />
                      <span>Instant high-res PDF download & storage</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-5 border-t border-border/50 bg-muted/15 shrink-0 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2.5">
            {activeTab === 'details' ? (
              <Button
                type="button"
                onClick={handleContinueToPricing}
                className="gap-2 rounded-xl text-xs font-semibold shadow-xs"
              >
                <span>Continue to Pricing</span>
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('details')}
                  disabled={isSubmitting}
                  className="gap-1.5 rounded-xl text-xs"
                >
                  <ArrowLeft className="size-4" />
                  <span>Back to Details</span>
                </Button>

                <Button
                  type="submit"
                  form="report-pack-form"
                  disabled={isSubmitting}
                  className="gap-2 rounded-xl text-xs font-semibold shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {isEdit ? 'Saving Changes...' : 'Creating Pack...'}
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      {isEdit ? 'Update Report Pack' : 'Create Report Pack'}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
