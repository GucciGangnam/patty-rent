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

// Amenity keys (matching database column names without 'amenity_' prefix)
export type AmenityKey =
  | 'air_conditioning'
  | 'heating'
  | 'dishwasher'
  | 'built_in_wardrobes'
  | 'floorboards'
  | 'internal_laundry'
  | 'bath'
  | 'ensuite'
  | 'pool'
  | 'gym'
  | 'balcony'
  | 'courtyard'
  | 'garden'
  | 'outdoor_area'
  | 'secure_parking'
  | 'garage'
  | 'carport'
  | 'alarm_system'
  | 'intercom'
  | 'nbn'
  | 'solar_panels'
  | 'water_tank'

// Amenities configuration with labels and categories
export const AMENITIES: { id: AmenityKey; label: string; category: string }[] = [
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
]

// Amenities object type (all booleans, nullable)
export type PropertyAmenities = {
  [K in AmenityKey]: boolean | null
}

// Initial amenities state (all null)
export const INITIAL_AMENITIES: PropertyAmenities = {
  air_conditioning: null,
  heating: null,
  dishwasher: null,
  built_in_wardrobes: null,
  floorboards: null,
  internal_laundry: null,
  bath: null,
  ensuite: null,
  pool: null,
  gym: null,
  balcony: null,
  courtyard: null,
  garden: null,
  outdoor_area: null,
  secure_parking: null,
  garage: null,
  carport: null,
  alarm_system: null,
  intercom: null,
  nbn: null,
  solar_panels: null,
  water_tank: null,
}

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

// Existing image for edit mode (with URL for display)
export interface ExistingPropertyImage {
  id: string
  storage_path: string
  display_order: number
  is_primary: boolean
  caption: string
  url: string
  markedForDeletion?: boolean
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
  suburb?: string
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
  elevator?: boolean

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

  // Landlord
  landlord_name?: string
  landlord_contact_number?: string

  // Content
  title?: string
  description?: string
  internal_notes?: string

  // Amenities (boolean columns)
  amenity_air_conditioning?: boolean
  amenity_heating?: boolean
  amenity_dishwasher?: boolean
  amenity_built_in_wardrobes?: boolean
  amenity_floorboards?: boolean
  amenity_internal_laundry?: boolean
  amenity_bath?: boolean
  amenity_ensuite?: boolean
  amenity_pool?: boolean
  amenity_gym?: boolean
  amenity_balcony?: boolean
  amenity_courtyard?: boolean
  amenity_garden?: boolean
  amenity_outdoor_area?: boolean
  amenity_secure_parking?: boolean
  amenity_garage?: boolean
  amenity_carport?: boolean
  amenity_alarm_system?: boolean
  amenity_intercom?: boolean
  amenity_nbn?: boolean
  amenity_solar_panels?: boolean
  amenity_water_tank?: boolean

  // Timestamps
  created_at: string
  updated_at: string
  updated_by?: string
}

// Form data for the wizard (all fields optional for draft state)
export interface PropertyFormData {
  // Location
  address_line_1: string
  address_line_2: string
  suburb: string
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
  elevator: boolean | null

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

  // Landlord
  landlord_name: string
  landlord_contact_number: string

  // Content
  title: string
  description: string
  internal_notes: string

  // Amenities (boolean values)
  amenities: PropertyAmenities

  // Rooms
  rooms: PropertyRoom[]

  // Images (local files during wizard)
  images: LocalPropertyImage[]
}

// Initial empty form data
export const INITIAL_FORM_DATA: PropertyFormData = {
  address_line_1: '',
  address_line_2: '',
  suburb: '',
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
  elevator: null,

  rent_weekly: '',
  rent_monthly: '',
  bond: '',
  available_from: '',
  lease_min_months: '',
  lease_max_months: '',

  max_occupants: '',
  pets_allowed: '',
  smokers_allowed: '',

  landlord_name: '',
  landlord_contact_number: '',

  title: '',
  description: '',
  internal_notes: '',

  amenities: { ...INITIAL_AMENITIES },
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
  | 'landlord'
  | 'review'

export const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: 'media', label: 'Media' },
  { id: 'location', label: 'Location' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'rental_terms', label: 'Rental Terms' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'rules', label: 'Rules' },
  { id: 'landlord', label: 'Landlord' },
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
