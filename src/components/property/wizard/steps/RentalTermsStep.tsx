import { DollarSign, Calendar, Clock } from 'lucide-react'
import { type PropertyFormData } from '../../../../types/property'

interface RentalTermsStepProps {
  formData: PropertyFormData
  updateFormData: (updates: Partial<PropertyFormData>) => void
  currencySymbol?: string
}

export default function RentalTermsStep({ formData, updateFormData, currencySymbol = '$' }: RentalTermsStepProps) {
  // Auto-calculate monthly rent from weekly (weekly * 52 / 12)
  const handleWeeklyChange = (value: string) => {
    updateFormData({ rent_weekly: value })
    if (value) {
      const weekly = parseFloat(value)
      if (!isNaN(weekly)) {
        const monthly = Math.round((weekly * 52) / 12)
        updateFormData({ rent_monthly: monthly.toString() })
      }
    }
  }

  // Auto-calculate weekly rent from monthly (monthly * 12 / 52)
  const handleMonthlyChange = (value: string) => {
    updateFormData({ rent_monthly: value })
    if (value) {
      const monthly = parseFloat(value)
      if (!isNaN(monthly)) {
        const weekly = Math.round((monthly * 12) / 52)
        updateFormData({ rent_weekly: weekly.toString() })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <DollarSign className="h-5 w-5" />
        <p className="text-sm">Set pricing and lease terms for this property.</p>
      </div>

      <div className="space-y-6">
        {/* Rent Section */}
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Rent
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rent_weekly" className="block text-sm font-medium mb-1.5">
                Weekly Rent
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
                <input
                  id="rent_weekly"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={formData.rent_weekly}
                  onChange={(e) => handleWeeklyChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label htmlFor="rent_monthly" className="block text-sm font-medium mb-1.5">
                Monthly Rent
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
                <input
                  id="rent_monthly"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={formData.rent_monthly}
                  onChange={(e) => handleMonthlyChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Entering weekly rent will auto-calculate monthly and vice versa.
          </p>
        </div>

        {/* Bond */}
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium mb-4">Bond / Security Deposit</h3>
          <div className="relative w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
            <input
              id="bond"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={formData.bond}
              onChange={(e) => updateFormData({ bond: e.target.value })}
              className="w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Availability */}
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Availability
          </h3>
          <div>
            <label htmlFor="available_from" className="block text-sm font-medium mb-1.5">
              Available From
            </label>
            <div className="flex items-center gap-3">
              <input
                id="available_from"
                type="date"
                value={formData.available_from}
                onChange={(e) => updateFormData({ available_from: e.target.value })}
                className="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => updateFormData({ available_from: new Date().toISOString().split('T')[0] })}
                className="px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
              >
                Available now
              </button>
            </div>
          </div>
        </div>

        {/* Lease Duration */}
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Lease Duration
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="lease_min_months" className="block text-sm font-medium mb-1.5">
                Minimum (months)
              </label>
              <input
                id="lease_min_months"
                type="number"
                min="1"
                placeholder="e.g., 6"
                value={formData.lease_min_months}
                onChange={(e) => updateFormData({ lease_min_months: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="lease_max_months" className="block text-sm font-medium mb-1.5">
                Maximum (months)
              </label>
              <input
                id="lease_max_months"
                type="number"
                min="1"
                placeholder="e.g., 12"
                value={formData.lease_max_months}
                onChange={(e) => updateFormData({ lease_max_months: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
