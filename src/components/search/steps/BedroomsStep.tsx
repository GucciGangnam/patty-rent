import { Bed } from 'lucide-react'
import { BEDROOM_OPTIONS } from '../../../types/search'

interface BedroomsStepProps {
  selectedBedrooms: number[]
  onToggle: (bedrooms: number) => void
}

export default function BedroomsStep({ selectedBedrooms, onToggle }: BedroomsStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Bed className="h-5 w-5" />
        <p className="text-sm">How many bedrooms do you need?</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {BEDROOM_OPTIONS.map(option => {
          const isSelected = selectedBedrooms.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={`
                px-6 py-3 rounded-full border text-sm font-medium transition-colors min-w-[60px]
                ${isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input hover:bg-muted'
                }
              `}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {selectedBedrooms.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedBedrooms.length} option{selectedBedrooms.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  )
}
