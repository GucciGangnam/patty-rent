import { SEARCH_STEPS, type SearchStep } from '../../types/search'

interface SearchStepIndicatorProps {
  currentStep: SearchStep
  currentStepIndex: number
}

export default function SearchStepIndicator({ currentStep, currentStepIndex }: SearchStepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {SEARCH_STEPS.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = index < currentStepIndex

        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={`
                h-2.5 w-2.5 rounded-full transition-colors
                ${isActive
                  ? 'bg-primary'
                  : isCompleted
                    ? 'bg-primary/50'
                    : 'bg-muted-foreground/30'
                }
              `}
            />
            {index < SEARCH_STEPS.length - 1 && (
              <div
                className={`
                  h-0.5 w-6 transition-colors
                  ${isCompleted ? 'bg-primary/50' : 'bg-muted-foreground/30'}
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
