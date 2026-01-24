import { Image } from 'lucide-react'
import ImageUploader from '../ImageUploader'
import { type PropertyFormData, type LocalPropertyImage } from '../../../../types/property'

interface MediaStepProps {
  formData: PropertyFormData
  updateFormData: (updates: Partial<PropertyFormData>) => void
}

export default function MediaStep({ formData, updateFormData }: MediaStepProps) {
  const handleImagesChange = (images: LocalPropertyImage[]) => {
    updateFormData({ images })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Image className="h-5 w-5" />
        <p className="text-sm">Add photos of your property. High quality images help attract tenants.</p>
      </div>

      <ImageUploader
        images={formData.images}
        onImagesChange={handleImagesChange}
        maxImages={20}
      />

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="text-sm font-medium mb-2">Tips for great property photos</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Use natural lighting when possible</li>
          <li>• Capture each room from corner angles to show full space</li>
          <li>• Include exterior shots and outdoor areas</li>
          <li>• Keep rooms tidy and decluttered</li>
          <li>• Set the most attractive image as primary</li>
        </ul>
      </div>
    </div>
  )
}
