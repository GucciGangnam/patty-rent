import { useRef, useCallback } from 'react'
import { Upload, X, Star, GripVertical } from 'lucide-react'
import { type LocalPropertyImage } from '../../../types/property'

interface ImageUploaderProps {
  images: LocalPropertyImage[]
  onImagesChange: (images: LocalPropertyImage[]) => void
  maxImages?: number
  onSetPrimary?: (imageId: string) => void
}

export default function ImageUploader({ images, onImagesChange, maxImages = 20, onSetPrimary }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: LocalPropertyImage[] = []
    const startOrder = images.length

    Array.from(files).forEach((file, index) => {
      if (images.length + newImages.length >= maxImages) return
      if (!file.type.startsWith('image/')) return

      newImages.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        display_order: startOrder + index,
        is_primary: images.length === 0 && index === 0,
        caption: '',
      })
    })

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages])
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [images, maxImages, onImagesChange])

  const handleRemoveImage = useCallback((imageId: string) => {
    const newImages = images.filter(img => img.id !== imageId)

    // If removed image was primary, set first remaining as primary
    if (newImages.length > 0 && !newImages.some(img => img.is_primary)) {
      newImages[0].is_primary = true
    }

    // Re-order
    newImages.forEach((img, index) => {
      img.display_order = index
    })

    onImagesChange(newImages)
  }, [images, onImagesChange])

  const handleSetPrimary = useCallback((imageId: string) => {
    // If external handler is provided (edit mode), use it
    if (onSetPrimary) {
      onSetPrimary(imageId)
      return
    }
    // Otherwise, handle internally
    const newImages = images.map(img => ({
      ...img,
      is_primary: img.id === imageId,
    }))
    onImagesChange(newImages)
  }, [images, onImagesChange, onSetPrimary])

  const handleCaptionChange = useCallback((imageId: string, caption: string) => {
    const newImages = images.map(img =>
      img.id === imageId ? { ...img, caption } : img
    )
    onImagesChange(newImages)
  }, [images, onImagesChange])

  const handleDragStart = useCallback((index: number) => {
    dragItem.current = index
  }, [])

  const handleDragEnter = useCallback((index: number) => {
    dragOverItem.current = index
  }, [])

  const handleDragEnd = useCallback(() => {
    if (dragItem.current === null || dragOverItem.current === null) return
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null
      dragOverItem.current = null
      return
    }

    const newImages = [...images]
    const draggedItem = newImages[dragItem.current]
    newImages.splice(dragItem.current, 1)
    newImages.splice(dragOverItem.current, 0, draggedItem)

    // Update display order
    newImages.forEach((img, index) => {
      img.display_order = index
    })

    onImagesChange(newImages)
    dragItem.current = null
    dragOverItem.current = null
  }, [images, onImagesChange])

  const canAddMore = images.length < maxImages

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={() => canAddMore && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${canAddMore
            ? 'border-border hover:border-primary/50 cursor-pointer'
            : 'border-muted cursor-not-allowed opacity-50'
          }
        `}
      >
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">
          {canAddMore ? 'Click to upload images' : 'Maximum images reached'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {images.length} / {maxImages} images
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Image List */}
      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`
                flex gap-3 p-3 rounded-lg border-2 transition-colors bg-background
                ${image.is_primary ? 'border-primary' : 'border-border'}
                cursor-move
              `}
            >
              {/* Drag Handle */}
              <div className="flex items-center text-muted-foreground">
                <GripVertical className="h-5 w-5" />
              </div>

              {/* Image Preview */}
              <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
                <img
                  src={image.preview}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {image.is_primary && (
                  <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                    Primary
                  </div>
                )}
              </div>

              {/* Caption and Actions */}
              <div className="flex-1 flex flex-col min-w-0">
                <input
                  type="text"
                  placeholder="Add a caption (e.g., Front view, Master bedroom)"
                  value={image.caption}
                  onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSetPrimary(image.id)
                    }}
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors
                      ${image.is_primary
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <Star className="h-3 w-3" fill={image.is_primary ? 'currentColor' : 'none'} />
                    {image.is_primary ? 'Primary' : 'Set as primary'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveImage(image.id)
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <p className="text-xs text-muted-foreground text-center">
          Drag images to reorder.
        </p>
      )}
    </div>
  )
}
