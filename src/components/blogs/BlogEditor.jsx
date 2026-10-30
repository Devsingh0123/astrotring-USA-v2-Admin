import { useState, useRef, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Upload,
  Loader2,
  Undo2,
  Redo2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadFileApi } from '@/features/uploads/uploadsApi'
import { BRAND, CLOUDINARY_FOLDERS } from '@/lib/constants'
import { toast } from 'sonner'

export function BlogEditor({ content = '', onChange }) {
  const fileInputRef = useRef(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4 hover:opacity-80 transition-opacity',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 border border-border/60 shadow-xs',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'min-h-[420px] w-full px-6 py-5 text-sm sm:text-base leading-relaxed text-foreground/90 focus:outline-none prose prose-neutral dark:prose-invert max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML())
      }
    },
  })

  // Synchronize incoming content if it changes externally (e.g. on load)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', false)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt(`Enter link URL (e.g. ${BRAND.USER_URL}):`, previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImageUrl = () => {
    const url = window.prompt('Enter image URL (HTTPS):')
    if (url && url.trim()) {
      editor.chain().focus().setImage({ src: url.trim() }).run()
    }
  }

  const handleInlineImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP, GIF).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB.')
      return
    }

    setIsUploadingImage(true)
    const toastId = toast.loading('Uploading article image to Cloudinary...')

    try {
      const uploadedFile = await uploadFileApi(file, CLOUDINARY_FOLDERS.BLOGS)
      const secureUrl = uploadedFile?.secure_url || uploadedFile?.url

      if (secureUrl && editor) {
        editor.chain().focus().setImage({ src: secureUrl }).run()
        toast.success('Image inserted into article.', { id: toastId })
      } else {
        throw new Error('No image URL returned from upload server.')
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to upload image. Please verify Cloudinary configuration.'
      toast.error(message, { id: toastId })
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const wordCount = editor.storage.characterCount
    ? editor.storage.characterCount.words()
    : editor.getText().split(/\s+/).filter(Boolean).length

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden shadow-xs focus-within:border-primary/50 transition-colors">
      {/* Formatting Sticky / Floating Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/50 bg-muted/25 sticky top-0 z-10 backdrop-blur-md">
        {/* Headings */}
        <div className="flex items-center gap-0.5 border-r border-border/60 pr-1 mr-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editor.isActive('paragraph') ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}
            title="Paragraph"
          >
            <Pilcrow className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}
            title="Heading 1"
          >
            <Heading1 className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}
            title="Heading 2"
          >
            <Heading2 className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}
            title="Heading 3"
          >
            <Heading3 className="size-3.5" />
          </Button>
        </div>

        {/* Inline styles: Bold, Italic, Strikethrough, Code */}
        <div className="flex items-center gap-0.5 border-r border-border/60 pr-1 mr-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}
            title="Bold"
          >
            <Bold className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}
            title="Italic"
          >
            <Italic className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}
            title="Strikethrough"
          >
            <Strikethrough className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}
            title="Inline Code"
          >
            <Code className="size-3.5" />
          </Button>
        </div>

        {/* Lists & Blockquote */}
        <div className="flex items-center gap-0.5 border-r border-border/60 pr-1 mr-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}
            title="Bullet List"
          >
            <List className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}
            title="Numbered List"
          >
            <ListOrdered className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}
            title="Blockquote"
          >
            <Quote className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="text-muted-foreground"
            title="Horizontal Divider"
          >
            <Minus className="size-3.5" />
          </Button>
        </div>

        {/* Media & Links */}
        <div className="flex items-center gap-0.5 border-r border-border/60 pr-1 mr-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleInlineImageUpload}
            disabled={isUploadingImage}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={setLink}
            className={editor.isActive('link') ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}
            title="Insert Link"
          >
            <LinkIcon className="size-3.5" />
          </Button>
          {editor.isActive('link') && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="text-muted-foreground hover:text-destructive"
              title="Remove Link"
            >
              <Unlink className="size-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={isUploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Upload Image to Cloudinary & Insert"
          >
            {isUploadingImage ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <Upload className="size-3.5" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={addImageUrl}
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Insert Image by URL"
          >
            <ImageIcon className="size-3.5" />
          </Button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="text-muted-foreground"
            title="Undo"
          >
            <Undo2 className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="text-muted-foreground"
            title="Redo"
          >
            <Redo2 className="size-3.5" />
          </Button>
        </div>

        {/* Right side word counter */}
        <div className="ml-auto text-[11px] font-mono text-muted-foreground px-2 py-0.5">
          {wordCount} words
        </div>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  )
}
