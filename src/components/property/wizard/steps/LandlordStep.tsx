import { User, Phone } from 'lucide-react'
import { type PropertyFormData } from '../../../../types/property'

interface LandlordStepProps {
  formData: PropertyFormData
  updateFormData: (updates: Partial<PropertyFormData>) => void
}

export default function LandlordStep({ formData, updateFormData }: LandlordStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <User className="h-5 w-5" />
        <p className="text-sm">Enter the landlord's contact information.</p>
      </div>

      <div className="space-y-6">
        {/* Landlord Name */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <label htmlFor="landlord_name" className="block text-sm font-medium mb-1">
                Landlord Name
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                The name of the property owner or landlord.
              </p>
              <input
                id="landlord_name"
                type="text"
                placeholder="e.g., John Smith"
                value={formData.landlord_name}
                onChange={(e) => updateFormData({ landlord_name: e.target.value })}
                className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Contact Number */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <label htmlFor="landlord_contact_number" className="block text-sm font-medium mb-1">
                Contact Number
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                The landlord's phone number for contact purposes.
              </p>
              <input
                id="landlord_contact_number"
                type="tel"
                placeholder="e.g., 0412 345 678"
                value={formData.landlord_contact_number}
                onChange={(e) => updateFormData({ landlord_contact_number: e.target.value })}
                className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
