// Property status
export type PropertyStatus = 'draft' | 'active' | 'archived'

// Furnished options
export type FurnishedOption = 'furnished' | 'unfurnished' | 'partially_furnished'

// Yes/No/Unspecified options for rules
export type YesNoUnspecified = 'yes' | 'no' | 'unspecified'

// Property types
export type PropertyType =
  | 'house'
  | 'apartment'
  | 'unit'
  | 'townhouse'
  | 'villa'
  | 'studio'
  | 'duplex'
  | 'granny_flat'
  | 'other'

// Room types
export type RoomType =
  | 'bedroom'
  | 'bathroom'
  | 'kitchen'
  | 'living_room'
  | 'dining_room'
  | 'laundry'
  | 'garage'
  | 'study'
  | 'storage'
  | 'balcony'
  | 'courtyard'
  | 'other'

// Australian states
export const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
] as const

// Amenities list
export const AMENITIES = [
  { id: 'air_conditioning', label: 'Air Conditioning', category: 'climate' },
  { id: 'heating', label: 'Heating', category: 'climate' },
  { id: 'dishwasher', label: 'Dishwasher', category: 'kitchen' },
  { id: 'built_in_wardrobes', label: 'Built-in Wardrobes', category: 'interior' },
  { id: 'floorboards', label: 'Floorboards', category: 'interior' },
  { id: 'internal_laundry', label: 'Internal Laundry', category: 'interior' },
  { id: 'bath', label: 'Bath', category: 'bathroom' },
  { id: 'ensuite', label: 'Ensuite', category: 'bathroom' },
  { id: 'pool', label: 'Pool', category: 'outdoor' },
  { id: 'gym', label: 'Gym', category: 'facilities' },
  { id: 'balcony', label: 'Balcony', category: 'outdoor' },
  { id: 'courtyard', label: 'Courtyard', category: 'outdoor' },
  { id: 'garden', label: 'Garden', category: 'outdoor' },
  { id: 'outdoor_area', label: 'Outdoor Area', category: 'outdoor' },
  { id: 'secure_parking', label: 'Secure Parking', category: 'parking' },
  { id: 'garage', label: 'Garage', category: 'parking' },
  { id: 'carport', label: 'Carport', category: 'parking' },
  { id: 'alarm_system', label: 'Alarm System', category: 'security' },
  { id: 'intercom', label: 'Intercom', category: 'security' },
  { id: 'nbn', label: 'NBN', category: 'utilities' },
  { id: 'solar_panels', label: 'Solar Panels', category: 'utilities' },
  { id: 'water_tank', label: 'Water Tank', category: 'utilities' },
] as const

// Property room interface
export interface PropertyRoom {
  id?: string
  room_type: RoomType
  name?: string
  width_m?: number
  length_m?: number
  notes?: string
}

// Property image for local state during wizard
export interface LocalPropertyImage {
  id: string
  file: File
  preview: string
  display_order: number
  is_primary: boolean
  caption: string
}

// Property image from database
export interface PropertyImage {
  id: string
  property_id: string
  storage_path: string
  display_order: number
  is_primary: boolean
  caption?: string
  created_at: string
}

// Main property interface
export interface Property {
  id: string
  organisation_id: string
  created_by: string
  status: PropertyStatus

  // Location
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  postcode?: string
  country?: string
  latitude?: number
  longitude?: number

  // Dimensions
  bedrooms?: number
  bathrooms?: number
  parking_spaces?: number
  floor_area_sqm?: number
  land_area_sqm?: number
  floors?: number

  // Type
  property_type?: PropertyType
  furnished?: FurnishedOption

  // Pricing
  rent_weekly?: number
  rent_monthly?: number
  bond?: number
  available_from?: string
  lease_min_months?: number
  lease_max_months?: number

  // Rules
  max_occupants?: number
  pets_allowed?: YesNoUnspecified
  smokers_allowed?: YesNoUnspecified

  // Content
  title?: string
  description?: string
  internal_notes?: string

  // Timestamps
  created_at: string
  updated_at: string
}

// Form data for the wizard (all fields optional for draft state)
export interface PropertyFormData {
  // Location
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  postcode: string
  country: string

  // Dimensions
  bedrooms: string
  bathrooms: string
  parking_spaces: string
  floor_area_sqm: string
  land_area_sqm: string
  floors: string

  // Type
  property_type: PropertyType | ''
  furnished: FurnishedOption | ''

  // Pricing
  rent_weekly: string
  rent_monthly: string
  bond: string
  available_from: string
  lease_min_months: string
  lease_max_months: string

  // Rules
  max_occupants: string
  pets_allowed: YesNoUnspecified | ''
  smokers_allowed: YesNoUnspecified | ''

  // Content
  title: string
  description: string
  internal_notes: string

  // Amenities (list of amenity IDs)
  amenities: string[]

  // Rooms
  rooms: PropertyRoom[]

  // Images (local files during wizard)
  images: LocalPropertyImage[]
}

// Initial empty form data
export const INITIAL_FORM_DATA: PropertyFormData = {
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postcode: '',
  country: '',

  bedrooms: '',
  bathrooms: '',
  parking_spaces: '',
  floor_area_sqm: '',
  land_area_sqm: '',
  floors: '',

  property_type: '',
  furnished: '',

  rent_weekly: '',
  rent_monthly: '',
  bond: '',
  available_from: '',
  lease_min_months: '',
  lease_max_months: '',

  max_occupants: '',
  pets_allowed: '',
  smokers_allowed: '',

  title: '',
  description: '',
  internal_notes: '',

  amenities: [],
  rooms: [],
  images: [],
}

// Wizard steps
export type WizardStep =
  | 'media'
  | 'location'
  | 'rooms'
  | 'rental_terms'
  | 'amenities'
  | 'rules'
  | 'review'

export const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: 'media', label: 'Media' },
  { id: 'location', label: 'Location' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'rental_terms', label: 'Rental Terms' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'rules', label: 'Rules' },
  { id: 'review', label: 'Review' },
]

// Property type labels
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: 'House',
  apartment: 'Apartment',
  unit: 'Unit',
  townhouse: 'Townhouse',
  villa: 'Villa',
  studio: 'Studio',
  duplex: 'Duplex',
  granny_flat: 'Granny Flat',
  other: 'Other',
}

// Room type labels
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  kitchen: 'Kitchen',
  living_room: 'Living Room',
  dining_room: 'Dining Room',
  laundry: 'Laundry',
  garage: 'Garage',
  study: 'Study',
  storage: 'Storage',
  balcony: 'Balcony',
  courtyard: 'Courtyard',
  other: 'Other',
}

// Furnished labels
export const FURNISHED_LABELS: Record<FurnishedOption, string> = {
  furnished: 'Furnished',
  unfurnished: 'Unfurnished',
  partially_furnished: 'Partially Furnished',
}

// Yes/No/Unspecified labels
export const YES_NO_UNSPECIFIED_LABELS: Record<YesNoUnspecified, string> = {
  yes: 'Yes',
  no: 'No',
  unspecified: 'Unspecified',
}
