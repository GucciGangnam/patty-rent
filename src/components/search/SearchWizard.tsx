import { useEffect } from 'react'
import { Building2, Search, ChevronLeft, Loader2 } from 'lucide-react'
import { usePropertySearch } from '../../hooks/usePropertySearch'
import { useAuth } from '../../contexts/AuthContext'
import { useSearch } from '../../contexts/SearchContext'
import OrganisationAvatar from '../OrganisationAvatar'
import SearchStepIndicator from './SearchStepIndicator'
import SuburbStep from './steps/SuburbStep'
import PropertyTypeStep from './steps/PropertyTypeStep'
import BedroomsStep from './steps/BedroomsStep'
import AmenitiesSearchStep from './steps/AmenitiesSearchStep'
import SearchResults from './SearchResults'

export default function SearchWizard() {
  const { activeOrg } = useAuth()
  const { registerResetSearch } = useSearch()
  const {
    // Step navigation
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,

    // Search criteria
    criteria,
    toggleSuburb,
    togglePropertyType,
    toggleBedroom,
    toggleAmenity,
    setElevatorRequired,

    // Suburbs and counts
    suburbs,
    suburbsLoading,
    totalAssets,
    matchingCount,
    matchingCountLoading,
    hasFilters,
    fetchSuburbs,

    // Results
    results,
    resultsLoading,
    hasSearched,
    executeSearch,
    resetSearch,
  } = usePropertySearch()

  // Fetch suburbs on mount
  useEffect(() => {
    fetchSuburbs()
  }, [fetchSuburbs])

  // Register resetSearch with context so AppHeader can trigger it
  useEffect(() => {
    registerResetSearch(resetSearch)
  }, [registerResetSearch, resetSearch])

  const handleContinue = () => {
    if (isLastStep) {
      executeSearch()
    } else {
      goToNextStep()
    }
  }

  const handleSkip = () => {
    if (isLastStep) {
      executeSearch()
    } else {
      goToNextStep()
    }
  }

  // Show results after search
  if (hasSearched) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <SearchResults
            results={results}
            loading={resultsLoading}
            onNewSearch={resetSearch}
          />
        </div>
      </div>
    )
  }

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'suburb':
        return (
          <SuburbStep
            suburbs={suburbs}
            selectedSuburbs={criteria.suburbs}
            loading={suburbsLoading}
            onToggle={toggleSuburb}
          />
        )
      case 'property_type':
        return (
          <PropertyTypeStep
            selectedTypes={criteria.propertyTypes}
            elevatorRequired={criteria.elevatorRequired}
            onToggleType={togglePropertyType}
            onToggleElevator={setElevatorRequired}
          />
        )
      case 'bedrooms':
        return (
          <BedroomsStep
            selectedBedrooms={criteria.bedrooms}
            onToggle={toggleBedroom}
          />
        )
      case 'amenities':
        return (
          <AmenitiesSearchStep
            selectedAmenities={criteria.amenities}
            onToggle={toggleAmenity}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 text-center">
        <div className="inline-flex items-center justify-center mb-4">
          {activeOrg ? (
            <OrganisationAvatar
              name={activeOrg.organisation.name}
              avatarUrl={activeOrg.organisation.avatar_url}
              size="lg"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold flex items-center justify-center gap-1">
          {hasFilters ? (
            <>
              {matchingCountLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                matchingCount
              )}
              {' '}matching asset{matchingCount !== 1 ? 's' : ''}
            </>
          ) : (
            `${totalAssets} asset${totalAssets !== 1 ? 's' : ''} under management`
          )}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Filter by location, type, and amenities
        </p>
      </div>

      {/* Step Indicator */}
      <div className="px-4 py-4">
        <SearchStepIndicator
          currentStep={currentStep}
          currentStepIndex={currentStepIndex}
        />
      </div>

      {/* Step Content */}
      <div className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-lg">
          {renderStep()}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="mx-auto max-w-lg flex items-center">
          {/* Left: Back button (only after step 1) */}
          <div className="w-20">
            {!isFirstStep && (
              <button
                type="button"
                onClick={goToPreviousStep}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
          </div>

          {/* Center: Skip */}
          <div className="flex-1 text-center">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          </div>

          {/* Right: Continue/Search */}
          <div className="w-20 flex justify-end">
            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {isLastStep ? (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
