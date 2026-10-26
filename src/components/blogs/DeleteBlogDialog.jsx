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
import { deleteBlogThunk } from '@/features/blogs/blogsApi'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteBlogDialog({ open, onOpenChange, blog, onSuccess }) {
  const dispatch = useDispatch()
  const { deletingId } = useSelector((state) => state.blogs)

  const isDeleting = deletingId === blog?.id

  const handleClose = () => {
    if (isDeleting) return
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (!blog) return

    const result = await dispatch(deleteBlogThunk(blog.id))
    if (deleteBlogThunk.fulfilled.match(result)) {
      toast.success(`Blog "${blog.title}" deleted successfully.`)
      handleClose()
      if (onSuccess) onSuccess()
    } else {
      toast.error(result.payload || 'Failed to delete blog post.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Delete Blog Post
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                This action will move the blog post to the trash archive.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {blog && (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1.5 text-xs">
            <div className="font-semibold text-foreground truncate">{blog.title}</div>
            <div className="font-mono text-[11px] text-muted-foreground truncate">
              Slug: {blog.slug}
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isDeleting}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-xl gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Blog'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
