import { useState } from 'react'
import { Image, Star, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { supabase } from '../../../../lib/supabase'
import type { AssetViewData } from '../AssetViewModal'

interface MediaViewStepProps {
  data: AssetViewData
}

export default function MediaViewStep({ data }: MediaViewStepProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const getImageUrl = (storagePath: string) => {
    const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(storagePath)
    return urlData.publicUrl
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const goToPrevious = () => {
    setLightboxIndex(prev => (prev === 0 ? data.images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setLightboxIndex(prev => (prev === data.images.length - 1 ? 0 : prev + 1))
  }

  if (data.images.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Image className="h-5 w-5" />
          <p className="text-sm">Property photos</p>
        </div>

        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No images have been added to this property.</p>
        </div>
      </div>
    )
  }

  // Sort images by display order, with primary first
  const sortedImages = [...data.images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.display_order - b.display_order
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Image className="h-5 w-5" />
          <p className="text-sm">Property photos</p>
        </div>
        <span className="text-sm text-muted-foreground">
          {data.images.length} image{data.images.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sortedImages.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => openLightbox(index)}
            className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted group focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <img
              src={getImageUrl(image.storage_path)}
              alt={image.caption || `Property image ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {image.is_primary && (
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                <Star className="h-3 w-3" />
                Primary
              </div>
            )}
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xs truncate">{image.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90">
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {data.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[80vh] px-16">
            <img
              src={getImageUrl(sortedImages[lightboxIndex].storage_path)}
              alt={sortedImages[lightboxIndex].caption || `Property image ${lightboxIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {sortedImages[lightboxIndex].caption && (
              <p className="text-white text-center mt-4">{sortedImages[lightboxIndex].caption}</p>
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {lightboxIndex + 1} / {data.images.length}
          </div>
        </div>
      )}
    </div>
  )
}
