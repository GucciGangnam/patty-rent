import { Sparkles, Check } from 'lucide-react'
import { AMENITIES, type PropertyFormData } from '../../../../types/property'

interface AmenitiesStepProps {
  formData: PropertyFormData
  updateFormData: (updates: Partial<PropertyFormData>) => void
}

// Group amenities by category
const groupedAmenities = AMENITIES.reduce((acc, amenity) => {
  if (!acc[amenity.category]) {
    acc[amenity.category] = []
  }
  acc[amenity.category].push(amenity)
  return acc
}, {} as Record<string, typeof AMENITIES[number][]>)

const categoryLabels: Record<string, string> = {
  climate: 'Climate Control',
  kitchen: 'Kitchen',
  interior: 'Interior',
  bathroom: 'Bathroom',
  outdoor: 'Outdoor',
  facilities: 'Facilities',
  parking: 'Parking',
  security: 'Security',
  utilities: 'Utilities',
}

const categoryOrder = [
  'climate',
  'kitchen',
  'interior',
  'bathroom',
  'outdoor',
  'facilities',
  'parking',
  'security',
  'utilities',
]

export default function AmenitiesStep({ formData, updateFormData }: AmenitiesStepProps) {
  const toggleAmenity = (amenityId: string) => {
    const current = formData.amenities
    const updated = current.includes(amenityId)
      ? current.filter(id => id !== amenityId)
      : [...current, amenityId]
    updateFormData({ amenities: updated })
  }

  const selectedCount = formData.amenities.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-5 w-5" />
          <p className="text-sm">Select the amenities and features available at this property.</p>
        </div>
        {selectedCount > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {selectedCount} selected
          </span>
        )}
      </div>

      <div className="space-y-6">
        {categoryOrder.map(category => {
          const amenities = groupedAmenities[category]
          if (!amenities) return null

          return (
            <div key={category}>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                {categoryLabels[category]}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {amenities.map(amenity => {
                  const isSelected = formData.amenities.includes(amenity.id)
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`
                        flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-left transition-colors
                        ${isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-input hover:bg-muted'
                        }
                      `}
                    >
                      <div
                        className={`
                          h-4 w-4 rounded border flex items-center justify-center flex-shrink-0
                          ${isSelected
                            ? 'bg-primary border-primary'
                            : 'border-input'
                          }
                        `}
                      >
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className="truncate">{amenity.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
