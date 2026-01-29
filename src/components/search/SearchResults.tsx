import { useState } from 'react'
import { Search, Loader2, RotateCcw } from 'lucide-react'
import SearchResultCard from './SearchResultCard'
import AssetViewModal from '../property/view/AssetViewModal'
import type { SearchResult } from '../../types/search'

interface SearchResultsProps {
  results: SearchResult[]
  loading: boolean
  onNewSearch: () => void
}

export default function SearchResults({ results, loading, onNewSearch }: SearchResultsProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium">No properties found</p>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Try adjusting your search criteria
        </p>
        <button
          type="button"
          onClick={onNewSearch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          New Search
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {results.length} propert{results.length !== 1 ? 'ies' : 'y'} found
          </p>
          <button
            type="button"
            onClick={onNewSearch}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            New Search
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.map(result => (
            <SearchResultCard
              key={result.id}
              result={result}
              onClick={() => setSelectedAssetId(result.id)}
            />
          ))}
        </div>
      </div>

      <AssetViewModal
        isOpen={selectedAssetId !== null}
        assetId={selectedAssetId}
        onClose={() => setSelectedAssetId(null)}
      />
    </>
  )
}
