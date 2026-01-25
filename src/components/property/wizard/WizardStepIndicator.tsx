import { Check } from 'lucide-react'
import { WIZARD_STEPS, type WizardStep } from '../../../types/property'

interface WizardStepIndicatorProps {
  currentStep: WizardStep
  onStepClick?: (step: WizardStep) => void
  allClickable?: boolean
}

export default function WizardStepIndicator({ currentStep, onStepClick, allClickable }: WizardStepIndicatorProps) {
  const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep)

  return (
    <nav aria-label="Progress" className="mb-6">
      <ol className="flex items-center justify-between">
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isClickable = (isCompleted || allClickable) && onStepClick && !isCurrent

          return (
            <li key={step.id} className="flex-1 relative">
              {/* Connector line */}
              {index > 0 && (
                <div className="absolute top-4 left-0 right-1/2 -translate-y-1/2 h-0.5">
                  <div
                    className={`h-full transition-colors ${
                      index <= currentIndex ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                </div>
              )}
              {index < WIZARD_STEPS.length - 1 && (
                <div className="absolute top-4 left-1/2 right-0 -translate-y-1/2 h-0.5">
                  <div
                    className={`h-full transition-colors ${
                      index < currentIndex ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                </div>
              )}

              {/* Step indicator */}
              <div className="flex flex-col items-center relative">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-colors z-10
                    ${isCompleted
                      ? 'bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : allClickable
                          ? 'bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80'
                          : 'bg-muted text-muted-foreground'
                    }
                    ${!isClickable && !isCurrent ? 'cursor-default' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </button>
                <span
                  className={`
                    mt-2 text-xs font-medium text-center
                    ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}
                  `}
                >
                  {step.label}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
