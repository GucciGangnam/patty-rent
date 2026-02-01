import { useState, useEffect } from 'react'

export type DeviceType = 'ios' | 'android' | 'desktop' | 'other'
export type BrowserType = 'safari' | 'chrome' | 'firefox' | 'edge' | 'other'

interface DeviceInfo {
  device: DeviceType
  browser: BrowserType
  isStandalone: boolean
  canInstall: boolean
}

export function useDeviceDetect(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    device: 'other',
    browser: 'other',
    isStandalone: false,
    canInstall: false
  })

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()

    // Detect device type
    let device: DeviceType = 'other'
    if (/iphone|ipad|ipod/.test(userAgent)) {
      device = 'ios'
    } else if (/android/.test(userAgent)) {
      device = 'android'
    } else if (/windows|macintosh|linux/.test(userAgent) && !/mobile/.test(userAgent)) {
      device = 'desktop'
    }

    // Detect browser
    let browser: BrowserType = 'other'
    if (/edg\//.test(userAgent)) {
      browser = 'edge'
    } else if (/chrome/.test(userAgent) && !/edg\//.test(userAgent)) {
      browser = 'chrome'
    } else if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
      browser = 'safari'
    } else if (/firefox/.test(userAgent)) {
      browser = 'firefox'
    }

    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    // Determine if installation is possible
    // iOS Safari, Android Chrome, and desktop Chrome/Edge support installation
    const canInstall = !isStandalone && (
      (device === 'ios' && browser === 'safari') ||
      (device === 'android' && (browser === 'chrome' || browser === 'firefox')) ||
      (device === 'desktop' && (browser === 'chrome' || browser === 'edge'))
    )

    setDeviceInfo({
      device,
      browser,
      isStandalone,
      canInstall
    })
  }, [])

  return deviceInfo
}
