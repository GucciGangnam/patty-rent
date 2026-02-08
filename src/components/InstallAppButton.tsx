import { useState, useEffect } from 'react'
import { Smartphone, AppWindowMac } from 'lucide-react'
import { useDeviceDetect } from '../hooks/useDeviceDetect'
import InstallInstructionsModal from './InstallInstructionsModal'

export default function InstallAppButton() {
  const [showModal, setShowModal] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const { isStandalone, device } = useDeviceDetect()

  const Icon = device === 'desktop' ? AppWindowMac : Smartphone

  // Shake animation every 8 seconds to draw attention
  useEffect(() => {
    if (isStandalone) return

    const triggerShake = () => {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    }

    // Initial shake after 3 seconds
    const initialTimeout = setTimeout(triggerShake, 3000)

    // Then shake every 8 seconds
    const interval = setInterval(triggerShake, 8000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [isStandalone])

  // Don't show the button if already installed as standalone app
  if (isStandalone) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`text-muted-foreground hover:text-foreground transition-colors ${isShaking ? 'animate-shake' : ''}`}
        title="Install app"
        aria-label="Install app"
      >
        <Icon className="h-5 w-5" />
      </button>

      <InstallInstructionsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}
