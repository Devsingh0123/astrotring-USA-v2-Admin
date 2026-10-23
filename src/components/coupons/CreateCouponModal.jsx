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
import { createCouponThunk } from '@/features/coupons/couponsApi'
import { clearCouponsError } from '@/features/coupons/couponsSlice'
import {
  Tag,
  Percent,
  IndianRupee,
  Gift,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

const DISCOUNT_TYPES = [
  {
    id: 'percentage',
    label: 'Percentage',
    desc: '% off total order',
    icon: Percent,
  },
  {
    id: 'flat',
    label: 'Flat Discount',
    desc: 'Fixed ₹ deduction',
    icon: IndianRupee,
  },
  {
    id: 'pack_offer',
    label: 'Pack Offer',
    desc: 'Special pack deal',
    icon: Gift,
  },
]

const AVAILABLE_PACKS = [
  { code: 'pack_bronze_3', label: 'Bronze Pack (3 Credits)' },
  { code: 'pack_silver_6', label: 'Silver Pack (6 Credits)' },
  { code: 'pack_gold_12', label: 'Gold Pack (12 Credits)' },
  { code: 'pack_vip_25', label: 'VIP Pack (25 Credits)' },
]

export function CreateCouponModal({ open, onOpenChange }) {
  const dispatch = useDispatch()
  const { isCreating, createError } = useSelector((state) => state.coupons)

  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [applicableProducts, setApplicableProducts] = useState([]) // empty array = all
  const [expiresAt, setExpiresAt] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleClose = () => {
    if (isCreating) return
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setCode('')
    setDescription('')
    setDiscountType('percentage')
    setDiscountValue('')
    setApplicableProducts([])
    setExpiresAt('')
    setMaxUses('')
    setValidationError('')
    dispatch(clearCouponsError())
  }

  const toggleProduct = (prodCode) => {
    setApplicableProducts((prev) =>
      prev.includes(prodCode)
        ? prev.filter((c) => c !== prodCode)
        : [...prev, prodCode]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) {
      setValidationError('Coupon code is required.')
      return
    }

    if (!/^[A-Z0-9_-]+$/.test(cleanCode)) {
      setValidationError('Code must contain only letters, numbers, hyphens, and underscores.')
      return
    }

    const numVal = parseFloat(discountValue)
    if (isNaN(numVal) || numVal <= 0) {
      setValidationError('Please enter a valid positive discount amount.')
      return
    }

    if (discountType === 'percentage' && numVal > 100) {
      setValidationError('Percentage discount cannot exceed 100%.')
      return
    }

    const payload = {
      code: cleanCode,
      description: description.trim() || undefined,
      discount_type: discountType,
      discount_value: numVal,
      applicable_products: applicableProducts,
    }

    if (maxUses && parseInt(maxUses, 10) > 0) {
      payload.max_uses = parseInt(maxUses, 10)
    }

    if (expiresAt) {
      payload.expires_at = new Date(expiresAt).toISOString()
    }

    const result = await dispatch(createCouponThunk(payload))
    if (createCouponThunk.fulfilled.match(result)) {
      toast.success(`Coupon "${cleanCode}" created successfully!`)
      handleClose()
    } else {
      toast.error(result.payload || 'Failed to create coupon.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/60 shadow-2xl bg-card">
        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-muted/20">
          <DialogHeader className="gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold border border-primary/20">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Create New Coupon
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Configure promo discounts, limits, and product eligibility.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {(validationError || createError) && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError || createError}</span>
            </div>
          )}

          {/* Coupon Code & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Coupon Code *
              </Label>
              <Input
                id="coupon-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. DIWALI50"
                className="font-mono uppercase tracking-wider font-semibold"
                required
              />
              <span className="text-[11px] text-muted-foreground">
                Letters, numbers, uppercase only
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coupon-desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </Label>
              <Input
                id="coupon-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 50% discount on festive packs"
              />
              <span className="text-[11px] text-muted-foreground">
                Optional note for internal reference
              </span>
            </div>
          </div>

          {/* Discount Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Discount Type *
            </Label>
            <div className="grid grid-cols-3 gap-2.5">
              {DISCOUNT_TYPES.map((type) => {
                const Icon = type.icon
                const isSelected = discountType === type.id
                return (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setDiscountType(type.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary'
                        : 'border-border/60 bg-background/50 hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="w-4 h-4" />
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {type.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {type.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Discount Value and Max Uses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="discount-val" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Discount Value * {discountType === 'percentage' ? '(%)' : '(₹)'}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono font-medium">
                  {discountType === 'percentage' ? '%' : '₹'}
                </span>
                <Input
                  id="discount-val"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={discountType === 'percentage' ? '100' : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percentage' ? '25' : '100'}
                  className="pl-8 font-mono"
                  required
                />
              </div>
              <span className="text-[11px] text-muted-foreground">
                {discountType === 'percentage'
                  ? 'Max 100%'
                  : 'Fixed rupee deduction'}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="max-uses" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Max Uses
              </Label>
              <Input
                id="max-uses"
                type="number"
                min="1"
                step="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited (leave empty)"
                className="font-mono"
              />
              <span className="text-[11px] text-muted-foreground">
                Global redemption cap across all users
              </span>
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-1.5">
            <Label htmlFor="expiry-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Expiration Date & Time (Optional)
            </Label>
            <Input
              id="expiry-date"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="text-sm"
            />
            <span className="text-[11px] text-muted-foreground">
              Leave blank if this coupon should never expire
            </span>
          </div>

          {/* Applicable Products */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" />
                Eligible Question Packs
              </Label>
              <button
                type="button"
                onClick={() => setApplicableProducts([])}
                className="text-xs text-primary hover:underline font-medium"
              >
                Reset to All Packs
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {AVAILABLE_PACKS.map((pack) => {
                const isSelected = applicableProducts.includes(pack.code)
                return (
                  <button
                    type="button"
                    key={pack.code}
                    onClick={() => toggleProduct(pack.code)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border/60 bg-background/50 hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <span>{pack.label}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-border/80'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {applicableProducts.length === 0
                ? 'Applies to all packs by default.'
                : `Applies to ${applicableProducts.length} selected pack(s).`}
            </p>
          </div>

          {/* Modal Footer / Buttons */}
          <DialogFooter className="pt-3 border-t border-border/40 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="gap-2 font-medium"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Coupon
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
