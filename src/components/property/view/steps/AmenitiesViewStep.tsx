import { Sparkles, Check } from 'lucide-react'
import { AMENITIES, type AmenityKey } from '../../../../types/property'
import type { AssetViewData } from '../AssetViewModal'

interface AmenitiesViewStepProps {
  data: AssetViewData
}

// Group amenities by category
const groupedAmenities = AMENITIES.reduce((acc, amenity) => {
  if (!acc[amenity.category]) {
    acc[amenity.category] = []
  }
  acc[amenity.category].push(amenity)
  return acc
}, {} as Record<string, typeof AMENITIES>)

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

// Helper to check if an amenity is selected from the data
function isAmenitySelected(data: AssetViewData, amenityId: AmenityKey): boolean {
  const key = `amenity_${amenityId}` as keyof AssetViewData
  return data[key] === true
}

export default function AmenitiesViewStep({ data }: AmenitiesViewStepProps) {
  // Count selected amenities
  const selectedCount = AMENITIES.filter(a => isAmenitySelected(data, a.id)).length
  const hasAmenities = selectedCount > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-5 w-5" />
          <p className="text-sm">Property amenities and features</p>
        </div>
        {hasAmenities && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {selectedCount} selected
          </span>
        )}
      </div>

      {!hasAmenities ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No amenities have been selected for this property.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categoryOrder.map(category => {
            const amenities = groupedAmenities[category]
            if (!amenities) return null

            // Filter to only show selected amenities in this category
            const selectedInCategory = amenities.filter(a => isAmenitySelected(data, a.id))
            if (selectedInCategory.length === 0) return null

            return (
              <div key={category}>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                  {categoryLabels[category]}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedInCategory.map(amenity => (
                    <div
                      key={amenity.id}
                      className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm"
                    >
                      <div className="h-4 w-4 rounded border bg-primary border-primary flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span className="truncate">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
