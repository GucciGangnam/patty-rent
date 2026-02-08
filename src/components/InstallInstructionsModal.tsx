import { X, Share, MoreVertical, Plus, Download } from 'lucide-react'
import { useDeviceDetect } from '../hooks/useDeviceDetect'

interface InstallInstructionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InstallInstructionsModal({ isOpen, onClose }: InstallInstructionsModalProps) {
  const { device, browser, os } = useDeviceDetect()

  if (!isOpen) return null

  const renderInstructions = () => {
    // iOS Safari
    if (device === 'ios' && browser === 'safari') {
      return (
        <div className="space-y-4">
          <h3 className="font-medium">Install on iPhone/iPad</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</span>
              <span className="pt-0.5">
                Tap the <Share className="inline h-4 w-4 mx-1" /> Share button at the bottom of Safari
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</span>
              <span className="pt-0.5">
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</span>
              <span className="pt-0.5">
                Tap <strong>"Add"</strong> in the top right corner
              </span>
            </li>
          </ol>
        </div>
      )
    }

    // iOS but not Safari
    if (device === 'ios' && browser !== 'safari') {
      return (
        <div className="space-y-4">
          <h3 className="font-medium">Install on iPhone/iPad</h3>
          <p className="text-sm text-muted-foreground">
            To install PattyRent, please open this page in <strong>Safari</strong>. Other browsers on iOS don't support adding apps to the home screen.
          </p>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</span>
              <span className="pt-0.5">Copy the URL from the address bar</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</span>
              <span className="pt-0.5">Open Safari and paste the URL</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</span>
              <span className="pt-0.5">Follow the instructions to add to home screen</span>
            </li>
          </ol>
        </div>
      )
    }

    // Android Chrome
    if (device === 'android' && browser === 'chrome') {
      return (
        <div className="space-y-4">
          <h3 className="font-medium">Install on Android</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</span>
              <span className="pt-0.5">
                Tap the <MoreVertical className="inline h-4 w-4 mx-1" /> menu icon in the top right
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</span>
              <span className="pt-0.5">
                Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</span>
              <span className="pt-0.5">
                Tap <strong>"Install"</strong> to confirm
              </span>
            </li>
          </ol>
        </div>
      )
    }

    // Android other browsers
    if (device === 'android') {
      return (
        <div className="space-y-4">
          <h3 className="font-medium">Install on Android</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</span>
              <span className="pt-0.5">
                Open the browser menu (usually <MoreVertical className="inline h-4 w-4 mx-1" /> three dots)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</span>
              <span className="pt-0.5">
                Look for <strong>"Install"</strong>, <strong>"Add to Home screen"</strong>, or similar option
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</span>
              <span className="pt-0.5">Confirm the installation</span>
            </li>
          </ol>
        </div>
      )
    }

    // macOS Safari - Add to Dock
    if (device === 'desktop' && os === 'macos' && browser === 'safari') {
      return (
        <div className="space-y-4">
          <h3 className="font-medium">Add to Dock on Mac</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</span>
              <span className="pt-0.5">
                Click <strong>File</strong> in the menu bar at the top of your screen
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</span>
              <span className="pt-0.5">
                Select <strong>"Add to Dock"</strong>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</span>
              <span className="pt-0.5">PattyRent will appear in your Dock as a standalone app</span>
            </li>
          </ol>
          <p className="text-xs text-muted-foreground">
            The app will open without browser tabs or URL bar, just like a native app.
          </p>
        </div>
      )
    }

    // Desktop Chrome/Edge
    if (device === 'desktop' && (browser === 'chrome' || browser === 'edge')) {
      return (
        <div className="space-y-4">
          <h3 className="font-medium">Install on Desktop</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</span>
              <span className="pt-0.5">
                Look for the <Download className="inline h-4 w-4 mx-1" /> install icon in the address bar (right side)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</span>
              <span className="pt-0.5">
                Click the icon and select <strong>"Install"</strong>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</span>
              <span className="pt-0.5">PattyRent will open as a standalone app</span>
            </li>
          </ol>
          <p className="text-xs text-muted-foreground">
            Alternatively, click the <MoreVertical className="inline h-3 w-3 mx-0.5" /> menu and select "Install PattyRent..."
          </p>
        </div>
      )
    }

    // macOS with unsupported browser
    if (device === 'desktop' && os === 'macos') {
      return (
        <div className="space-y-4">
          <h3 className="font-medium">Add to Dock on Mac</h3>
          <p className="text-sm text-muted-foreground">
            To add PattyRent to your Dock, open this page in <strong>Safari</strong> and use File → Add to Dock.
          </p>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</span>
              <span className="pt-0.5">Copy the URL from the address bar</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</span>
              <span className="pt-0.5">Open Safari and paste the URL</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</span>
              <span className="pt-0.5">
                Click <strong>File</strong> → <strong>Add to Dock</strong>
              </span>
            </li>
          </ol>
          <p className="text-xs text-muted-foreground">
            Alternatively, you can use Chrome or Edge to install as a desktop app.
          </p>
        </div>
      )
    }

    // Default/other browsers
    return (
      <div className="space-y-4">
        <h3 className="font-medium">Install PattyRent</h3>
        <p className="text-sm text-muted-foreground">
          For the best experience, we recommend using:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <strong>Safari</strong> on iPhone/iPad or Mac
          </li>
          <li className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <strong>Chrome</strong> on Android
          </li>
          <li className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <strong>Chrome</strong> or <strong>Edge</strong> on desktop
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          These browsers support adding PattyRent to your home screen or installing it as an app.
        </p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Download className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Install App</h2>
        </div>

        {renderInstructions()}

        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
