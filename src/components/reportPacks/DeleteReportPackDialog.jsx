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
import { deleteReportPackThunk } from '@/features/reportPacks/reportPacksApi'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteReportPackDialog({ open, onOpenChange, pack = null }) {
  const dispatch = useDispatch()
  const { deletingId } = useSelector((state) => state.reportPacks)

  const isDeleting = deletingId === pack?.id

  const handleDelete = async () => {
    if (!pack) return
    const result = await dispatch(deleteReportPackThunk(pack.id))
    if (deleteReportPackThunk.fulfilled.match(result)) {
      toast.success(`Report pack "${pack.name}" has been soft-deleted successfully.`)
      onOpenChange(false)
    } else {
      toast.error(result.payload || 'Failed to delete report pack.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 gap-5 border-border/60 shadow-2xl bg-card">
        <DialogHeader className="gap-2">
          <div className="size-11 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Delete Report Pack
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-foreground">{pack?.name}</strong>{' '}
            {pack?.code && <span className="font-mono">({pack.code})</span>}? This will perform a
            soft-delete, archiving the pack and removing it from the user report store.
          </DialogDescription>
        </DialogHeader>

        {pack && (
          <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Report Credits:</span>
              <span className="font-semibold text-foreground">+{pack.credits} Consultation Reports</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tier:</span>
              <span className="font-semibold capitalize text-foreground">{pack.tier || 'Silver'}</span>
            </div>
            {pack.prices?.INR && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">INR Price:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ₹{pack.prices.INR.offerPrice?.toLocaleString('en-IN')}{' '}
                  <span className="line-through text-muted-foreground text-[11px]">
                    ₹{pack.prices.INR.originalPrice?.toLocaleString('en-IN')}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2 rounded-xl"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Confirm Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
