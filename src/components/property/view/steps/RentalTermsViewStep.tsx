import { DollarSign, Calendar, Clock } from 'lucide-react'
import type { AssetViewData } from '../AssetViewModal'

interface RentalTermsViewStepProps {
  data: AssetViewData
}

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return null
  return `$${value.toLocaleString()}`
}

function formatDate(dateString: string | null) {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function RentalTermsViewStep({ data }: RentalTermsViewStepProps) {
  const hasRent = data.rent_weekly || data.rent_monthly
  const hasBond = data.bond !== null
  const hasAvailability = data.available_from !== null
  const hasLeaseDuration = data.lease_min_months || data.lease_max_months

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <DollarSign className="h-5 w-5" />
        <p className="text-sm">Pricing and lease terms</p>
      </div>

      {/* Rent Section */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Rent
        </h3>
        {hasRent ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Weekly Rent</div>
              <div className="text-xl font-semibold text-primary">
                {formatCurrency(data.rent_weekly) || <span className="text-muted-foreground text-base font-normal italic">Not specified</span>}
                {data.rent_weekly && <span className="text-sm font-normal text-muted-foreground"> /week</span>}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Monthly Rent</div>
              <div className="text-xl font-semibold">
                {formatCurrency(data.rent_monthly) || <span className="text-muted-foreground text-base font-normal italic">Not specified</span>}
                {data.rent_monthly && <span className="text-sm font-normal text-muted-foreground"> /month</span>}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No rent information specified</p>
        )}
      </div>

      {/* Bond */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium mb-4">Bond / Security Deposit</h3>
        {hasBond ? (
          <div className="text-xl font-semibold">{formatCurrency(data.bond)}</div>
        ) : (
          <p className="text-sm text-muted-foreground italic">Not specified</p>
        )}
      </div>

      {/* Availability */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Availability
        </h3>
        {hasAvailability ? (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Available From</div>
            <div className="text-sm font-medium">
              {formatDate(data.available_from)}
              {data.available_from && new Date(data.available_from) <= new Date() && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Available Now
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">Not specified</p>
        )}
      </div>

      {/* Lease Duration */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Lease Duration
        </h3>
        {hasLeaseDuration ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Minimum</div>
              <div className="text-sm">
                {data.lease_min_months
                  ? `${data.lease_min_months} month${data.lease_min_months !== 1 ? 's' : ''}`
                  : <span className="text-muted-foreground italic">Not specified</span>}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Maximum</div>
              <div className="text-sm">
                {data.lease_max_months
                  ? `${data.lease_max_months} month${data.lease_max_months !== 1 ? 's' : ''}`
                  : <span className="text-muted-foreground italic">Not specified</span>}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">Not specified</p>
        )}
      </div>
    </div>
  )
}
