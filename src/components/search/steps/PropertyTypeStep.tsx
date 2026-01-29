import { Building2, Check } from 'lucide-react'
import { PROPERTY_TYPE_LABELS, type PropertyType } from '../../../types/property'

const PROPERTY_TYPES = Object.entries(PROPERTY_TYPE_LABELS) as [PropertyType, string][]

interface PropertyTypeStepProps {
  selectedTypes: PropertyType[]
  elevatorRequired: boolean
  onToggleType: (type: PropertyType) => void
  onToggleElevator: (required: boolean) => void
}

export default function PropertyTypeStep({
  selectedTypes,
  elevatorRequired,
  onToggleType,
  onToggleElevator,
}: PropertyTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-5 w-5" />
          <p className="text-sm">What type of property are you looking for?</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {PROPERTY_TYPES.map(([type, label]) => {
            const isSelected = selectedTypes.includes(type)
            return (
              <button
                key={type}
                type="button"
                onClick={() => onToggleType(type)}
                className={`
                  px-4 py-2 rounded-full border text-sm font-medium transition-colors
                  ${isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input hover:bg-muted'
                  }
                `}
              >
                {label}
              </button>
            )
          })}
        </div>

        {selectedTypes.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {selectedTypes.length} type{selectedTypes.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      <div className="border-t border-border pt-6">
        <button
          type="button"
          onClick={() => onToggleElevator(!elevatorRequired)}
          className="flex items-center gap-3 w-full text-left"
        >
          <div
            className={`
              h-5 w-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors
              ${elevatorRequired
                ? 'bg-primary border-primary'
                : 'border-input hover:border-muted-foreground'
              }
            `}
          >
            {elevatorRequired && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
          </div>
          <div>
            <span className="text-sm font-medium">Elevator required</span>
            <p className="text-xs text-muted-foreground">
              Only show properties with elevator access
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}
