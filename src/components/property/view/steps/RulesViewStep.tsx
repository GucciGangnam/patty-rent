import { ClipboardList, Users, PawPrint, Cigarette, Check, X, HelpCircle } from 'lucide-react'
import type { AssetViewData } from '../AssetViewModal'

interface RulesViewStepProps {
  data: AssetViewData
}

function RuleIndicator({ value }: { value: string | null }) {
  if (!value || value === 'unspecified') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <HelpCircle className="h-5 w-5" />
        <span>Unspecified</span>
      </div>
    )
  }

  if (value === 'yes') {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-3 w-3" />
        </div>
        <span>Yes</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-red-600">
      <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
        <X className="h-3 w-3" />
      </div>
      <span>No</span>
    </div>
  )
}

export default function RulesViewStep({ data }: RulesViewStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <ClipboardList className="h-5 w-5" />
        <p className="text-sm">Property rules and restrictions</p>
      </div>

      {/* Max Occupants */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium mb-1">Maximum Occupants</div>
            <p className="text-xs text-muted-foreground mb-3">
              The maximum number of people allowed to live in the property.
            </p>
            <div className="text-lg font-semibold">
              {data.max_occupants
                ? `${data.max_occupants} ${data.max_occupants === 1 ? 'person' : 'people'}`
                : <span className="text-muted-foreground text-base font-normal italic">Not specified</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Pets Allowed */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-start gap-3">
          <PawPrint className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium mb-1">Pets Allowed</div>
            <p className="text-xs text-muted-foreground mb-3">
              Are pets permitted at this property?
            </p>
            <RuleIndicator value={data.pets_allowed} />
          </div>
        </div>
      </div>

      {/* Smokers Allowed */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-start gap-3">
          <Cigarette className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium mb-1">Smokers Allowed</div>
            <p className="text-xs text-muted-foreground mb-3">
              Is smoking permitted at this property?
            </p>
            <RuleIndicator value={data.smokers_allowed} />
          </div>
        </div>
      </div>
    </div>
  )
}
