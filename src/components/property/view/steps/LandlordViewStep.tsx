import { User, Phone } from 'lucide-react'
import type { AssetViewData } from '../AssetViewModal'

interface LandlordViewStepProps {
  data: AssetViewData
}

export default function LandlordViewStep({ data }: LandlordViewStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <User className="h-5 w-5" />
        <p className="text-sm">Landlord contact information</p>
      </div>

      {/* Landlord Name */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium mb-1">Landlord Name</div>
            <p className="text-xs text-muted-foreground mb-3">
              The name of the property owner or landlord.
            </p>
            <div className="text-lg font-semibold">
              {data.landlord_name || (
                <span className="text-muted-foreground text-base font-normal italic">Not specified</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Number */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium mb-1">Contact Number</div>
            <p className="text-xs text-muted-foreground mb-3">
              The landlord's phone number for contact purposes.
            </p>
            <div className="text-lg font-semibold">
              {data.landlord_contact_number ? (
                <a
                  href={`tel:${data.landlord_contact_number}`}
                  className="text-primary hover:underline"
                >
                  {data.landlord_contact_number}
                </a>
              ) : (
                <span className="text-muted-foreground text-base font-normal italic">Not specified</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
