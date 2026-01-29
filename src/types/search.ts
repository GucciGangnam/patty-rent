import type { PropertyType, AmenityKey } from './property'

// Search wizard step
export type SearchStep = 'suburb' | 'property_type' | 'bedrooms' | 'amenities'

export const SEARCH_STEPS: { id: SearchStep; label: string }[] = [
  { id: 'suburb', label: 'Location' },
  { id: 'property_type', label: 'Type' },
  { id: 'bedrooms', label: 'Bedrooms' },
  { id: 'amenities', label: 'Amenities' },
]

// Search criteria state
export interface SearchCriteria {
  suburbs: string[]
  propertyTypes: PropertyType[]
  bedrooms: number[]
  amenities: AmenityKey[]
  elevatorRequired: boolean
}

// Initial empty criteria
export const INITIAL_SEARCH_CRITERIA: SearchCriteria = {
  suburbs: [],
  propertyTypes: [],
  bedrooms: [],
  amenities: [],
  elevatorRequired: false,
}

// Search result for display
export interface SearchResult {
  id: string
  address_line_1: string | null
  suburb: string | null
  city: string | null
  state: string | null
  bedrooms: number | null
  bathrooms: number | null
  rent_weekly: number | null
  property_type: PropertyType | null
  primary_image_url: string | null
  available_from: string | null
}

// Bedroom options
export const BEDROOM_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5+' },
]
