import { FileText, Image, MapPin, LayoutGrid, DollarSign, Sparkles, ClipboardList } from 'lucide-react'
import {
  type PropertyFormData,
  PROPERTY_TYPE_LABELS,
  FURNISHED_LABELS,
  YES_NO_UNSPECIFIED_LABELS,
  AMENITIES,
} from '../../../../types/property'

interface ReviewStepProps {
  formData: PropertyFormData
  updateFormData: (updates: Partial<PropertyFormData>) => void
}

export default function ReviewStep({ formData, updateFormData }: ReviewStepProps) {
  // Build location string
  const locationParts = [
    formData.address_line_1,
    formData.address_line_2,
    formData.city,
    formData.state,
    formData.postcode,
    formData.country,
  ].filter(Boolean)
  const locationString = locationParts.join(', ') || 'Not specified'

  // Get amenity labels
  const selectedAmenities = formData.amenities
    .map(id => AMENITIES.find(a => a.id === id)?.label)
    .filter(Boolean)

  // Format currency
  const formatCurrency = (value: string) => {
    if (!value) return null
    return `$${parseFloat(value).toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileText className="h-5 w-5" />
        <p className="text-sm">Review your property details and add a title and description.</p>
      </div>

      {/* Title, Description, Internal Notes */}
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1.5">
            Property Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Spacious 3-bedroom family home"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1.5">
            Public Description
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Describe the property for potential tenants..."
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div>
          <label htmlFor="internal_notes" className="block text-sm font-medium mb-1.5">
            Internal Notes
            <span className="text-muted-foreground font-normal ml-2">(not shown to tenants)</span>
          </label>
          <textarea
            id="internal_notes"
            rows={2}
            placeholder="Private notes for your team..."
            value={formData.internal_notes}
            onChange={(e) => updateFormData({ internal_notes: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
      </div>

      {/* Summary Sections */}
      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-medium mb-4">Property Summary</h3>
        <div className="space-y-4">
          {/* Media */}
          <SummarySection icon={Image} label="Media">
            {formData.images.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {formData.images.slice(0, 4).map((img, i) => (
                    <img
                      key={img.id}
                      src={img.preview}
                      alt=""
                      className="h-8 w-8 rounded object-cover border-2 border-background"
                      style={{ zIndex: 4 - i }}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formData.images.length} image{formData.images.length !== 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">No images added</span>
            )}
          </SummarySection>

          {/* Location */}
          <SummarySection icon={MapPin} label="Location">
            <span className={locationParts.length === 0 ? 'text-muted-foreground' : ''}>
              {locationString}
            </span>
          </SummarySection>

          {/* Rooms */}
          <SummarySection icon={LayoutGrid} label="Rooms & Property">
            <div className="space-y-1">
              {(formData.bedrooms || formData.bathrooms || formData.parking_spaces) && (
                <div className="flex gap-3 text-sm">
                  {formData.bedrooms && <span>{formData.bedrooms} bed</span>}
                  {formData.bathrooms && <span>{formData.bathrooms} bath</span>}
                  {formData.parking_spaces && <span>{formData.parking_spaces} parking</span>}
                </div>
              )}
              {(formData.property_type || formData.furnished) && (
                <div className="flex gap-3 text-sm">
                  {formData.property_type && (
                    <span>{PROPERTY_TYPE_LABELS[formData.property_type]}</span>
                  )}
                  {formData.furnished && (
                    <span className="text-muted-foreground">• {FURNISHED_LABELS[formData.furnished]}</span>
                  )}
                </div>
              )}
              {formData.rooms.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {formData.rooms.length} detailed room{formData.rooms.length !== 1 ? 's' : ''} added
                </div>
              )}
              {!formData.bedrooms && !formData.bathrooms && !formData.parking_spaces && !formData.property_type && formData.rooms.length === 0 && (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </div>
          </SummarySection>

          {/* Rental Terms */}
          <SummarySection icon={DollarSign} label="Rental Terms">
            <div className="space-y-1">
              {(formData.rent_weekly || formData.rent_monthly) && (
                <div className="flex gap-3 text-sm">
                  {formData.rent_weekly && <span>{formatCurrency(formData.rent_weekly)}/week</span>}
                  {formData.rent_monthly && (
                    <span className="text-muted-foreground">({formatCurrency(formData.rent_monthly)}/month)</span>
                  )}
                </div>
              )}
              {formData.bond && (
                <div className="text-sm">Bond: {formatCurrency(formData.bond)}</div>
              )}
              {formData.available_from && (
                <div className="text-sm text-muted-foreground">
                  Available: {new Date(formData.available_from).toLocaleDateString()}
                </div>
              )}
              {(formData.lease_min_months || formData.lease_max_months) && (
                <div className="text-sm text-muted-foreground">
                  Lease: {formData.lease_min_months || '?'} - {formData.lease_max_months || '?'} months
                </div>
              )}
              {!formData.rent_weekly && !formData.rent_monthly && !formData.bond && (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </div>
          </SummarySection>

          {/* Amenities */}
          <SummarySection icon={Sparkles} label="Amenities">
            {selectedAmenities.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedAmenities.slice(0, 6).map(amenity => (
                  <span key={amenity} className="text-xs bg-muted px-2 py-0.5 rounded">
                    {amenity}
                  </span>
                ))}
                {selectedAmenities.length > 6 && (
                  <span className="text-xs text-muted-foreground">
                    +{selectedAmenities.length - 6} more
                  </span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">None selected</span>
            )}
          </SummarySection>

          {/* Rules */}
          <SummarySection icon={ClipboardList} label="Rules">
            <div className="space-y-1">
              {formData.max_occupants && (
                <div className="text-sm">Max occupants: {formData.max_occupants}</div>
              )}
              {formData.pets_allowed && (
                <div className="text-sm">
                  Pets: {YES_NO_UNSPECIFIED_LABELS[formData.pets_allowed]}
                </div>
              )}
              {formData.smokers_allowed && (
                <div className="text-sm">
                  Smokers: {YES_NO_UNSPECIFIED_LABELS[formData.smokers_allowed]}
                </div>
              )}
              {!formData.max_occupants && !formData.pets_allowed && !formData.smokers_allowed && (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </div>
          </SummarySection>
        </div>
      </div>
    </div>
  )
}

function SummarySection({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3 p-3 rounded-md bg-muted/30">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}
