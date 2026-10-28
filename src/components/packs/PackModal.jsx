import { useState, useEffect, useCallback } from 'react'
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
import { createPackThunk, updatePackThunk } from '@/features/packs/packsApi'
import { clearPacksError } from '@/features/packs/packsSlice'
import {
  Package,
  Sparkles,
  Loader2,
  AlertCircle,
  Coins,
  Shield,
  ArrowUpDown,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_PRICES = {
  INR: { originalPrice: '999', offerPrice: '499' },
  USD: { originalPrice: '14.99', offerPrice: '7.99' },
}

const CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', step: '1', min: '1' },
  { code: 'USD', label: 'US Dollar', symbol: '$', step: '0.01', min: '0.01' },
]

const TIERS = [
  { id: 'silver', label: 'Silver', color: 'border-slate-400/40 text-slate-700 dark:text-slate-300 bg-slate-500/10' },
  { id: 'gold', label: 'Gold', color: 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10' },
  { id: 'diamond', label: 'Diamond', color: 'border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-500/10' },
  { id: 'custom', label: 'Custom', color: 'border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10' },
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

export function PackModal({ open, onOpenChange, packToEdit = null }) {
  const dispatch = useDispatch()
  const { isSubmitting, error } = useSelector((state) => state.packs)

  const isEdit = Boolean(packToEdit)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [tier, setTier] = useState('silver')
  const [credits, setCredits] = useState('5')
  const [sortOrder, setSortOrder] = useState('1')
  const [isActive, setIsActive] = useState(true)

  // Multi-Currency Prices state: { INR: { originalPrice: '', offerPrice: '' }, ... }
  const [prices, setPrices] = useState({
    INR: { originalPrice: '', offerPrice: '' },
    USD: { originalPrice: '', offerPrice: '' },
          })

  const [validationError, setValidationError] = useState('')

  const resetForm = useCallback(() => {
    setName('')
    setCode('')
    setTitle('')
    setTier('silver')
    setCredits('5')
    setSortOrder('1')
    setIsActive(true)
    setPrices(DEFAULT_PRICES)
    setValidationError('')
    dispatch(clearPacksError())
  }, [dispatch])

  useEffect(() => {
    if (packToEdit) {
      setName(packToEdit.name || '')
      setCode(packToEdit.code || '')
      setTitle(packToEdit.title || '')
      setTier(packToEdit.tier?.toLowerCase() || 'silver')
      setCredits(String(packToEdit.credits ?? '5'))
      setSortOrder(String(packToEdit.sort_order ?? '1'))
      setIsActive(packToEdit.is_active !== false)

      const parsed = parsePrices(packToEdit.prices)
      setPrices({
        INR: {
          originalPrice: parsed.INR?.originalPrice ?? '',
          offerPrice: parsed.INR?.offerPrice ?? '',
        },
        USD: {
          originalPrice: parsed.USD?.originalPrice ?? '',
          offerPrice: parsed.USD?.offerPrice ?? '',
        },
      })
    } else {
      resetForm()
    }
  }, [packToEdit, open, resetForm])

  const handlePriceChange = (currCode, field, value) => {
    setPrices((prev) => ({
      ...prev,
      [currCode]: {
        ...prev[currCode],
        [field]: value,
      },
    }))
  }

  const handleClose = () => {
    if (isSubmitting) return
    onOpenChange(false)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    const cleanName = name.trim()
    if (!cleanName) {
      setValidationError('Pack name is required.')
      return
    }

    const numCredits = parseInt(credits, 10)
    if (isNaN(numCredits) || numCredits <= 0) {
      setValidationError('Credits must be a positive integer greater than 0.')
      return
    }

    // Build prices object with validation
    const formattedPrices = {}
    for (const curr of CURRENCIES) {
      const orig = parseFloat(prices[curr.code]?.originalPrice)
      const offer = parseFloat(prices[curr.code]?.offerPrice)

      if (isNaN(offer) || offer <= 0) {
        setValidationError(`Offer price for ${curr.code} must be greater than 0.`)
        return
      }

      if (!isNaN(orig) && orig > 0 && offer > orig) {
        setValidationError(`Offer price for ${curr.code} cannot exceed original price.`)
        return
      }

      formattedPrices[curr.code] = {
        originalPrice: isNaN(orig) || orig <= 0 ? offer : orig,
        offerPrice: offer,
      }
    }

    const payload = {
      name: cleanName,
      credits: numCredits,
      tier,
      sort_order: parseInt(sortOrder, 10) || 1,
      is_active: isActive,
      prices: formattedPrices,
    }

    if (code.trim()) {
      payload.code = code.trim().toLowerCase().replace(/\s+/g, '_')
    }
    if (title.trim()) {
      payload.title = title.trim()
    } else {
      payload.title = `${cleanName} Pack (${numCredits} Questions)`
    }

    let result
    if (isEdit) {
      result = await dispatch(updatePackThunk({ id: packToEdit.id, packData: payload }))
      if (updatePackThunk.fulfilled.match(result)) {
        toast.success(`Question Pack "${cleanName}" updated successfully!`)
        handleClose()
      } else {
        toast.error(result.payload || 'Failed to update question pack.')
      }
    } else {
      result = await dispatch(createPackThunk(payload))
      if (createPackThunk.fulfilled.match(result)) {
        toast.success(`Question Pack "${cleanName}" created successfully!`)
        handleClose()
      } else {
        toast.error(result.payload || 'Failed to create question pack.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl w-full max-h-[92vh] overflow-y-auto p-0 gap-0 border-border/60 shadow-2xl bg-card">
        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-muted/20">
          <DialogHeader className="gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold border border-primary/20">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  {isEdit ? 'Edit Question Pack' : 'Create Question Pack'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Configure question credits, tier access, and multi-currency pricing.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {(validationError || error) && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          {/* Basic Info: Name, Credits, Tier */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pack-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pack Name *
                </Label>
                <Input
                  id="pack-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (!isEdit && !code) {
                      setCode(`pack_${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${credits}`)
                    }
                  }}
                  placeholder="e.g. Starter Boost or Gold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pack-credits" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  Credits Granted *
                </Label>
                <Input
                  id="pack-credits"
                  type="number"
                  min="1"
                  step="1"
                  value={credits}
                  onChange={(e) => {
                    setCredits(e.target.value)
                    if (!isEdit && name) {
                      setCode(`pack_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${e.target.value}`)
                    }
                  }}
                  placeholder="e.g. 5"
                  className="font-mono font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tier Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Tier Access *
                </Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIERS.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTier(t.id)}
                      className={`py-2 px-1 text-center rounded-lg text-xs font-medium border transition-all ${
                        tier === t.id
                          ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                          : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order & Code */}
              <div className="space-y-1.5">
                <Label htmlFor="sort-order" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
                  Display Sort Order
                </Label>
                <Input
                  id="sort-order"
                  type="number"
                  min="1"
                  step="1"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  placeholder="1"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pack-code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pack Code (Identifier)
                </Label>
                <Input
                  id="pack-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. pack_starter_5"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pack-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Custom Display Title
                </Label>
                <Input
                  id="pack-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Starter Boost Pack (5 Questions)"
                />
              </div>
            </div>
          </div>

          {/* Multi-Currency Pricing Matrix */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                Multi-Currency Pricing Matrix *
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Set Original (M.R.P.) & Offer Selling Price
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CURRENCIES.map((curr) => {
                const orig = parseFloat(prices[curr.code]?.originalPrice)
                const offer = parseFloat(prices[curr.code]?.offerPrice)
                const discountPercent =
                  !isNaN(orig) && !isNaN(offer) && orig > offer
                    ? Math.round(((orig - offer) / orig) * 100)
                    : 0

                return (
                  <div
                    key={curr.code}
                    className="p-3.5 rounded-xl border border-border/60 bg-muted/15 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs bg-background border border-border/60 px-2 py-0.5 rounded">
                          {curr.code} ({curr.symbol})
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {curr.label}
                        </span>
                      </div>
                      {discountPercent > 0 && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] py-0">
                          {discountPercent}% OFF
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">
                          Original Price
                        </span>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">
                            {curr.symbol}
                          </span>
                          <Input
                            type="number"
                            step={curr.step}
                            min={curr.min}
                            value={prices[curr.code]?.originalPrice}
                            onChange={(e) =>
                              handlePriceChange(curr.code, 'originalPrice', e.target.value)
                            }
                            placeholder="0"
                            className="pl-6 font-mono text-xs h-8"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-primary uppercase font-semibold">
                          Offer Price *
                        </span>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary text-xs font-mono font-bold">
                            {curr.symbol}
                          </span>
                          <Input
                            type="number"
                            step={curr.step}
                            min={curr.min}
                            value={prices[curr.code]?.offerPrice}
                            onChange={(e) =>
                              handlePriceChange(curr.code, 'offerPrice', e.target.value)
                            }
                            placeholder="0"
                            className="pl-6 font-mono text-xs h-8 font-semibold border-primary/40 focus:border-primary"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-foreground">
                Active & Available for Purchase
              </Label>
              <p className="text-xs text-muted-foreground">
                If enabled, users can select and buy this pack in storefront checkout.
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          {/* Modal Footer Buttons */}
          <DialogFooter className="pt-3 border-t border-border/40 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {isEdit ? 'Save Changes' : 'Create Pack'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
