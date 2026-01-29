import { MapPin } from 'lucide-react'
import { type PropertyFormData } from '../../../../types/property'

interface LocationStepProps {
  formData: PropertyFormData
  updateFormData: (updates: Partial<PropertyFormData>) => void
}

export default function LocationStep({ formData, updateFormData }: LocationStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-5 w-5" />
        <p className="text-sm">Enter the property location details.</p>
      </div>

      <div className="space-y-4">
        {/* Address Line 1 */}
        <div>
          <label htmlFor="address_line_1" className="block text-sm font-medium mb-1.5">
            Address Line 1
          </label>
          <input
            id="address_line_1"
            type="text"
            placeholder="Street address"
            value={formData.address_line_1}
            onChange={(e) => updateFormData({ address_line_1: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Address Line 2 */}
        <div>
          <label htmlFor="address_line_2" className="block text-sm font-medium mb-1.5">
            Address Line 2
          </label>
          <input
            id="address_line_2"
            type="text"
            placeholder="Unit, apartment, suite, etc. (optional)"
            value={formData.address_line_2}
            onChange={(e) => updateFormData({ address_line_2: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Suburb and City */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="suburb" className="block text-sm font-medium mb-1.5">
              Suburb
            </label>
            <input
              id="suburb"
              type="text"
              placeholder="Suburb"
              value={formData.suburb}
              onChange={(e) => updateFormData({ suburb: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1.5">
              City
            </label>
            <input
              id="city"
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1.5">
            Province / State
          </label>
          <input
            id="state"
            type="text"
            placeholder="Province or state"
            value={formData.state}
            onChange={(e) => updateFormData({ state: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Postcode and Country */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="postcode" className="block text-sm font-medium mb-1.5">
              Postcode / ZIP
            </label>
            <input
              id="postcode"
              type="text"
              placeholder="Postcode or ZIP code"
              value={formData.postcode}
              onChange={(e) => updateFormData({ postcode: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-1.5">
              Country
            </label>
            <input
              id="country"
              type="text"
              placeholder="Country"
              value={formData.country}
              onChange={(e) => updateFormData({ country: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
