import { useState, useEffect } from 'react'
import { X, Building2, ChevronLeft, ChevronRight, Loader2, Share2, Check } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import { useBottomSheet } from '../../../hooks/useBottomSheet'
import { formatCurrency } from '../../../lib/currency'
import WizardStepIndicator from '../wizard/WizardStepIndicator'
import MediaViewStep from './steps/MediaViewStep'
import LocationViewStep from './steps/LocationViewStep'
import RoomsViewStep from './steps/RoomsViewStep'
import RentalTermsViewStep from './steps/RentalTermsViewStep'
import AmenitiesViewStep from './steps/AmenitiesViewStep'
import RulesViewStep from './steps/RulesViewStep'
import LandlordViewStep from './steps/LandlordViewStep'
import DetailsViewStep from './steps/DetailsViewStep'
import {
  WIZARD_STEPS,
  PROPERTY_TYPE_LABELS,
  type WizardStep,
  type PropertyImage,
  type PropertyRoom,
  type PropertyType,
} from '../../../types/property'

// Remap the review step to details for viewing
const VIEW_STEPS = WIZARD_STEPS.map(step =>
  step.id === 'review' ? { id: 'review' as const, label: 'Details' } : step
)

interface AssetViewModalProps {
  isOpen: boolean
  assetId: string | null
  onClose: () => void
}

export interface AssetViewData {
  id: string
  status: 'draft' | 'active' | 'archived'

  // Location
  address_line_1: string | null
  address_line_2: string | null
  suburb: string | null
  city: string | null
  state: string | null
  postcode: string | null
  country: string | null

  // Dimensions
  bedrooms: number | null
  bathrooms: number | null
  parking_spaces: number | null
  floor_area_sqm: number | null
  land_area_sqm: number | null
  floors: number | null

  // Type
  property_type: string | null
  furnished: string | null
  elevator: boolean | null

  // Pricing
  rent_weekly: number | null
  rent_monthly: number | null
  bond: number | null
  available_from: string | null
  lease_min_months: number | null
  lease_max_months: number | null

  // Rules
  max_occupants: number | null
  pets_allowed: string | null
  smokers_allowed: string | null

  // Landlord
  landlord_name: string | null
  landlord_contact_number: string | null

  // Content
  title: string | null
  description: string | null
  internal_notes: string | null

  // Amenities (boolean columns)
  amenity_air_conditioning: boolean | null
  amenity_heating: boolean | null
  amenity_dishwasher: boolean | null
  amenity_built_in_wardrobes: boolean | null
  amenity_floorboards: boolean | null
  amenity_internal_laundry: boolean | null
  amenity_bath: boolean | null
  amenity_ensuite: boolean | null
  amenity_pool: boolean | null
  amenity_gym: boolean | null
  amenity_balcony: boolean | null
  amenity_courtyard: boolean | null
  amenity_garden: boolean | null
  amenity_outdoor_area: boolean | null
  amenity_secure_parking: boolean | null
  amenity_garage: boolean | null
  amenity_carport: boolean | null
  amenity_alarm_system: boolean | null
  amenity_intercom: boolean | null
  amenity_nbn: boolean | null
  amenity_solar_panels: boolean | null
  amenity_water_tank: boolean | null

  // Timestamps
  created_at: string
  updated_at: string

  // Related data
  images: PropertyImage[]
  rooms: PropertyRoom[]
}

export default function AssetViewModal({ isOpen, assetId, onClose }: AssetViewModalProps) {
  const { activeOrg } = useAuth()
  const [currentStep, setCurrentStep] = useState<WizardStep>('media')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assetData, setAssetData] = useState<AssetViewData | null>(null)
  const [shareStatus, setShareStatus] = useState<'idle' | 'loading' | 'copied' | 'shared'>('idle')

  const { sheetRef, handleRef, dragOffset, isDragging } = useBottomSheet({
    isOpen,
    onClose,
  })

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('media')
      setAssetData(null)
      setError(null)
      setShareStatus('idle')
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && assetId) {
      fetchAssetData()
    }
  }, [isOpen, assetId])

  const fetchAssetData = async () => {
    if (!assetId) return

    setLoading(true)
    setError(null)

    try {
      // Fetch property data
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', assetId)
        .single()

      if (propertyError) {
        throw new Error(`Failed to fetch property: ${propertyError.message}`)
      }

      // Fetch images
      const { data: images, error: imagesError } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', assetId)
        .order('display_order', { ascending: true })

      if (imagesError) {
        throw new Error(`Failed to fetch images: ${imagesError.message}`)
      }

      // Fetch rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('property_rooms')
        .select('*')
        .eq('property_id', assetId)

      if (roomsError) {
        throw new Error(`Failed to fetch rooms: ${roomsError.message}`)
      }

      setAssetData({
        ...property,
        images: images || [],
        rooms: rooms || [],
      })
    } catch (err) {
      console.error('Error fetching asset data:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const buildShareMessage = (): string => {
    if (!assetData) return ''

    const currencyCode = activeOrg?.organisation.currency_code || 'AUD'
    const lines: string[] = []

    // Property type and location line
    const bedroomCount = assetData.bedrooms ?? 0
    const propertyType = assetData.property_type
      ? PROPERTY_TYPE_LABELS[assetData.property_type as PropertyType] || assetData.property_type
      : 'Property'
    const locationParts = [assetData.suburb, assetData.city].filter(Boolean)
    const location = locationParts.length > 0 ? locationParts.join(', ') : ''

    if (bedroomCount > 0 && location) {
      lines.push(`🏠 ${bedroomCount}BR ${propertyType} in ${location}`)
    } else if (location) {
      lines.push(`🏠 ${propertyType} in ${location}`)
    } else {
      lines.push(`🏠 ${propertyType}`)
    }

    // Price line
    const monthlyRent = formatCurrency(assetData.rent_monthly, currencyCode)
    if (monthlyRent) {
      lines.push(`💰 ${monthlyRent}/month`)
    }

    // Beds, baths, parking line
    const specs: string[] = []
    if (assetData.bedrooms) specs.push(`${assetData.bedrooms} bed${assetData.bedrooms > 1 ? 's' : ''}`)
    if (assetData.bathrooms) specs.push(`${assetData.bathrooms} bath${assetData.bathrooms > 1 ? 's' : ''}`)
    if (assetData.parking_spaces) specs.push(`${assetData.parking_spaces} parking`)
    if (specs.length > 0) {
      lines.push(`🛏️ ${specs.join(' • ')}`)
    }

    // Address line
    const addressParts = [assetData.address_line_1, assetData.suburb].filter(Boolean)
    if (addressParts.length > 0) {
      lines.push(`📍 ${addressParts.join(', ')}`)
    }

    return lines.join('\n')
  }

  const getImageUrl = (storagePath: string) => {
    const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(storagePath)
    return urlData.publicUrl
  }

  const fetchImagesAsFiles = async (): Promise<File[]> => {
    if (!assetData?.images.length) return []

    const files: File[] = []

    // Sort images with primary first
    const sortedImages = [...assetData.images].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1
      if (!a.is_primary && b.is_primary) return 1
      return a.display_order - b.display_order
    })

    for (const image of sortedImages) {
      try {
        const url = getImageUrl(image.storage_path)
        const response = await fetch(url)
        const blob = await response.blob()

        // Extract filename from storage path
        const filename = image.storage_path.split('/').pop() || `property-image-${image.id}.jpg`
        const file = new File([blob], filename, { type: blob.type || 'image/jpeg' })
        files.push(file)
      } catch (err) {
        console.error('Failed to fetch image:', err)
      }
    }

    return files
  }

  const handleShare = async () => {
    const message = buildShareMessage()
    if (!message) return

    setShareStatus('loading')

    // Try Web Share API with files first (works great on mobile)
    if (navigator.share) {
      try {
        // Fetch images and check if we can share them
        const imageFiles = await fetchImagesAsFiles()

        const shareData: ShareData = { text: message }

        // Check if device supports sharing files
        if (imageFiles.length > 0 && navigator.canShare?.({ files: imageFiles })) {
          shareData.files = imageFiles
        }

        await navigator.share(shareData)
        setShareStatus('shared')
        setTimeout(() => setShareStatus('idle'), 2000)
        return
      } catch (err) {
        // User cancelled or share failed, fall back to clipboard
        if ((err as Error).name === 'AbortError') {
          setShareStatus('idle')
          return // User cancelled, don't show any feedback
        }
      }
    }

    // Fallback to clipboard (text only)
    try {
      await navigator.clipboard.writeText(message)
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      setShareStatus('idle')
    }
  }

  if (!isOpen) return null

  const currentStepIndex = VIEW_STEPS.findIndex(s => s.id === currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === VIEW_STEPS.length - 1

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(VIEW_STEPS[currentStepIndex + 1].id)
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(VIEW_STEPS[currentStepIndex - 1].id)
    }
  }

  const handleStepClick = (step: WizardStep) => {
    setCurrentStep(step)
  }

  const handleClose = () => {
    onClose()
  }

  const renderStep = () => {
    if (!assetData) return null

    const currencyCode = activeOrg?.organisation.currency_code || 'AUD'

    switch (currentStep) {
      case 'media':
        return <MediaViewStep data={assetData} />
      case 'location':
        return <LocationViewStep data={assetData} />
      case 'rooms':
        return <RoomsViewStep data={assetData} />
      case 'rental_terms':
        return <RentalTermsViewStep data={assetData} currencyCode={currencyCode} />
      case 'amenities':
        return <AmenitiesViewStep data={assetData} />
      case 'rules':
        return <RulesViewStep data={assetData} />
      case 'landlord':
        return <LandlordViewStep data={assetData} />
      case 'review':
        return <DetailsViewStep data={assetData} />
      default:
        return null
    }
  }

  // Build address for title
  const getAddressTitle = () => {
    if (!assetData) return 'Asset Details'
    const parts = [assetData.address_line_1, assetData.city].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Asset Details'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="fixed inset-0 bg-black/50 animate-in fade-in duration-300" onClick={handleClose} />
      <div
        ref={sheetRef}
        className="relative z-50 w-full h-full overflow-hidden rounded-t-2xl border-t border-x border-border bg-card shadow-lg flex flex-col animate-in slide-in-from-bottom duration-300"
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {/* Drag Handle */}
        <div
          ref={handleRef}
          className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 pt-2 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <Building2 className="h-6 w-6 text-primary flex-shrink-0" />
            <h2 className="text-xl font-semibold truncate">{getAddressTitle()}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-6">
          <WizardStepIndicator
            currentStep={currentStep}
            onStepClick={handleStepClick}
            allClickable
          />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : (
            renderStep()
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={handleBack}
            disabled={isFirstStep}
            className="flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              disabled={loading || !assetData || shareStatus === 'loading'}
              className="flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {shareStatus === 'idle' ? (
                <>
                  <Share2 className="h-4 w-4" />
                  Share
                </>
              ) : shareStatus === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  {shareStatus === 'copied' ? 'Copied!' : 'Shared!'}
                </>
              )}
            </button>

            {isLastStep ? (
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
