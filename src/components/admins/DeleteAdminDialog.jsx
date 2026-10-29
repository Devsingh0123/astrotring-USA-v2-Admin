import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'

export function DeleteAdminDialog({
  open,
  onOpenChange,
  admin,
  onConfirm,
  loading = false,
}) {
  if (!admin) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full p-6 space-y-4 border-border/80 shadow-2xl bg-card">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 border border-destructive/20">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Delete Administrator
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Confirm removal of staff administrator access.
            </DialogDescription>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5 text-muted-foreground">
          <p>
            Are you sure you want to remove administrator{' '}
            <strong className="text-foreground">{admin.email}</strong> ({admin.name})?
          </p>
          <p className="text-[11px] text-destructive">
            This account will lose all administrative dashboard access immediately.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl gap-2 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Administrator</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
