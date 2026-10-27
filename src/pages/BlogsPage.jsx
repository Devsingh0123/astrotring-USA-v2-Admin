import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchBlogsThunk,
  toggleBlogStatusThunk,
} from '@/features/blogs/blogsApi'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DeleteBlogDialog } from '@/components/blogs/DeleteBlogDialog'
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  FileEdit,
  Archive,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

const STATUS_FILTERS = [
  { label: 'All Blogs', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Archived', value: 'archived' },
]

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'vedic-astrology', label: 'Vedic Astrology' },
  { id: 'kundli-doshas', label: 'Kundli & Doshas' },
  { id: 'planetary-transits', label: 'Planetary Transits' },
  { id: 'remedies-gemstones', label: 'Remedies & Gemstones' },
  { id: 'panchang-muhurta', label: 'Panchang & Muhurta' },
  { id: 'jyotish-ai', label: 'Jyotish AI Insights' },
]

function formatBlogDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getStatusBadge(status) {
  switch (status?.toLowerCase()) {
    case 'published':
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-medium gap-1"
        >
          <CheckCircle2 className="size-3" />
          Published
        </Badge>
      )
    case 'draft':
      return (
        <Badge
          variant="outline"
          className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-medium gap-1"
        >
          <FileEdit className="size-3" />
          Draft
        </Badge>
      )
    case 'archived':
      return (
        <Badge
          variant="outline"
          className="border-slate-500/40 text-muted-foreground bg-muted/40 font-medium gap-1"
        >
          <Archive className="size-3" />
          Archived
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="capitalize">
          {status || 'Unknown'}
        </Badge>
      )
  }
}

export function BlogsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { blogs, pagination, loadingList, togglingStatusId } = useSelector(
    (state) => state.blogs
  )

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loadBlogs = useCallback(() => {
    dispatch(
      fetchBlogsThunk({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        category: categoryFilter,
      })
    )
  }, [dispatch, page, limit, debouncedSearch, statusFilter, categoryFilter])

  useEffect(() => {
    loadBlogs()
  }, [loadBlogs])

  const handleOpenDelete = (e, blog) => {
    e.stopPropagation()
    setBlogToDelete(blog)
    setDeleteDialogOpen(true)
  }

  const handleToggleStatus = async (e, blog) => {
    e.stopPropagation()
    const nextStatus = blog.status === 'published' ? 'draft' : 'published'
    const result = await dispatch(
      toggleBlogStatusThunk({ id: blog.id, status: nextStatus })
    )
    if (toggleBlogStatusThunk.fulfilled.match(result)) {
      toast.success(
        nextStatus === 'published'
          ? `Blog "${blog.title}" is now published.`
          : `Blog "${blog.title}" moved to drafts.`
      )
    } else {
      toast.error(result.payload || 'Failed to update blog status.')
    }
  }

  // Summary Metrics
  const blogList = Array.isArray(blogs) ? blogs : []
  const totalCount = pagination?.total ?? blogList.length
  const publishedCount = blogList.filter((b) => b.status === 'published').length
  const draftCount = blogList.filter((b) => b.status === 'draft').length
  const totalViews = blogList.reduce((acc, b) => acc + (Number(b.views_count) || 0), 0)

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="size-7 text-primary" />
            Blog & Content Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Author and publish Vedic astrology articles, transit forecasts, remedies, and SEO guides.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBlogs}
            disabled={loadingList}
            className="gap-2 h-9.5 px-4 rounded-xl border-border/70 hover:bg-muted font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${loadingList ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/blogs/new')}
            className="gap-2 h-9.5 px-4 rounded-xl shadow-xs font-semibold"
          >
            <Plus className="size-4" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Total Posts</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">{totalCount}</p>
          <p className="text-xs text-muted-foreground">Articles in repository</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Published</span>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {publishedCount}
          </p>
          <p className="text-xs text-muted-foreground">Live & indexable</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Drafts</span>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileEdit className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono">
            {draftCount}
          </p>
          <p className="text-xs text-muted-foreground">Work in progress</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Reader Views</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">{totalViews}</p>
          <p className="text-xs text-muted-foreground">On current page</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search blogs by title, slug, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-background/80 border border-border/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setStatusFilter(f.value)
                  setPage(1)
                }}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors ${
                  statusFilter === f.value
                    ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blogs Data Table */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/60 bg-muted/20">
              <TableHead className="w-[340px]">Article / Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead>Views</TableHead>
              <TableHead className="text-right w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingList ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-12 rounded-xl" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : blogList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <BookOpen className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-semibold text-foreground">No blog articles found</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      {searchInput || statusFilter !== 'all' || categoryFilter !== 'all'
                        ? 'Try modifying your search query or filter selection.'
                        : 'Get started by creating your first Vedic astrology blog post.'}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => navigate('/blogs/new')}
                      className="mt-2 rounded-xl gap-1.5"
                    >
                      <Plus className="size-4" />
                      Write New Article
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              blogList.map((blog) => {
                const isToggling = togglingStatusId === blog.id
                return (
                  <TableRow
                    key={blog.id}
                    onClick={() => navigate(`/blogs/edit/${blog.id}`)}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    {/* Article Thumbnail & Title */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl overflow-hidden shrink-0 border border-border/60 bg-muted/40 flex items-center justify-center">
                          {blog.featured_image ? (
                            <img
                              src={blog.featured_image}
                              alt=""
                              className="size-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <BookOpen className="size-5 text-muted-foreground/60" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate max-w-[260px] sm:max-w-[340px]" title={blog.title}>
                            {blog.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span className="font-mono text-[11px] truncate max-w-[180px]">
                              /{blog.slug}
                            </span>
                            {blog.read_time_minutes > 0 && (
                              <>
                                <span>•</span>
                                <span>{blog.read_time_minutes} min read</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="inline-flex items-center rounded-lg bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground capitalize">
                        {blog.category ? blog.category.replace(/-/g, ' ') : 'General'}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {getStatusBadge(blog.status)}
                    </TableCell>

                    {/* Published Date */}
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-muted-foreground/70" />
                        <span>{formatBlogDate(blog.published_at || blog.created_at || blog.createdAt)}</span>
                      </div>
                    </TableCell>

                    {/* Views Count */}
                    <TableCell className="font-mono text-xs text-foreground">
                      {blog.views_count ?? 0}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Status Toggle Quick Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isToggling}
                          onClick={(e) => handleToggleStatus(e, blog)}
                          className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg"
                          title={blog.status === 'published' ? 'Move to Draft' : 'Publish Article'}
                        >
                          {blog.status === 'published' ? 'Draft' : 'Publish'}
                        </Button>

                        {/* Edit Button */}
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => navigate(`/blogs/edit/${blog.id}`)}
                          className="size-8 rounded-lg border-border/70 text-muted-foreground hover:text-primary hover:border-primary/40"
                          title="Edit article"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={(e) => handleOpenDelete(e, blog)}
                          className="size-8 rounded-lg border-border/70 text-muted-foreground hover:text-destructive hover:border-destructive/40"
                          title="Delete article"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-t border-border/50 bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
              className="bg-card border border-border/70 rounded-lg px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-muted-foreground/80">
              Showing <strong className="text-foreground font-mono">{blogList.length}</strong> of{' '}
              <strong className="text-foreground font-mono">{totalCount}</strong> articles
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span>
              Page <strong className="text-foreground font-mono">{pagination?.page ?? page}</strong> of{' '}
              <strong className="text-foreground font-mono">{pagination?.totalPages || 1}</strong>
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg border-border/70"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loadingList}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg border-border/70"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (pagination?.totalPages || 1) || loadingList}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteBlogDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        blog={blogToDelete}
        onSuccess={loadBlogs}
      />
    </div>
  )
}

export default BlogsPage
