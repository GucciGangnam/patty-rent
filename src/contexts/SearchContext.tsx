import { createContext, useContext, useRef, useCallback, type ReactNode } from 'react'

interface SearchContextType {
  registerResetSearch: (resetFn: () => void) => void
  resetSearch: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const resetSearchRef = useRef<(() => void) | null>(null)

  const registerResetSearch = useCallback((resetFn: () => void) => {
    resetSearchRef.current = resetFn
  }, [])

  const resetSearch = useCallback(() => {
    resetSearchRef.current?.()
  }, [])

  return (
    <SearchContext.Provider value={{ registerResetSearch, resetSearch }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
