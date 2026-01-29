import { Building2, Bed, Bath, DollarSign } from 'lucide-react'
import { PROPERTY_TYPE_LABELS, type PropertyType } from '../../types/property'
import type { SearchResult } from '../../types/search'
import { formatCurrency } from '../../lib/currency'

interface SearchResultCardProps {
  result: SearchResult
  onClick: () => void
  currencyCode?: string
}

export default function SearchResultCard({ result, onClick, currencyCode = 'AUD' }: SearchResultCardProps) {
  const formatPrice = (price: number | null) => {
    if (!price) return null
    return `${formatCurrency(price, currencyCode)}/wk`
  }

  const getPropertyTypeLabel = (type: PropertyType | null) => {
    if (!type) return null
    return PROPERTY_TYPE_LABELS[type] || type
  }

  const getAvailabilityLabel = (availableFrom: string | null) => {
    if (!availableFrom) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const availableDate = new Date(availableFrom)
    if (availableDate <= today) {
      return 'Available Now'
    }
    return `From ${availableDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
  }

  const availabilityLabel = getAvailabilityLabel(result.available_from)

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
    >
      {/* Image */}
      <div className="aspect-video bg-muted relative">
        {result.primary_image_url ? (
          <img
            src={result.primary_image_url}
            alt={result.address_line_1 || 'Property'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {result.property_type && (
          <span className="absolute top-2 left-2 bg-background/90 text-xs px-2 py-1 rounded-full">
            {getPropertyTypeLabel(result.property_type)}
          </span>
        )}
        {availabilityLabel && (
          <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
            {availabilityLabel}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Address */}
        <div>
          <p className="font-medium text-sm line-clamp-1">
            {result.address_line_1 || 'Address not available'}
          </p>
          <p className="text-xs text-muted-foreground">
            {[result.suburb, result.city, result.state].filter(Boolean).join(', ')}
          </p>
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {result.bedrooms !== null && (
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {result.bedrooms}
            </span>
          )}
          {result.bathrooms !== null && (
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {result.bathrooms}
            </span>
          )}
          {result.rent_weekly && (
            <span className="flex items-center gap-1 ml-auto font-medium text-foreground">
              <DollarSign className="h-4 w-4" />
              {formatPrice(result.rent_weekly)}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
