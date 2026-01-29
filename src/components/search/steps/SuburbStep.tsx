import { MapPin, Loader2 } from 'lucide-react'

interface SuburbStepProps {
  suburbs: string[]
  selectedSuburbs: string[]
  loading: boolean
  onToggle: (suburb: string) => void
}

export default function SuburbStep({ suburbs, selectedSuburbs, loading, onToggle }: SuburbStepProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (suburbs.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No suburbs available</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Properties need to be added with suburb information
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-5 w-5" />
        <p className="text-sm">Which suburbs are you interested in?</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {suburbs.map(suburb => {
          const isSelected = selectedSuburbs.includes(suburb)
          return (
            <button
              key={suburb}
              type="button"
              onClick={() => onToggle(suburb)}
              className={`
                px-4 py-2 rounded-full border text-sm font-medium transition-colors
                ${isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input hover:bg-muted'
                }
              `}
            >
              {suburb}
            </button>
          )
        })}
      </div>

      {selectedSuburbs.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedSuburbs.length} suburb{selectedSuburbs.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  )
}
