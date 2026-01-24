import { useState } from 'react'
import { X, Building2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import WizardStepIndicator from './WizardStepIndicator'
import MediaStep from './steps/MediaStep'
import LocationStep from './steps/LocationStep'
import RoomsStep from './steps/RoomsStep'
import RentalTermsStep from './steps/RentalTermsStep'
import AmenitiesStep from './steps/AmenitiesStep'
import RulesStep from './steps/RulesStep'
import ReviewStep from './steps/ReviewStep'
import {
  WIZARD_STEPS,
  INITIAL_FORM_DATA,
  type WizardStep,
  type PropertyFormData,
} from '../../../types/property'

interface AssetWizardModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AssetWizardModal({ isOpen, onClose, onSuccess }: AssetWizardModalProps) {
  const { user, activeOrg } = useAuth()
  const [currentStep, setCurrentStep] = useState<WizardStep>('media')
  const [formData, setFormData] = useState<PropertyFormData>(INITIAL_FORM_DATA)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const currentStepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1

  const updateFormData = (updates: Partial<PropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(WIZARD_STEPS[currentStepIndex + 1].id)
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(WIZARD_STEPS[currentStepIndex - 1].id)
    }
  }

  const handleStepClick = (step: WizardStep) => {
    const targetIndex = WIZARD_STEPS.findIndex(s => s.id === step)
    if (targetIndex < currentStepIndex) {
      setCurrentStep(step)
    }
  }

  const handleClose = () => {
    setFormData(INITIAL_FORM_DATA)
    setCurrentStep('media')
    setError(null)
    onClose()
  }

  const handleSubmit = async () => {
    if (!user || !activeOrg) return

    setSubmitting(true)
    setError(null)

    try {
      // 1. Upload images to storage
      const uploadedImages: { storage_path: string; display_order: number; is_primary: boolean; caption: string }[] = []

      for (const image of formData.images) {
        const fileExt = image.file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const storagePath = `${activeOrg.organisation.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(storagePath, image.file)

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`)
        }

        uploadedImages.push({
          storage_path: storagePath,
          display_order: image.display_order,
          is_primary: image.is_primary,
          caption: image.caption,
        })
      }

      // 2. Insert property record
      const propertyData = {
        organisation_id: activeOrg.organisation.id,
        created_by: user.id,
        status: 'draft' as const,

        // Location
        address_line_1: formData.address_line_1 || null,
        address_line_2: formData.address_line_2 || null,
        city: formData.city || null,
        state: formData.state || null,
        postcode: formData.postcode || null,
        country: formData.country || null,

        // Dimensions
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
        floor_area_sqm: formData.floor_area_sqm ? parseFloat(formData.floor_area_sqm) : null,
        land_area_sqm: formData.land_area_sqm ? parseFloat(formData.land_area_sqm) : null,
        floors: formData.floors ? parseInt(formData.floors) : null,

        // Type
        property_type: formData.property_type || null,
        furnished: formData.furnished || null,

        // Pricing
        rent_weekly: formData.rent_weekly ? parseFloat(formData.rent_weekly) : null,
        rent_monthly: formData.rent_monthly ? parseFloat(formData.rent_monthly) : null,
        bond: formData.bond ? parseFloat(formData.bond) : null,
        available_from: formData.available_from || null,
        lease_min_months: formData.lease_min_months ? parseInt(formData.lease_min_months) : null,
        lease_max_months: formData.lease_max_months ? parseInt(formData.lease_max_months) : null,

        // Rules
        max_occupants: formData.max_occupants ? parseInt(formData.max_occupants) : null,
        pets_allowed: formData.pets_allowed || null,
        smokers_allowed: formData.smokers_allowed || null,

        // Content
        title: formData.title || null,
        description: formData.description || null,
        internal_notes: formData.internal_notes || null,
      }

      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert(propertyData)
        .select('id')
        .single()

      if (propertyError) {
        throw new Error(`Failed to create property: ${propertyError.message}`)
      }

      // 3. Insert property images records
      if (uploadedImages.length > 0) {
        const imageRecords = uploadedImages.map(img => ({
          property_id: property.id,
          storage_path: img.storage_path,
          display_order: img.display_order,
          is_primary: img.is_primary,
          caption: img.caption || null,
        }))

        const { error: imagesError } = await supabase
          .from('property_images')
          .insert(imageRecords)

        if (imagesError) {
          throw new Error(`Failed to save image records: ${imagesError.message}`)
        }
      }

      // 4. Insert property amenities
      if (formData.amenities.length > 0) {
        const amenityRecords = formData.amenities.map(amenity => ({
          property_id: property.id,
          amenity,
        }))

        const { error: amenitiesError } = await supabase
          .from('property_amenities')
          .insert(amenityRecords)

        if (amenitiesError) {
          throw new Error(`Failed to save amenities: ${amenitiesError.message}`)
        }
      }

      // 5. Insert property rooms
      if (formData.rooms.length > 0) {
        const roomRecords = formData.rooms.map(room => ({
          property_id: property.id,
          room_type: room.room_type,
          name: room.name || null,
          width_m: room.width_m || null,
          length_m: room.length_m || null,
          notes: room.notes || null,
        }))

        const { error: roomsError } = await supabase
          .from('property_rooms')
          .insert(roomRecords)

        if (roomsError) {
          throw new Error(`Failed to save rooms: ${roomsError.message}`)
        }
      }

      // Success - close modal and notify parent
      handleClose()
      onSuccess?.()
    } catch (err) {
      console.error('Error creating property:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStep = () => {
    const stepProps = { formData, updateFormData }

    switch (currentStep) {
      case 'media':
        return <MediaStep {...stepProps} />
      case 'location':
        return <LocationStep {...stepProps} />
      case 'rooms':
        return <RoomsStep {...stepProps} />
      case 'rental_terms':
        return <RentalTermsStep {...stepProps} />
      case 'amenities':
        return <AmenitiesStep {...stepProps} />
      case 'rules':
        return <RulesStep {...stepProps} />
      case 'review':
        return <ReviewStep {...stepProps} />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg border border-border bg-card shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Add New Asset</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-6">
          <WizardStepIndicator currentStep={currentStep} onStepClick={handleStepClick} />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {renderStep()}
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
            {!isLastStep && (
              <button
                type="button"
                onClick={handleNext}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip
              </button>
            )}
            {isLastStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Asset'
                )}
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
