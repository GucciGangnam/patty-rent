import { useState, useEffect } from 'react'
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
  type ExistingPropertyImage,
  type PropertyRoom,
  type FurnishedOption,
  type PropertyType,
  type YesNoUnspecified,
} from '../../../types/property'

interface AssetWizardModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  mode?: 'create' | 'edit'
  assetId?: string | null
}

export default function AssetWizardModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  assetId = null,
}: AssetWizardModalProps) {
  const { user, activeOrg } = useAuth()
  const [currentStep, setCurrentStep] = useState<WizardStep>('media')
  const [formData, setFormData] = useState<PropertyFormData>(INITIAL_FORM_DATA)
  const [existingImages, setExistingImages] = useState<ExistingPropertyImage[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditMode = mode === 'edit' && assetId

  // Fetch existing asset data when in edit mode
  useEffect(() => {
    if (!isOpen || !isEditMode || !activeOrg) return

    const fetchAssetData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch property data
        const { data: property, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', assetId)
          .eq('organisation_id', activeOrg.organisation.id)
          .single()

        if (propertyError) {
          throw new Error(`Failed to load property: ${propertyError.message}`)
        }

        // Fetch images
        const { data: images, error: imagesError } = await supabase
          .from('property_images')
          .select('id, storage_path, display_order, is_primary, caption')
          .eq('property_id', assetId)
          .order('display_order', { ascending: true })

        if (imagesError) {
          throw new Error(`Failed to load images: ${imagesError.message}`)
        }

        // Fetch amenities
        const { data: amenities, error: amenitiesError } = await supabase
          .from('property_amenities')
          .select('amenity')
          .eq('property_id', assetId)

        if (amenitiesError) {
          throw new Error(`Failed to load amenities: ${amenitiesError.message}`)
        }

        // Fetch rooms
        const { data: rooms, error: roomsError } = await supabase
          .from('property_rooms')
          .select('id, room_type, name, width_m, length_m, notes')
          .eq('property_id', assetId)

        if (roomsError) {
          throw new Error(`Failed to load rooms: ${roomsError.message}`)
        }

        // Convert property data to form data format
        const loadedFormData: PropertyFormData = {
          address_line_1: property.address_line_1 || '',
          address_line_2: property.address_line_2 || '',
          city: property.city || '',
          state: property.state || '',
          postcode: property.postcode || '',
          country: property.country || '',
          bedrooms: property.bedrooms?.toString() || '',
          bathrooms: property.bathrooms?.toString() || '',
          parking_spaces: property.parking_spaces?.toString() || '',
          floor_area_sqm: property.floor_area_sqm?.toString() || '',
          land_area_sqm: property.land_area_sqm?.toString() || '',
          floors: property.floors?.toString() || '',
          property_type: (property.property_type as PropertyType) || '',
          furnished: (property.furnished as FurnishedOption) || '',
          rent_weekly: property.rent_weekly?.toString() || '',
          rent_monthly: property.rent_monthly?.toString() || '',
          bond: property.bond?.toString() || '',
          available_from: property.available_from || '',
          lease_min_months: property.lease_min_months?.toString() || '',
          lease_max_months: property.lease_max_months?.toString() || '',
          max_occupants: property.max_occupants?.toString() || '',
          pets_allowed: (property.pets_allowed as YesNoUnspecified) || '',
          smokers_allowed: (property.smokers_allowed as YesNoUnspecified) || '',
          title: property.title || '',
          description: property.description || '',
          internal_notes: property.internal_notes || '',
          amenities: amenities?.map(a => a.amenity) || [],
          rooms: (rooms || []).map(r => ({
            id: r.id,
            room_type: r.room_type,
            name: r.name || undefined,
            width_m: r.width_m || undefined,
            length_m: r.length_m || undefined,
            notes: r.notes || undefined,
          } as PropertyRoom)),
          images: [], // New images will be added here
        }

        setFormData(loadedFormData)

        // Convert existing images with URLs
        const existingImagesWithUrls: ExistingPropertyImage[] = (images || []).map(img => {
          const { data } = supabase.storage.from('property-images').getPublicUrl(img.storage_path)
          return {
            id: img.id,
            storage_path: img.storage_path,
            display_order: img.display_order,
            is_primary: img.is_primary,
            caption: img.caption || '',
            url: data.publicUrl,
            markedForDeletion: false,
          }
        })

        setExistingImages(existingImagesWithUrls)
      } catch (err) {
        console.error('Error loading asset:', err)
        setError(err instanceof Error ? err.message : 'Failed to load asset data')
      } finally {
        setLoading(false)
      }
    }

    fetchAssetData()
  }, [isOpen, isEditMode, assetId, activeOrg])

  if (!isOpen) return null

  const currentStepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1

  const updateFormData = (updates: Partial<PropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const updateExistingImages = (images: ExistingPropertyImage[]) => {
    setExistingImages(images)
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
    // In edit mode, allow navigating to any step
    if (isEditMode || targetIndex < currentStepIndex) {
      setCurrentStep(step)
    }
  }

  const handleClose = () => {
    setFormData(INITIAL_FORM_DATA)
    setExistingImages([])
    setCurrentStep('media')
    setError(null)
    onClose()
  }

  const handleSubmit = async () => {
    if (!user || !activeOrg) return

    setSubmitting(true)
    setError(null)

    try {
      if (isEditMode) {
        await handleUpdate()
      } else {
        await handleCreate()
      }

      // Success - close modal and notify parent
      handleClose()
      onSuccess?.()
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} property:`, err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreate = async () => {
    if (!user || !activeOrg) return

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
    const propertyData = buildPropertyData()

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
  }

  const handleUpdate = async () => {
    if (!user || !activeOrg || !assetId) return

    // 1. Handle images - delete removed, upload new
    const imagesToDelete = existingImages.filter(img => img.markedForDeletion)
    const imagesToKeep = existingImages.filter(img => !img.markedForDeletion)

    // Delete images marked for deletion
    for (const image of imagesToDelete) {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('property-images')
        .remove([image.storage_path])

      if (storageError) {
        console.warn(`Failed to delete image from storage: ${storageError.message}`)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('property_images')
        .delete()
        .eq('id', image.id)

      if (dbError) {
        throw new Error(`Failed to delete image record: ${dbError.message}`)
      }
    }

    // Update display_order and is_primary for kept existing images
    for (const image of imagesToKeep) {
      const { error: updateError } = await supabase
        .from('property_images')
        .update({
          display_order: image.display_order,
          is_primary: image.is_primary,
          caption: image.caption || null,
        })
        .eq('id', image.id)

      if (updateError) {
        throw new Error(`Failed to update image: ${updateError.message}`)
      }
    }

    // Upload new images
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

    // Insert new image records
    if (uploadedImages.length > 0) {
      const imageRecords = uploadedImages.map(img => ({
        property_id: assetId,
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

    // 2. Update property record
    const propertyData = {
      ...buildPropertyData(),
      updated_by: user.id,
    }
    // Remove created_by as we don't want to change it on update
    delete (propertyData as Record<string, unknown>).created_by

    const { error: propertyError } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', assetId)

    if (propertyError) {
      throw new Error(`Failed to update property: ${propertyError.message}`)
    }

    // 3. Update amenities - delete all and re-insert
    const { error: deleteAmenitiesError } = await supabase
      .from('property_amenities')
      .delete()
      .eq('property_id', assetId)

    if (deleteAmenitiesError) {
      throw new Error(`Failed to delete amenities: ${deleteAmenitiesError.message}`)
    }

    if (formData.amenities.length > 0) {
      const amenityRecords = formData.amenities.map(amenity => ({
        property_id: assetId,
        amenity,
      }))

      const { error: amenitiesError } = await supabase
        .from('property_amenities')
        .insert(amenityRecords)

      if (amenitiesError) {
        throw new Error(`Failed to save amenities: ${amenitiesError.message}`)
      }
    }

    // 4. Update rooms - delete all and re-insert
    const { error: deleteRoomsError } = await supabase
      .from('property_rooms')
      .delete()
      .eq('property_id', assetId)

    if (deleteRoomsError) {
      throw new Error(`Failed to delete rooms: ${deleteRoomsError.message}`)
    }

    if (formData.rooms.length > 0) {
      const roomRecords = formData.rooms.map(room => ({
        property_id: assetId,
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
  }

  const buildPropertyData = () => {
    if (!user || !activeOrg) throw new Error('User or organization not found')

    return {
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
  }

  const renderStep = () => {
    const stepProps = { formData, updateFormData }

    switch (currentStep) {
      case 'media':
        return (
          <MediaStep
            {...stepProps}
            existingImages={existingImages}
            onExistingImagesChange={updateExistingImages}
          />
        )
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
        return <ReviewStep {...stepProps} existingImages={existingImages} />
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
            <h2 className="text-xl font-semibold">
              {isEditMode ? 'Edit Asset' : 'Add New Asset'}
            </h2>
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
          <WizardStepIndicator
            currentStep={currentStep}
            onStepClick={handleStepClick}
            allClickable={!!isEditMode}
          />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
            disabled={isFirstStep || loading}
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
                disabled={loading}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                Skip
              </button>
            )}
            {isLastStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || loading}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Asset' : 'Create Asset'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
