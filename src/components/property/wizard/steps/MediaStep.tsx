import { useCallback } from 'react'
import { Image, X, Star, GripVertical, Trash2 } from 'lucide-react'
import ImageUploader from '../ImageUploader'
import {
  type PropertyFormData,
  type LocalPropertyImage,
  type ExistingPropertyImage,
} from '../../../../types/property'

interface MediaStepProps {
  formData: PropertyFormData
  updateFormData: (updates: Partial<PropertyFormData>) => void
  existingImages?: ExistingPropertyImage[]
  onExistingImagesChange?: (images: ExistingPropertyImage[]) => void
}

export default function MediaStep({
  formData,
  updateFormData,
  existingImages = [],
  onExistingImagesChange,
}: MediaStepProps) {
  // Get active (non-deleted) existing images
  const activeExistingImages = existingImages.filter(img => !img.markedForDeletion)

  // Calculate total image count for limits
  const totalImages = activeExistingImages.length + formData.images.length
  const maxImages = 20
  const maxNewImages = maxImages - activeExistingImages.length

  // Check if any image (existing or new) is set as primary
  const hasAnyPrimary =
    activeExistingImages.some(img => img.is_primary) ||
    formData.images.some(img => img.is_primary)

  const handleNewImagesChange = useCallback((images: LocalPropertyImage[]) => {
    // If no primary image exists and this is the first new image, make it primary
    if (!hasAnyPrimary && images.length > 0 && !images.some(img => img.is_primary)) {
      images[0].is_primary = true
    }
    updateFormData({ images })
  }, [hasAnyPrimary, updateFormData])

  const handleExistingImageDelete = useCallback((imageId: string) => {
    if (!onExistingImagesChange) return

    const imageToDelete = existingImages.find(img => img.id === imageId)
    const wasPrimary = imageToDelete?.is_primary

    const updatedImages = existingImages.map(img =>
      img.id === imageId ? { ...img, markedForDeletion: true, is_primary: false } : img
    )

    // If deleted image was primary, assign new primary
    if (wasPrimary) {
      const remainingActive = updatedImages.filter(img => !img.markedForDeletion)
      if (remainingActive.length > 0) {
        remainingActive[0].is_primary = true
      } else if (formData.images.length > 0) {
        // Set first new image as primary
        const newImages = formData.images.map((img, index) => ({
          ...img,
          is_primary: index === 0,
        }))
        updateFormData({ images: newImages })
      }
    }

    onExistingImagesChange(updatedImages)
  }, [existingImages, formData.images, onExistingImagesChange, updateFormData])

  const handleExistingImageRestore = useCallback((imageId: string) => {
    if (!onExistingImagesChange) return

    const updatedImages = existingImages.map(img =>
      img.id === imageId ? { ...img, markedForDeletion: false } : img
    )

    onExistingImagesChange(updatedImages)
  }, [existingImages, onExistingImagesChange])

  const handleSetExistingPrimary = useCallback((imageId: string) => {
    if (!onExistingImagesChange) return

    // Clear primary from all existing images
    const updatedExisting = existingImages.map(img => ({
      ...img,
      is_primary: img.id === imageId,
    }))

    // Clear primary from all new images
    const updatedNew = formData.images.map(img => ({
      ...img,
      is_primary: false,
    }))

    onExistingImagesChange(updatedExisting)
    updateFormData({ images: updatedNew })
  }, [existingImages, formData.images, onExistingImagesChange, updateFormData])

  const handleSetNewPrimary = useCallback((imageId: string) => {
    if (!onExistingImagesChange) return

    // Clear primary from all existing images
    const updatedExisting = existingImages.map(img => ({
      ...img,
      is_primary: false,
    }))

    // Set primary on selected new image
    const updatedNew = formData.images.map(img => ({
      ...img,
      is_primary: img.id === imageId,
    }))

    onExistingImagesChange(updatedExisting)
    updateFormData({ images: updatedNew })
  }, [existingImages, formData.images, onExistingImagesChange, updateFormData])

  const handleExistingCaptionChange = useCallback((imageId: string, caption: string) => {
    if (!onExistingImagesChange) return

    const updatedImages = existingImages.map(img =>
      img.id === imageId ? { ...img, caption } : img
    )
    onExistingImagesChange(updatedImages)
  }, [existingImages, onExistingImagesChange])

  // Check for deleted images count
  const deletedCount = existingImages.filter(img => img.markedForDeletion).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Image className="h-5 w-5" />
        <p className="text-sm">Add photos of your property. High quality images help attract tenants.</p>
      </div>

      {/* Existing Images Section (Edit Mode) */}
      {existingImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Current Images</h4>
            <span className="text-xs text-muted-foreground">
              {activeExistingImages.length} image{activeExistingImages.length !== 1 ? 's' : ''}
              {deletedCount > 0 && (
                <span className="text-destructive ml-1">
                  ({deletedCount} will be removed)
                </span>
              )}
            </span>
          </div>

          <div className="space-y-3">
            {existingImages.map((image) => (
              <div
                key={image.id}
                className={`
                  flex gap-3 p-3 rounded-lg border-2 transition-all bg-background
                  ${image.markedForDeletion
                    ? 'border-destructive/50 opacity-60'
                    : image.is_primary
                      ? 'border-primary'
                      : 'border-border'
                  }
                `}
              >
                {/* Drag Handle Placeholder */}
                <div className="flex items-center text-muted-foreground">
                  <GripVertical className="h-5 w-5 opacity-30" />
                </div>

                {/* Image Preview */}
                <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
                  <img
                    src={image.url}
                    alt="Property"
                    className={`w-full h-full object-cover ${image.markedForDeletion ? 'grayscale' : ''}`}
                  />
                  {image.is_primary && !image.markedForDeletion && (
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                      Primary
                    </div>
                  )}
                  {image.markedForDeletion && (
                    <div className="absolute inset-0 flex items-center justify-center bg-destructive/20">
                      <Trash2 className="h-6 w-6 text-destructive" />
                    </div>
                  )}
                </div>

                {/* Caption and Actions */}
                <div className="flex-1 flex flex-col min-w-0">
                  {image.markedForDeletion ? (
                    <div className="flex-1 flex items-center">
                      <p className="text-sm text-muted-foreground">This image will be deleted when you save</p>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Add a caption (e.g., Front view, Master bedroom)"
                      value={image.caption}
                      onChange={(e) => handleExistingCaptionChange(image.id, e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {image.markedForDeletion ? (
                      <button
                        type="button"
                        onClick={() => handleExistingImageRestore(image.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs text-primary hover:bg-primary/10 transition-colors"
                      >
                        Undo delete
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSetExistingPrimary(image.id)}
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
                          onClick={() => handleExistingImageDelete(image.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <X className="h-3 w-3" />
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images Upload Section */}
      <div className="space-y-4">
        {existingImages.length > 0 && (
          <h4 className="text-sm font-medium">Add New Images</h4>
        )}

        <ImageUploader
          images={formData.images}
          onImagesChange={handleNewImagesChange}
          maxImages={maxNewImages}
          onSetPrimary={onExistingImagesChange ? handleSetNewPrimary : undefined}
        />
      </div>

      {totalImages > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Total: {totalImages} / {maxImages} images
        </p>
      )}

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="text-sm font-medium mb-2">Tips for great property photos</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>* Use natural lighting when possible</li>
          <li>* Capture each room from corner angles to show full space</li>
          <li>* Include exterior shots and outdoor areas</li>
          <li>* Keep rooms tidy and decluttered</li>
          <li>* Set the most attractive image as primary</li>
        </ul>
      </div>
    </div>
  )
}
