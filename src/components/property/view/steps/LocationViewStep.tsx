import { MapPin } from 'lucide-react'
import type { AssetViewData } from '../AssetViewModal'

interface LocationViewStepProps {
  data: AssetViewData
}

function DisplayField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <div className="text-sm">{value || <span className="text-muted-foreground italic">Not specified</span>}</div>
    </div>
  )
}

export default function LocationViewStep({ data }: LocationViewStepProps) {
  const hasLocation = data.address_line_1 || data.city || data.state || data.postcode || data.country

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-5 w-5" />
        <p className="text-sm">Property location details</p>
      </div>

      {!hasLocation ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No location details have been added.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border p-4 space-y-4">
          <DisplayField label="Address Line 1" value={data.address_line_1} />
          <DisplayField label="Address Line 2" value={data.address_line_2} />

          <div className="grid grid-cols-2 gap-4">
            <DisplayField label="City / Suburb" value={data.city} />
            <DisplayField label="Province / State" value={data.state} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DisplayField label="Postcode / ZIP" value={data.postcode} />
            <DisplayField label="Country" value={data.country} />
          </div>

          {/* Full Address Summary */}
          {hasLocation && (
            <div className="pt-4 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground mb-1">Full Address</div>
              <div className="text-sm">
                {[
                  data.address_line_1,
                  data.address_line_2,
                  data.city,
                  data.state,
                  data.postcode,
                  data.country,
                ].filter(Boolean).join(', ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
