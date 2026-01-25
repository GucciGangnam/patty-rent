import { useState, useEffect } from 'react'
import { Plus, Building2, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import AssetWizardModal from '../components/property/wizard/AssetWizardModal'
import AssetViewModal from '../components/property/view/AssetViewModal'

interface PropertyWithImage {
  id: string
  status: 'draft' | 'active' | 'archived'
  address_line_1: string | null
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

  const canManageAssets = activeOrg?.role === 'owner' || activeOrg?.role === 'manager'

  // Fetch assets with pagination
  const fetchAssets = async () => {
    if (!activeOrg) return

    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      // Get total count
      const { count } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('organisation_id', activeOrg.organisation.id)

      setTotalCount(count ?? 0)

      // Get paginated properties
      const { data: properties, error } = await supabase
        .from('properties')
        .select(`
          id,
          status,
          address_line_1,
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
  }, [activeOrg?.organisation.id, currentPage])

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
    } else {
      alert(`"${action}" feature coming soon!`)
    }
  }

  const handleConfirmDelete = () => {
    alert('Delete function coming soon - We need to work out the implications')
    setDeleteAssetId(null)
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
    const parts = [asset.address_line_1, asset.city, asset.state].filter(Boolean)
    return parts.join(', ') || 'No address'
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage assets</h1>
          <p className="mt-2 text-muted-foreground">
            {totalCount} asset{totalCount !== 1 ? 's' : ''} in this organisation
          </p>
        </div>
        <button
          disabled={!canManageAssets}
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Add new asset
        </button>
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
        </div>
      )}

      {/* Assets Table */}
      {loadedOrgId === activeOrg?.organisation.id && totalCount > 0 && (
        <div className="mt-8">
          <div className="rounded-lg border border-border overflow-hidden">
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
                            • ${asset.rent_weekly.toLocaleString()}/week
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} assets
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-input text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-input text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
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
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteAssetId(null)} />
          <div className="relative z-50 w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Delete Asset</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this asset? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteAssetId(null)}
                className="flex-1 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
