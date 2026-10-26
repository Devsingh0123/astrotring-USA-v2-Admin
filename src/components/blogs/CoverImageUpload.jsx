import { useState, useRef } from 'react'
import { Image as ImageIcon, Upload, X, Link as LinkIcon, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { uploadFileApi } from '@/features/uploads/uploadsApi'
import { toast } from 'sonner'

export function CoverImageUpload({ value, onChange }) {
  const [isUrlMode, setIsUrlMode] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP, GIF).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB.')
      return
    }

    setIsUploading(true)
    const toastId = toast.loading('Uploading cover image to Cloudinary...')

    try {
      const uploadedFile = await uploadFileApi(file, 'astrotring/blogs')
      const secureUrl = uploadedFile?.secure_url || uploadedFile?.url

      if (secureUrl && onChange) {
        onChange(secureUrl)
        toast.success('Cover image uploaded to Cloudinary.', { id: toastId })
      } else {
        throw new Error('No image URL returned from upload server.')
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to upload image. Please check Cloudinary configuration.'
      toast.error(message, { id: toastId })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
      toast.error('Please enter a valid HTTP or HTTPS image URL.')
      return
    }
    if (onChange) {
      onChange(urlInput.trim())
      setIsUrlMode(false)
      setUrlInput('')
      toast.success('Cover image URL applied.')
    }
  }

  const handleRemove = () => {
    if (onChange) {
      onChange('')
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />

      {value ? (
        <div className="relative group overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-xs max-h-[300px]">
          <img
            src={value}
            alt="Cover preview"
            className="w-full h-[220px] object-cover transition-transform duration-300 group-hover:scale-102"
            onError={(e) => {
              e.currentTarget.src =
                'https://placehold.co/1200x630/101626/F59E0B?text=Cover+Image+Error'
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="bg-background/90 hover:bg-background text-foreground rounded-xl"
            >
              {isUploading ? (
                <Loader2 className="size-3.5 mr-1 animate-spin" />
              ) : (
                <Upload className="size-3.5 mr-1" />
              )}
              Change
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isUploading}
              onClick={handleRemove}
              className="rounded-xl"
            >
              <X className="size-3.5 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : isUrlMode ? (
        <div className="p-4 rounded-2xl border border-border/70 bg-card/50 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Enter Image Web URL</span>
            <button
              type="button"
              onClick={() => setIsUrlMode(false)}
              className="hover:text-foreground"
            >
              Cancel
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="text-xs"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              onClick={handleApplyUrl}
              className="shrink-0 rounded-xl"
            >
              <Check className="size-4 mr-1" />
              Apply
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors rounded-2xl p-6 bg-card/30 text-center">
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center z-10 rounded-2xl">
              <Loader2 className="size-6 text-primary animate-spin mb-2" />
              <p className="text-xs font-medium text-foreground">Uploading to Cloudinary...</p>
            </div>
          )}

          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2.5">
            <ImageIcon className="size-5" />
          </div>
          <p className="text-xs font-semibold text-foreground">Upload Cover Image</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
            Recommended size: 1200x630px. PNG, JPG, or WEBP up to 10MB.
          </p>

          <div className="flex items-center gap-2 mt-3.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl gap-1.5"
            >
              <Upload className="size-3.5" />
              Browse Computer
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploading}
              onClick={() => setIsUrlMode(true)}
              className="rounded-xl gap-1.5 text-muted-foreground"
            >
              <LinkIcon className="size-3.5" />
              Paste URL
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
