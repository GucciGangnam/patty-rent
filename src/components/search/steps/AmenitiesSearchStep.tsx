import { Sparkles } from 'lucide-react'
import { AMENITIES, type AmenityKey } from '../../../types/property'

interface AmenitiesSearchStepProps {
  selectedAmenities: AmenityKey[]
  onToggle: (amenity: AmenityKey) => void
}

export default function AmenitiesSearchStep({ selectedAmenities, onToggle }: AmenitiesSearchStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Sparkles className="h-5 w-5" />
        <p className="text-sm">Which amenities are must-haves?</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {AMENITIES.map(amenity => {
          const isSelected = selectedAmenities.includes(amenity.id)
          return (
            <button
              key={amenity.id}
              type="button"
              onClick={() => onToggle(amenity.id)}
              className={`
                px-4 py-2 rounded-full border text-sm font-medium transition-colors
                ${isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input hover:bg-muted'
                }
              `}
            >
              {amenity.label}
            </button>
          )
        })}
      </div>

      {selectedAmenities.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedAmenities.length} amenit{selectedAmenities.length !== 1 ? 'ies' : 'y'} selected
        </p>
      )}
    </div>
  )
}
