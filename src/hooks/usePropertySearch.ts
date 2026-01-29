import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { PropertyType, AmenityKey } from '../types/property'
import {
  type SearchStep,
  type SearchCriteria,
  type SearchResult,
  SEARCH_STEPS,
  INITIAL_SEARCH_CRITERIA,
} from '../types/search'

interface UsePropertySearchReturn {
  // Step navigation
  currentStep: SearchStep
  currentStepIndex: number
  isFirstStep: boolean
  isLastStep: boolean
  goToNextStep: () => void
  goToPreviousStep: () => void
  goToStep: (step: SearchStep) => void

  // Search criteria
  criteria: SearchCriteria
  toggleSuburb: (suburb: string) => void
  togglePropertyType: (type: PropertyType) => void
  toggleBedroom: (bedrooms: number) => void
  toggleAmenity: (amenity: AmenityKey) => void
  setElevatorRequired: (required: boolean) => void
  resetCriteria: () => void

  // Available suburbs and counts
  suburbs: string[]
  suburbsLoading: boolean
  totalAssets: number
  matchingCount: number
  matchingCountLoading: boolean
  hasFilters: boolean
  fetchSuburbs: () => Promise<void>

  // Search results
  results: SearchResult[]
  resultsLoading: boolean
  hasSearched: boolean
  executeSearch: () => Promise<void>
  resetSearch: () => void
}

export function usePropertySearch(): UsePropertySearchReturn {
  const { activeOrg } = useAuth()

  // Step state
  const [currentStep, setCurrentStep] = useState<SearchStep>('suburb')

  // Search criteria state
  const [criteria, setCriteria] = useState<SearchCriteria>(INITIAL_SEARCH_CRITERIA)

  // Suburbs state
  const [suburbs, setSuburbs] = useState<string[]>([])
  const [suburbsLoading, setSuburbsLoading] = useState(false)
  const [totalAssets, setTotalAssets] = useState(0)
  const [matchingCount, setMatchingCount] = useState(0)
  const [matchingCountLoading, setMatchingCountLoading] = useState(false)

  // Check if any filters are active
  const hasFilters =
    criteria.suburbs.length > 0 ||
    criteria.propertyTypes.length > 0 ||
    criteria.bedrooms.length > 0 ||
    criteria.amenities.length > 0 ||
    criteria.elevatorRequired

  // Results state
  const [results, setResults] = useState<SearchResult[]>([])
  const [resultsLoading, setResultsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Step navigation helpers
  const currentStepIndex = SEARCH_STEPS.findIndex(s => s.id === currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === SEARCH_STEPS.length - 1

  const goToNextStep = useCallback(() => {
    if (!isLastStep) {
      setCurrentStep(SEARCH_STEPS[currentStepIndex + 1].id)
    }
  }, [currentStepIndex, isLastStep])

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(SEARCH_STEPS[currentStepIndex - 1].id)
    }
  }, [currentStepIndex, isFirstStep])

  const goToStep = useCallback((step: SearchStep) => {
    setCurrentStep(step)
  }, [])

  // Toggle helpers for multi-select
  const toggleSuburb = useCallback((suburb: string) => {
    setCriteria(prev => ({
      ...prev,
      suburbs: prev.suburbs.includes(suburb)
        ? prev.suburbs.filter(s => s !== suburb)
        : [...prev.suburbs, suburb],
    }))
  }, [])

  const togglePropertyType = useCallback((type: PropertyType) => {
    setCriteria(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type],
    }))
  }, [])

  const toggleBedroom = useCallback((bedrooms: number) => {
    setCriteria(prev => ({
      ...prev,
      bedrooms: prev.bedrooms.includes(bedrooms)
        ? prev.bedrooms.filter(b => b !== bedrooms)
        : [...prev.bedrooms, bedrooms],
    }))
  }, [])

  const toggleAmenity = useCallback((amenity: AmenityKey) => {
    setCriteria(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }, [])

  const setElevatorRequired = useCallback((required: boolean) => {
    setCriteria(prev => ({
      ...prev,
      elevatorRequired: required,
    }))
  }, [])

  const resetCriteria = useCallback(() => {
    setCriteria(INITIAL_SEARCH_CRITERIA)
  }, [])

  // Fetch distinct suburbs and total count from org's properties
  const fetchSuburbs = useCallback(async () => {
    if (!activeOrg) return

    setSuburbsLoading(true)
    try {
      // Fetch all properties for this org (suburbs + count)
      const { data, error, count } = await supabase
        .from('properties')
        .select('suburb', { count: 'exact' })
        .eq('organisation_id', activeOrg.organisation.id)

      if (error) {
        console.error('Error fetching suburbs:', error)
        return
      }

      // Set total asset count
      setTotalAssets(count ?? 0)

      // Dedupe suburbs (filter out nulls)
      const uniqueSuburbs = [...new Set(data?.map(p => p.suburb).filter(Boolean) as string[])]
      uniqueSuburbs.sort()
      setSuburbs(uniqueSuburbs)
    } finally {
      setSuburbsLoading(false)
    }
  }, [activeOrg])

  // Fetch matching count based on current criteria
  const fetchMatchingCount = useCallback(async () => {
    if (!activeOrg) return

    setMatchingCountLoading(true)
    try {
      let query = supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('organisation_id', activeOrg.organisation.id)

      // Apply suburb filter
      if (criteria.suburbs.length > 0) {
        query = query.in('suburb', criteria.suburbs)
      }

      // Apply property type filter
      if (criteria.propertyTypes.length > 0) {
        query = query.in('property_type', criteria.propertyTypes)
      }

      // Apply elevator filter (only when required)
      if (criteria.elevatorRequired) {
        query = query.eq('elevator', true)
      }

      // Apply bedroom filter
      if (criteria.bedrooms.length > 0) {
        if (criteria.bedrooms.includes(5)) {
          const exactBedrooms = criteria.bedrooms.filter(b => b < 5)
          if (exactBedrooms.length > 0) {
            query = query.or(
              `bedrooms.in.(${exactBedrooms.join(',')}),bedrooms.gte.5`
            )
          } else {
            query = query.gte('bedrooms', 5)
          }
        } else {
          query = query.in('bedrooms', criteria.bedrooms)
        }
      }

      // Apply amenity filters (all must match)
      for (const amenity of criteria.amenities) {
        query = query.eq(`amenity_${amenity}`, true)
      }

      const { count, error } = await query

      if (error) {
        console.error('Error fetching matching count:', error)
        return
      }

      setMatchingCount(count ?? 0)
    } finally {
      setMatchingCountLoading(false)
    }
  }, [activeOrg, criteria])

  // Debounce ref for matching count
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch matching count when criteria changes (debounced)
  useEffect(() => {
    if (!hasFilters) {
      setMatchingCount(totalAssets)
      return
    }

    // Debounce the fetch
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchMatchingCount()
    }, 150)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [hasFilters, criteria, totalAssets, fetchMatchingCount])

  // Execute search with all filters
  const executeSearch = useCallback(async () => {
    if (!activeOrg) return

    setResultsLoading(true)
    setHasSearched(true)

    try {
      let query = supabase
        .from('properties')
        .select(`
          id,
          address_line_1,
          suburb,
          city,
          state,
          bedrooms,
          bathrooms,
          rent_weekly,
          property_type,
          available_from
        `)
        .eq('organisation_id', activeOrg.organisation.id)

      // Apply suburb filter
      if (criteria.suburbs.length > 0) {
        query = query.in('suburb', criteria.suburbs)
      }

      // Apply property type filter
      if (criteria.propertyTypes.length > 0) {
        query = query.in('property_type', criteria.propertyTypes)
      }

      // Apply elevator filter (only when required)
      if (criteria.elevatorRequired) {
        query = query.eq('elevator', true)
      }

      // Apply bedroom filter
      if (criteria.bedrooms.length > 0) {
        // Handle "5+" case
        if (criteria.bedrooms.includes(5)) {
          const exactBedrooms = criteria.bedrooms.filter(b => b < 5)
          if (exactBedrooms.length > 0) {
            // Need OR: bedrooms in [1,2,3,4] OR bedrooms >= 5
            query = query.or(
              `bedrooms.in.(${exactBedrooms.join(',')}),bedrooms.gte.5`
            )
          } else {
            // Only 5+ selected
            query = query.gte('bedrooms', 5)
          }
        } else {
          query = query.in('bedrooms', criteria.bedrooms)
        }
      }

      // Apply amenity filters (all must match)
      for (const amenity of criteria.amenities) {
        query = query.eq(`amenity_${amenity}`, true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error executing search:', error)
        setResults([])
        return
      }

      // Fetch primary images for results
      const propertyIds = data?.map(p => p.id) || []
      let imagesMap: Record<string, string> = {}

      if (propertyIds.length > 0) {
        const { data: images } = await supabase
          .from('property_images')
          .select('property_id, storage_path')
          .in('property_id', propertyIds)
          .eq('is_primary', true)

        if (images) {
          for (const img of images) {
            const { data: urlData } = supabase.storage
              .from('property-images')
              .getPublicUrl(img.storage_path)
            imagesMap[img.property_id] = urlData.publicUrl
          }
        }
      }

      const resultsWithImages: SearchResult[] = (data || []).map(p => ({
        ...p,
        primary_image_url: imagesMap[p.id] || null,
      }))

      setResults(resultsWithImages)
    } finally {
      setResultsLoading(false)
    }
  }, [activeOrg, criteria])

  // Reset search to start over
  const resetSearch = useCallback(() => {
    setCurrentStep('suburb')
    setCriteria(INITIAL_SEARCH_CRITERIA)
    setResults([])
    setHasSearched(false)
  }, [])

  return {
    // Step navigation
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,

    // Search criteria
    criteria,
    toggleSuburb,
    togglePropertyType,
    toggleBedroom,
    toggleAmenity,
    setElevatorRequired,
    resetCriteria,

    // Available suburbs and counts
    suburbs,
    suburbsLoading,
    totalAssets,
    matchingCount,
    matchingCountLoading,
    hasFilters,
    fetchSuburbs,

    // Search results
    results,
    resultsLoading,
    hasSearched,
    executeSearch,
    resetSearch,
  }
}
