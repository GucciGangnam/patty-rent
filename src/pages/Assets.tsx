import { useState, useEffect } from 'react'
import { Plus, Building2, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ImageIcon, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/currency'
import AssetWizardModal from '../components/property/wizard/AssetWizardModal'
import AssetViewModal from '../components/property/view/AssetViewModal'

interface PropertyWithImage {
  id: string
  status: 'draft' | 'active' | 'archived'
  address_line_1: string | null
  suburb: string | null
  city: string | null
  state: string | null
  postcode: string | null
  country: string | null
  bedrooms: number | null
  bathrooms: number | null
  rent_weekly: number | null
  property_type: string | null
  created_at: string
  primary_image: {
    storage_path: string
  } | null
}

const ITEMS_PER_PAGE = 50

const PROPERTY_TYPE_LABELS: Record<string, string> = {
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

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-800',
  active: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
}

export default function Assets() {
  const { activeOrg } = useAuth()
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [editAssetId, setEditAssetId] = useState<string | null>(null)
  const [viewAssetId, setViewAssetId] = useState<string | null>(null)
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null)
  const [assets, setAssets] = useState<PropertyWithImage[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loadedOrgId, setLoadedOrgId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState({
    status: '' as '' | 'draft' | 'active' | 'archived',
    propertyType: '',
    bedrooms: '' as '' | '1' | '2' | '3' | '4' | '5+',
  })

  const canManageAssets = activeOrg?.role === 'owner' || activeOrg?.role === 'manager'

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 150)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, filters])

  // Fetch assets with pagination
  const fetchAssets = async () => {
    if (!activeOrg) return

    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      // Build base query for count
      let countQuery = supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('organisation_id', activeOrg.organisation.id)

      // Apply search filter to count query
      if (debouncedSearch) {
        const searchPattern = `%${debouncedSearch}%`
        countQuery = countQuery.or(
          `address_line_1.ilike.${searchPattern},suburb.ilike.${searchPattern},city.ilike.${searchPattern},state.ilike.${searchPattern},postcode.ilike.${searchPattern}`
        )
      }

      // Apply filters to count query
      if (filters.status) {
        countQuery = countQuery.eq('status', filters.status)
      }
      if (filters.propertyType) {
        countQuery = countQuery.eq('property_type', filters.propertyType)
      }
      if (filters.bedrooms) {
        if (filters.bedrooms === '5+') {
          countQuery = countQuery.gte('bedrooms', 5)
        } else {
          countQuery = countQuery.eq('bedrooms', parseInt(filters.bedrooms))
        }
      }

      const { count } = await countQuery
      setTotalCount(count ?? 0)

      // Build base query for properties
      let propertiesQuery = supabase
        .from('properties')
        .select(`
          id,
          status,
          address_line_1,
          suburb,
          city,
          state,
          postcode,
          country,
          bedrooms,
          bathrooms,
          rent_weekly,
          property_type,
          created_at
        `)
        .eq('organisation_id', activeOrg.organisation.id)

      // Apply search filter
      if (debouncedSearch) {
        const searchPattern = `%${debouncedSearch}%`
        propertiesQuery = propertiesQuery.or(
          `address_line_1.ilike.${searchPattern},suburb.ilike.${searchPattern},city.ilike.${searchPattern},state.ilike.${searchPattern},postcode.ilike.${searchPattern}`
        )
      }

      // Apply filters
      if (filters.status) {
        propertiesQuery = propertiesQuery.eq('status', filters.status)
      }
      if (filters.propertyType) {
        propertiesQuery = propertiesQuery.eq('property_type', filters.propertyType)
      }
      if (filters.bedrooms) {
        if (filters.bedrooms === '5+') {
          propertiesQuery = propertiesQuery.gte('bedrooms', 5)
        } else {
          propertiesQuery = propertiesQuery.eq('bedrooms', parseInt(filters.bedrooms))
        }
      }

      const { data: properties, error } = await propertiesQuery
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Error fetching assets:', error)
        return
      }

      // Get primary images for these properties
      if (properties && properties.length > 0) {
        const propertyIds = properties.map(p => p.id)
        const { data: images } = await supabase
          .from('property_images')
          .select('property_id, storage_path')
          .in('property_id', propertyIds)
          .eq('is_primary', true)

        // Map images to properties
        const imageMap = new Map(images?.map(img => [img.property_id, img]) || [])
        const propertiesWithImages: PropertyWithImage[] = properties.map(p => ({
          ...p,
          primary_image: imageMap.get(p.id) || null,
        }))

        setAssets(propertiesWithImages)
      } else {
        setAssets([])
      }

      setLoadedOrgId(activeOrg.organisation.id)
    } catch (err) {
      console.error('Error fetching assets:', err)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [activeOrg?.organisation.id, currentPage, debouncedSearch, filters])

  const handleWizardSuccess = () => {
    setCurrentPage(1)
    fetchAssets()
  }

  const handleToggleStatus = async (assetId: string) => {
    const asset = assets.find(a => a.id === assetId)
    if (!asset) return

    const newStatus = asset.status === 'active' ? 'draft' : 'active'

    // Optimistic update
    setAssets(prev =>
      prev.map(a => (a.id === assetId ? { ...a, status: newStatus } : a))
    )

    const { error } = await supabase
      .from('properties')
      .update({ status: newStatus })
      .eq('id', assetId)

    if (error) {
      console.error('Error updating asset status:', error)
      // Revert on error
      setAssets(prev =>
        prev.map(a => (a.id === assetId ? { ...a, status: asset.status } : a))
      )
    }
  }

  const handleAction = (action: string, assetId: string) => {
    if (action === 'View') {
      setViewAssetId(assetId)
    } else if (action === 'Edit') {
      setEditAssetId(assetId)
    } else if (action === 'Toggle visibility') {
      handleToggleStatus(assetId)
    } else if (action === 'Delete') {
      setDeleteAssetId(assetId)
    }
  }

  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!deleteAssetId) return

    setIsDeleting(true)
    try {
      // Delete the property - the database trigger will handle storage cleanup
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', deleteAssetId)

      if (error) {
        console.error('Error deleting property:', error)
        alert('Failed to delete property. Please try again.')
        return
      }

      // Remove from local state
      setAssets(prev => prev.filter(a => a.id !== deleteAssetId))
      setTotalCount(prev => prev - 1)
      setDeleteAssetId(null)
    } catch (err) {
      console.error('Error deleting property:', err)
      alert('Failed to delete property. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditSuccess = () => {
    setEditAssetId(null)
    fetchAssets()
  }

  const getImageUrl = (storagePath: string) => {
    const { data } = supabase.storage.from('property-images').getPublicUrl(storagePath)
    return data.publicUrl
  }

  const formatAddress = (asset: PropertyWithImage) => {
    const parts = [asset.address_line_1, asset.suburb, asset.city, asset.state].filter(Boolean)
    return parts.join(', ') || 'No address'
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Manage assets</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            {totalCount} asset{totalCount !== 1 ? 's' : ''} in this organisation
          </p>
        </div>
        <button
          disabled={!canManageAssets}
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add new asset
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by address..."
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as typeof filters.status }))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filters.propertyType}
            onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Types</option>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={filters.bedrooms}
            onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value as typeof filters.bedrooms }))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Beds</option>
            <option value="1">1 Bed</option>
            <option value="2">2 Beds</option>
            <option value="3">3 Beds</option>
            <option value="4">4 Beds</option>
            <option value="5+">5+ Beds</option>
          </select>
        </div>
      </div>

      {/* Loading State - only show on initial load or org switch */}
      {loadedOrgId !== activeOrg?.organisation.id && (
        <div className="mt-8">
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 border-b border-border">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-4 py-4 border-b border-border last:border-b-0">
                <div className="h-16 w-full bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {loadedOrgId === activeOrg?.organisation.id && totalCount === 0 && (
        <div className="mt-8 rounded-lg border border-dashed border-border p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          {debouncedSearch || filters.status || filters.propertyType || filters.bedrooms ? (
            <>
              <h3 className="text-lg font-medium mb-2">No matching assets</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                No assets match your search criteria. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilters({ status: '', propertyType: '', bedrooms: '' })
                }}
                className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium mb-2">No assets yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Get started by adding your first rental property asset to this organisation.
              </p>
              {canManageAssets && (
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add your first asset
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Assets Table/Cards */}
      {loadedOrgId === activeOrg?.organisation.id && totalCount > 0 && (
        <div className="mt-8">
          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-lg border border-border overflow-hidden">
            {/* Table Header */}
            <div className="bg-muted/50 px-4 py-3 border-b border-border">
              <div className="grid grid-cols-[auto_1fr_120px_100px_100px_140px] gap-4 items-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="w-16">Image</div>
                <div>Address</div>
                <div>Type</div>
                <div>Beds/Baths</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="grid grid-cols-[auto_1fr_120px_100px_100px_140px] gap-4 items-center">
                    {/* Image */}
                    <div className="w-16 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                      {asset.primary_image ? (
                        <img
                          src={getImageUrl(asset.primary_image.storage_path)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Address */}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{formatAddress(asset)}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {[asset.postcode, asset.country].filter(Boolean).join(', ') || 'No postcode'}
                        {asset.rent_weekly && (
                          <span className="ml-2">
                            • {formatCurrency(asset.rent_weekly, activeOrg?.organisation.currency_code)}/week
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Type */}
                    <div className="text-sm text-muted-foreground">
                      {asset.property_type
                        ? PROPERTY_TYPE_LABELS[asset.property_type] || asset.property_type
                        : '-'}
                    </div>

                    {/* Beds/Baths */}
                    <div className="text-sm">
                      {asset.bedrooms !== null || asset.bathrooms !== null ? (
                        <span>
                          {asset.bedrooms ?? '-'} / {asset.bathrooms ?? '-'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                          STATUS_STYLES[asset.status] || STATUS_STYLES.draft
                        }`}
                      >
                        {asset.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleAction('View', asset.id)}
                        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="View asset"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction('Edit', asset.id)}
                        disabled={!canManageAssets}
                        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                        title="Edit asset"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={asset.status === 'active'}
                        onClick={() => handleAction('Toggle visibility', asset.id)}
                        disabled={!canManageAssets}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          asset.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title={asset.status === 'active' ? 'Set to Draft' : 'Set to Active'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            asset.status === 'active' ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction('Delete', asset.id)}
                        disabled={!canManageAssets}
                        className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                        title="Delete asset"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex gap-3">
                  {/* Image */}
                  <div className="w-20 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                    {asset.primary_image ? (
                      <img
                        src={getImageUrl(asset.primary_image.storage_path)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm leading-tight">{formatAddress(asset)}</p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize flex-shrink-0 ${
                          STATUS_STYLES[asset.status] || STATUS_STYLES.draft
                        }`}
                      >
                        {asset.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {[asset.postcode, asset.country].filter(Boolean).join(', ') || 'No postcode'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                      {asset.property_type && (
                        <span>{PROPERTY_TYPE_LABELS[asset.property_type] || asset.property_type}</span>
                      )}
                      {(asset.bedrooms !== null || asset.bathrooms !== null) && (
                        <span>{asset.bedrooms ?? '-'} bed / {asset.bathrooms ?? '-'} bath</span>
                      )}
                      {asset.rent_weekly && (
                        <span className="font-medium text-foreground">{formatCurrency(asset.rent_weekly, activeOrg?.organisation.currency_code)}/week</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAction('View', asset.id)}
                      className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="View asset"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('Edit', asset.id)}
                      disabled={!canManageAssets}
                      className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit asset"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('Delete', asset.id)}
                      disabled={!canManageAssets}
                      className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete asset"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {asset.status === 'active' ? 'Active' : 'Draft'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={asset.status === 'active'}
                      onClick={() => handleAction('Toggle visibility', asset.id)}
                      disabled={!canManageAssets}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        asset.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      title={asset.status === 'active' ? 'Set to Draft' : 'Set to Active'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          asset.status === 'active' ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <p className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-input text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <span className="text-sm text-muted-foreground px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-input text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Asset Wizard Modal (Create Mode) */}
      <AssetWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={handleWizardSuccess}
        mode="create"
      />

      {/* Asset Wizard Modal (Edit Mode) */}
      <AssetWizardModal
        isOpen={editAssetId !== null}
        onClose={() => setEditAssetId(null)}
        onSuccess={handleEditSuccess}
        mode="edit"
        assetId={editAssetId}
      />

      {/* Asset View Modal */}
      <AssetViewModal
        isOpen={viewAssetId !== null}
        assetId={viewAssetId}
        onClose={() => setViewAssetId(null)}
      />

      {/* Delete Confirmation Dialog */}
      {deleteAssetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => !isDeleting && setDeleteAssetId(null)} />
          <div className="relative z-50 w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Delete Asset</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this asset? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteAssetId(null)}
                disabled={isDeleting}
                className="flex-1 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
