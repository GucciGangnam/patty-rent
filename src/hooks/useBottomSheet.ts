import { useEffect, useRef, useCallback, useState } from 'react'

interface UseBottomSheetOptions {
  isOpen: boolean
  onClose: () => void
  dismissThreshold?: number // pixels to drag before dismissing
}

interface UseBottomSheetReturn {
  sheetRef: React.RefObject<HTMLDivElement | null>
  handleRef: React.RefObject<HTMLDivElement | null>
  dragOffset: number
  isDragging: boolean
}

export function useBottomSheet({
  isOpen,
  onClose,
  dismissThreshold = 150,
}: UseBottomSheetOptions): UseBottomSheetReturn {
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const handleRef = useRef<HTMLDivElement | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const dragState = useRef({
    startY: 0,
    isDragging: false,
  })

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    const originalPosition = document.body.style.position
    const originalWidth = document.body.style.width
    const originalTop = document.body.style.top
    const scrollY = window.scrollY

    // Lock the body scroll
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.top = `-${scrollY}px`

    return () => {
      // Restore body scroll
      document.body.style.overflow = originalOverflow
      document.body.style.position = originalPosition
      document.body.style.width = originalWidth
      document.body.style.top = originalTop
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  // Handle drag-to-close
  const handleDragStart = useCallback((clientY: number) => {
    dragState.current.startY = clientY
    dragState.current.isDragging = true
    setIsDragging(true)
  }, [])

  const handleDragMove = useCallback((clientY: number) => {
    if (!dragState.current.isDragging) return

    const delta = clientY - dragState.current.startY
    // Only allow dragging down (positive delta)
    const offset = Math.max(0, delta)
    setDragOffset(offset)
  }, [])

  const handleDragEnd = useCallback(() => {
    if (!dragState.current.isDragging) return

    dragState.current.isDragging = false
    setIsDragging(false)

    if (dragOffset >= dismissThreshold) {
      onClose()
    }

    setDragOffset(0)
  }, [dragOffset, dismissThreshold, onClose])

  // Touch events
  const handleTouchStart = useCallback((e: TouchEvent) => {
    handleDragStart(e.touches[0].clientY)
  }, [handleDragStart])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    handleDragMove(e.touches[0].clientY)
  }, [handleDragMove])

  const handleTouchEnd = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  // Mouse events
  const handleMouseDown = useCallback((e: MouseEvent) => {
    handleDragStart(e.clientY)
  }, [handleDragStart])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientY)
  }, [handleDragMove])

  const handleMouseUp = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  // Attach event listeners to handle area
  useEffect(() => {
    const handle = handleRef.current
    if (!isOpen || !handle) return

    // Touch events on handle
    handle.addEventListener('touchstart', handleTouchStart, { passive: true })

    // Mouse events on handle
    handle.addEventListener('mousedown', handleMouseDown)

    return () => {
      handle.removeEventListener('touchstart', handleTouchStart)
      handle.removeEventListener('mousedown', handleMouseDown)
    }
  }, [isOpen, handleTouchStart, handleMouseDown])

  // Global move/end listeners (only when dragging)
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalTouchMove = (e: TouchEvent) => {
      handleTouchMove(e)
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e)
    }

    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('touchmove', handleGlobalTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleTouchMove, handleTouchEnd, handleMouseMove, handleMouseUp])

  return {
    sheetRef,
    handleRef,
    dragOffset,
    isDragging,
  }
}
