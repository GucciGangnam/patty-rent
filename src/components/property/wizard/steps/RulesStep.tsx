import { ClipboardList, Users, PawPrint, Cigarette } from 'lucide-react'
import { type PropertyFormData, type YesNoUnspecified } from '../../../../types/property'

interface RulesStepProps {
  formData: PropertyFormData
  updateFormData: (updates: Partial<PropertyFormData>) => void
}

const YES_NO_OPTIONS: { value: YesNoUnspecified | ''; label: string }[] = [
  { value: '', label: 'Select...' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unspecified', label: 'Unspecified' },
]

export default function RulesStep({ formData, updateFormData }: RulesStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <ClipboardList className="h-5 w-5" />
        <p className="text-sm">Set property rules and restrictions.</p>
      </div>

      <div className="space-y-6">
        {/* Max Occupants */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <label htmlFor="max_occupants" className="block text-sm font-medium mb-1">
                Maximum Occupants
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                The maximum number of people allowed to live in the property.
              </p>
              <input
                id="max_occupants"
                type="number"
                min="1"
                placeholder="e.g., 4"
                value={formData.max_occupants}
                onChange={(e) => updateFormData({ max_occupants: e.target.value })}
                className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Pets Allowed */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <PawPrint className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <label htmlFor="pets_allowed" className="block text-sm font-medium mb-1">
                Pets Allowed
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Are pets permitted at this property?
              </p>
              <select
                id="pets_allowed"
                value={formData.pets_allowed}
                onChange={(e) => updateFormData({ pets_allowed: e.target.value as YesNoUnspecified | '' })}
                className="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {YES_NO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Smokers Allowed */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <Cigarette className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <label htmlFor="smokers_allowed" className="block text-sm font-medium mb-1">
                Smokers Allowed
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Is smoking permitted at this property?
              </p>
              <select
                id="smokers_allowed"
                value={formData.smokers_allowed}
                onChange={(e) => updateFormData({ smokers_allowed: e.target.value as YesNoUnspecified | '' })}
                className="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {YES_NO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
