import { useState } from 'react'
import { Smartphone } from 'lucide-react'
import { useDeviceDetect } from '../hooks/useDeviceDetect'
import InstallInstructionsModal from './InstallInstructionsModal'

export default function InstallAppButton() {
  const [showModal, setShowModal] = useState(false)
  const { isStandalone } = useDeviceDetect()

  // Don't show the button if already installed as standalone app
  if (isStandalone) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="Install app"
        aria-label="Install app"
      >
        <Smartphone className="h-5 w-5" />
      </button>

      <InstallInstructionsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}
