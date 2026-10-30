import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import {
  fetchBlogByIdThunk,
  createBlogThunk,
  updateBlogThunk,
} from '@/features/blogs/blogsApi'
import { clearCurrentBlog } from '@/features/blogs/blogsSlice'
import { BlogEditor } from '@/components/blogs/BlogEditor'
import { CoverImageUpload } from '@/components/blogs/CoverImageUpload'
import { DeleteBlogDialog } from '@/components/blogs/DeleteBlogDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  Send,
  Trash2,
  Sparkles,
  Settings2,
  Clock,
  Tag as TagIcon,
  Globe,
  Loader2,
  X,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'

const CATEGORIES = [
  { id: 'vedic-astrology', label: 'Vedic Astrology' },
  { id: 'kundli-doshas', label: 'Kundli & Doshas' },
  { id: 'planetary-transits', label: 'Planetary Transits' },
  { id: 'remedies-gemstones', label: 'Remedies & Gemstones' },
  { id: 'panchang-muhurta', label: 'Panchang & Muhurta' },
  { id: 'jyotish-ai', label: 'Jyotish AI Insights' },
]

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function calculateReadTime(text) {
  if (!text) return 1
  const clean = text.replace(/<[^>]*>?/gm, '')
  const words = clean.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function BlogEditorPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const isEdit = Boolean(id)
  const { currentBlog, loadingBlog, isSubmitting } = useSelector(
    (state) => state.blogs
  )

  // Core Form State
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [isSlugCustomized, setIsSlugCustomized] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [category, setCategory] = useState('vedic-astrology')
  const [status, setStatus] = useState('draft')
  const [readTime, setReadTime] = useState(3)

  // Tags State
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [showSeoSettings, setShowSeoSettings] = useState(false)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Load existing blog when in Edit mode
  useEffect(() => {
    if (isEdit) {
      dispatch(fetchBlogByIdThunk(id))
    } else {
      dispatch(clearCurrentBlog())
      setTitle('')
      setSlug('')
      setIsSlugCustomized(false)
      setExcerpt('')
      setContent('')
      setFeaturedImage('')
      setCategory('vedic-astrology')
      setStatus('draft')
      setTags([])
      setMetaTitle('')
      setMetaDescription('')
    }
  }, [dispatch, id, isEdit])

  // Populate form with current blog details
  useEffect(() => {
    if (isEdit && currentBlog) {
      setTitle(currentBlog.title || '')
      setSlug(currentBlog.slug || '')
      setIsSlugCustomized(true)
      setExcerpt(currentBlog.excerpt || '')
      setContent(currentBlog.content || '')
      setFeaturedImage(currentBlog.featured_image || '')
      setCategory(currentBlog.category || 'vedic-astrology')
      setStatus(currentBlog.status || 'draft')
      setReadTime(currentBlog.read_time_minutes || calculateReadTime(currentBlog.content || ''))
      setTags(Array.isArray(currentBlog.tags) ? currentBlog.tags : [])
      setMetaTitle(currentBlog.meta_title || '')
      setMetaDescription(currentBlog.meta_description || '')
    }
  }, [isEdit, currentBlog])

  // Auto-generate slug from title if not manually edited
  const handleTitleChange = (e) => {
    const nextTitle = e.target.value
    setTitle(nextTitle)
    if (!isSlugCustomized) {
      setSlug(slugify(nextTitle))
    }
  }

  // Handle content updates & auto-update reading time
  const handleContentChange = (newHtml) => {
    setContent(newHtml)
    setReadTime(calculateReadTime(newHtml))
  }

  // Tag Management
  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^[#,]/, '')
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Save handler (Draft vs Publish)
  const handleSave = async (targetStatus) => {
    const cleanTitle = title.trim()
    if (!cleanTitle) {
      toast.error('Article title is required.')
      return
    }

    if (!content.trim() || content === '<p></p>') {
      toast.error('Article content cannot be empty.')
      return
    }

    const payload = {
      title: cleanTitle,
      slug: slug.trim() || slugify(cleanTitle),
      excerpt: excerpt.trim() || undefined,
      content,
      featured_image: featuredImage.trim() || undefined,
      category,
      tags,
      status: targetStatus,
      read_time_minutes: readTime,
      meta_title: metaTitle.trim() || undefined,
      meta_description: metaDescription.trim() || undefined,
    }

    let result
    if (isEdit) {
      result = await dispatch(updateBlogThunk({ id, blogData: payload }))
      if (updateBlogThunk.fulfilled.match(result)) {
        setStatus(targetStatus)
        toast.success(
          targetStatus === 'published'
            ? 'Article published successfully!'
            : 'Draft saved successfully!'
        )
      } else {
        toast.error(result.payload || 'Failed to update article.')
      }
    } else {
      result = await dispatch(createBlogThunk(payload))
      if (createBlogThunk.fulfilled.match(result)) {
        toast.success(
          targetStatus === 'published'
            ? 'Article published successfully!'
            : 'Draft created successfully!'
        )
        const createdId = result.payload?.id
        if (createdId) {
          navigate(`/blogs/edit/${createdId}`, { replace: true })
        } else {
          navigate('/blogs')
        }
      } else {
        toast.error(result.payload || 'Failed to create article.')
      }
    }
  }

  if (isEdit && loadingBlog && !currentBlog) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading article editor...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/blogs')}
            className="rounded-xl gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Hub</span>
          </Button>

          <div className="h-4 w-px bg-border/60 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isEdit ? 'Edit Article' : 'New Article'}
            </span>
            <Badge
              variant="outline"
              className={
                status === 'published'
                  ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                  : 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10'
              }
            >
              {status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {isEdit && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isSubmitting}
              className="rounded-xl gap-1.5"
              title="Delete Article"
            >
              <Trash2 className="size-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSave('draft')}
            className="rounded-xl gap-1.5 border-border/70 hover:bg-muted font-medium"
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSave('published')}
            className="rounded-xl gap-1.5 shadow-xs font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            <span>Publish Article</span>
          </Button>
        </div>
      </div>

      {/* Main Dual-Column Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        {/* Left Column: Focused Writing Experience (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Article Title */}
          <div className="space-y-1">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter your article headline..."
              className="w-full text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 leading-tight focus:ring-0"
              autoFocus={!isEdit}
            />

            {/* Permanent Slug Link Preview */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <span className="font-mono text-muted-foreground/70">japaika.com/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setIsSlugCustomized(true)
                }}
                placeholder="url-slug"
                className="font-mono bg-muted/40 hover:bg-muted/70 px-2 py-0.5 rounded border border-border/50 text-foreground outline-none focus:border-primary text-xs max-w-sm"
              />
            </div>
          </div>

          {/* Excerpt / Teaser Hook */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Summary / Excerpt
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A captivating summary shown on article cards, search results, and social previews..."
              className="w-full rounded-xl border border-border/70 bg-card/60 px-4 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Article Body
              </label>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                <span>{readTime} min estimated read</span>
              </div>
            </div>

            <BlogEditor content={content} onChange={handleContentChange} />
          </div>
        </div>

        {/* Right Column: Article Meta & Publishing Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Cover Image Upload Card */}
          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 shadow-xs space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              Featured Cover Image
            </label>
            <CoverImageUpload value={featuredImage} onChange={setFeaturedImage} />
          </div>

          {/* Taxonomy & Category */}
          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 shadow-xs space-y-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Settings2 className="size-3.5 text-primary" />
              Post Metadata & Category
            </label>

            {/* Category Select */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-foreground">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/70 bg-card px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Interactive Tags */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-foreground flex items-center gap-1">
                <TagIcon className="size-3 text-primary" />
                Tags (press Enter to add)
              </span>

              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="e.g. shani-remedy"
                  className="h-9 text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  className="shrink-0 rounded-xl h-9 px-3"
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>

              {/* Tag Badges */}
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-lg bg-muted/60 px-2 py-1 text-xs text-foreground border border-border/60"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SEO & Meta Tag Accordion */}
          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 shadow-xs space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowSeoSettings((prev) => !prev)}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Globe className="size-3.5 text-primary" />
                Search Engine Optimization (SEO)
              </div>
              <span className="text-xs text-primary font-medium">
                {showSeoSettings ? 'Collapse' : 'Configure'}
              </span>
            </div>

            {showSeoSettings && (
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">Meta Title</span>
                  <Input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || 'Custom SEO title tag...'}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">Meta Description</span>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={excerpt || '150-160 characters summary for Google search snippets...'}
                    className="w-full rounded-xl border border-border/70 bg-card/60 p-2.5 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary resize-none"
                  />
                </div>

                {/* Google Snippet Live Preview */}
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1 text-xs">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Google Preview</p>
                  <p className="text-sky-500 font-medium truncate">
                    {metaTitle || title || 'Article Title'} | Japaika
                  </p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                    https://japaika.com/blog/{slug || 'post-slug'}
                  </p>
                  <p className="text-muted-foreground text-[11px] line-clamp-2">
                    {metaDescription || excerpt || 'Article description snippet will render here...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isEdit && currentBlog && (
        <DeleteBlogDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          blog={currentBlog}
          onSuccess={() => navigate('/blogs')}
        />
      )}
    </div>
  )
}

export default BlogEditorPage
