import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { createReportPackThunk, updateReportPackThunk } from '@/features/reportPacks/reportPacksApi'
import { clearReportPacksError } from '@/features/reportPacks/reportPacksSlice'
import {
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  Coins,
  Check,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_REPORT_PRICES = {
  INR: { originalPrice: '2999', offerPrice: '1999' },
  USD: { originalPrice: '29.99', offerPrice: '19.99' },
  GBP: { originalPrice: '24.99', offerPrice: '16.99' },
  EUR: { originalPrice: '27.99', offerPrice: '18.99' },
}

const CURRENCIES = [
  { code: 'INR', label: 'INR (₹)', symbol: '₹', step: '1', min: '1' },
  { code: 'USD', label: 'USD ($)', symbol: '$', step: '0.01', min: '0.01' },
  { code: 'GBP', label: 'GBP (£)', symbol: '£', step: '0.01', min: '0.01' },
  { code: 'EUR', label: 'EUR (€)', symbol: '€', step: '0.01', min: '0.01' },
]

const TIERS = [
  { id: 'silver', label: 'Silver', badgeClass: 'border-slate-400/40 text-slate-700 dark:text-slate-300 bg-slate-500/10' },
  { id: 'gold', label: 'Gold', badgeClass: 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10' },
  { id: 'diamond', label: 'Diamond', badgeClass: 'border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-500/10' },
  { id: 'custom', label: 'Custom', badgeClass: 'border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10' },
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

export function ReportPackModal({ open, onOpenChange, packToEdit = null }) {
  const dispatch = useDispatch()
  const { isSubmitting, error } = useSelector((state) => state.reportPacks)

  const isEdit = Boolean(packToEdit)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [tier, setTier] = useState('silver')
  const [credits, setCredits] = useState('1')
  const [sortOrder, setSortOrder] = useState('1')
  const [isActive, setIsActive] = useState(true)

  const [prices, setPrices] = useState({
    INR: { originalPrice: '', offerPrice: '' },
    USD: { originalPrice: '', offerPrice: '' },
    GBP: { originalPrice: '', offerPrice: '' },
    EUR: { originalPrice: '', offerPrice: '' },
  })

  const [activePreviewCurrency, setActivePreviewCurrency] = useState('INR')
  const [validationError, setValidationError] = useState('')

  const resetForm = useCallback(() => {
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

  // Sync state with packToEdit
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
        GBP: {
          originalPrice: parsed.GBP?.originalPrice !== undefined ? String(parsed.GBP.originalPrice) : '',
          offerPrice: parsed.GBP?.offerPrice !== undefined ? String(parsed.GBP.offerPrice) : '',
        },
        EUR: {
          originalPrice: parsed.EUR?.originalPrice !== undefined ? String(parsed.EUR.originalPrice) : '',
          offerPrice: parsed.EUR?.offerPrice !== undefined ? String(parsed.EUR.offerPrice) : '',
        },
      })
      setValidationError('')
    } else {
      resetForm()
    }
  }, [packToEdit, resetForm])

  // Auto-fill code and title on create when name or credits change
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

  // Calculate discount percentage for preview
  const currentDiscount = useMemo(() => {
    const orig = Number(prices[activePreviewCurrency]?.originalPrice)
    const offer = Number(prices[activePreviewCurrency]?.offerPrice)
    if (orig && offer && orig > offer) {
      return Math.round(((orig - offer) / orig) * 100)
    }
    return 0
  }, [prices, activePreviewCurrency])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (!name.trim()) {
      setValidationError('Pack name is required.')
      return
    }

    const parsedCredits = parseInt(credits, 10)
    if (isNaN(parsedCredits) || parsedCredits <= 0) {
      setValidationError('Credits must be a positive integer greater than 0.')
      return
    }

    // Build prices payload
    const structuredPrices = {}
    for (const curr of ['INR', 'USD', 'GBP', 'EUR']) {
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
      setValidationError('Please configure at least one currency price (e.g. INR or USD).')
      return
    }

    const payload = {
      name: name.trim(),
      credits: parsedCredits,
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 border-border/60 bg-card shadow-2xl">
        <DialogHeader className="gap-1 border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <FileText className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {isEdit ? 'Edit Report Pack' : 'Create New Report Pack'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configure report consultation credits, astrological tier, and multi-currency pricing.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {(validationError || error) && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        <form id="report-pack-form" onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Main Grid: Left = Pack Metadata, Right = Storefront Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Inputs */}
            <div className="md:col-span-2 space-y-4">
              {/* Row 1: Name & Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="rp-name" className="text-xs font-semibold">
                    Pack Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="rp-name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Silver, Gold, Vedic Master"
                    required
                    className="text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rp-tier" className="text-xs font-semibold">
                    Astrological Tier
                  </Label>
                  <select
                    id="rp-tier"
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                  >
                    {TIERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label} Tier
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Code & Report Credits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="rp-code" className="text-xs font-semibold">
                    Unique Code
                  </Label>
                  <Input
                    id="rp-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. report_silver_1"
                    className="text-xs font-mono rounded-xl"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Auto-generated if left blank. Unique identifier in DB.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rp-credits" className="text-xs font-semibold">
                    Report Credits Awarded <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="rp-credits"
                      type="number"
                      min="1"
                      step="1"
                      value={credits}
                      onChange={(e) => handleCreditsChange(e.target.value)}
                      required
                      className="text-xs pl-8 rounded-xl font-semibold text-primary"
                    />
                    <FileText className="size-4 absolute left-2.5 top-2.5 text-primary pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Number of full PDF consultation reports unlocked.
                  </p>
                </div>
              </div>

              {/* Row 3: Marketing Title */}
              <div className="space-y-1.5">
                <Label htmlFor="rp-title" className="text-xs font-semibold">
                  Display Title (Storefront Subtitle)
                </Label>
                <Input
                  id="rp-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Silver Report Pack (1 Report Credit)"
                  className="text-xs rounded-xl"
                />
              </div>

              {/* Row 4: Sort Order & Active Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="rp-sort" className="text-xs font-semibold">
                    Display Sort Order
                  </Label>
                  <Input
                    id="rp-sort"
                    type="number"
                    min="0"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Lower numbers display first (1, 2, 3...).
                  </p>
                </div>

                <div className="flex flex-col justify-end">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">Active in Store</p>
                      <p className="text-[11px] text-muted-foreground">Visible to customers</p>
                    </div>
                    <Switch
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Live Storefront Card Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Eye className="size-3.5 text-primary" /> Storefront Preview
                </span>
                <span className="text-[10px] text-primary/80 font-mono uppercase">
                  {tier}
                </span>
              </div>

              <div className="relative rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/60 p-4 shadow-lg overflow-hidden space-y-3">
                {/* Background decorative astrological glow */}
                <div className="absolute -top-10 -right-10 size-28 bg-primary/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {name || 'Report Pack Name'}
                    </h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {title || 'Comprehensive Vedic Consultation'}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold uppercase ${
                      TIERS.find((t) => t.id === tier)?.badgeClass || ''
                    }`}
                  >
                    {tier}
                  </Badge>
                </div>

                {/* Credits Pill */}
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <FileText className="size-3.5 text-primary" /> Reports
                  </span>
                  <span className="font-bold text-primary">
                    +{credits || 1} Full Report{Number(credits) > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Currency Price Preview */}
                <div className="pt-1">
                  <div className="flex items-center gap-1 mb-1.5">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setActivePreviewCurrency(c.code)}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
                          activePreviewCurrency === c.code
                            ? 'bg-primary text-primary-foreground font-bold'
                            : 'text-muted-foreground hover:text-foreground bg-muted/30'
                        }`}
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-foreground">
                      {CURRENCIES.find((c) => c.code === activePreviewCurrency)?.symbol}
                      {prices[activePreviewCurrency]?.offerPrice || '—'}
                    </span>
                    {prices[activePreviewCurrency]?.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {CURRENCIES.find((c) => c.code === activePreviewCurrency)?.symbol}
                        {prices[activePreviewCurrency].originalPrice}
                      </span>
                    )}
                    {currentDiscount > 0 && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0 px-1 font-semibold ml-auto">
                        Save {currentDiscount}%
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-1">
                  <Sparkles className="size-3 text-amber-500 shrink-0" />
                  <span>Includes PDF Kundli & Dosha remedies</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Multi-Currency Pricing Inputs */}
          <div className="space-y-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="size-3.5 text-primary" /> Multi-Currency Pricing
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Specify both original retail price and discounted offer price for each currency.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {CURRENCIES.map((curr) => {
                const orig = Number(prices[curr.code]?.originalPrice)
                const offer = Number(prices[curr.code]?.offerPrice)
                const discount = orig && offer && orig > offer ? Math.round(((orig - offer) / orig) * 100) : 0

                return (
                  <div
                    key={curr.code}
                    className="p-3 rounded-xl border border-border/70 bg-card/60 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1">
                        <span className="font-mono text-primary">{curr.symbol}</span> {curr.label}
                      </span>
                      {discount > 0 && (
                        <span className="text-[10px] font-bold text-emerald-500">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Offer Price</Label>
                        <Input
                          type="number"
                          step={curr.step}
                          min={curr.min}
                          value={prices[curr.code]?.offerPrice || ''}
                          onChange={(e) => handlePriceChange(curr.code, 'offerPrice', e.target.value)}
                          placeholder="e.g. 1999"
                          className="h-8 text-xs font-semibold rounded-lg text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Original Price (Strike)</Label>
                        <Input
                          type="number"
                          step={curr.step}
                          min={curr.min}
                          value={prices[curr.code]?.originalPrice || ''}
                          onChange={(e) => handlePriceChange(curr.code, 'originalPrice', e.target.value)}
                          placeholder="e.g. 2999"
                          className="h-8 text-xs rounded-lg text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-2 pt-4 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="report-pack-form"
            disabled={isSubmitting}
            className="gap-2 rounded-xl"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
