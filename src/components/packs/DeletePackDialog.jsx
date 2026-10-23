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
import { deletePackThunk } from '@/features/packs/packsApi'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeletePackDialog({ open, onOpenChange, pack = null }) {
  const dispatch = useDispatch()
  const { deletingId } = useSelector((state) => state.packs)

  const isDeleting = deletingId === pack?.id

  const handleDelete = async () => {
    if (!pack) return
    const result = await dispatch(deletePackThunk(pack.id))
    if (deletePackThunk.fulfilled.match(result)) {
      toast.success(`Pack "${pack.name}" soft-deleted successfully.`)
      onOpenChange(false)
    } else {
      toast.error(result.payload || 'Failed to delete question pack.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 gap-5 border-border/60 shadow-2xl bg-card">
        <DialogHeader className="gap-2">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Delete Question Pack
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-foreground">{pack?.name}</strong>{' '}
            {pack?.code && <span className="font-mono">({pack.code})</span>}? This will perform a
            soft-delete, archiving the pack and removing it from the storefront.
          </DialogDescription>
        </DialogHeader>

        {pack && (
          <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Credits:</span>
              <span className="font-semibold text-foreground">+{pack.credits} Credits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tier:</span>
              <span className="font-semibold capitalize text-foreground">{pack.tier || 'Silver'}</span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Confirm Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
