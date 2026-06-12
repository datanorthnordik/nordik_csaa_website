import { useLayoutEffect } from 'react'

export function syncViewportWidthCssVars() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return
  }

  const viewportWidth = window.innerWidth
  const root = document.documentElement

  root.style.setProperty('--viewport-width', `${viewportWidth}px`)
  root.style.setProperty('--viewport-half-width', `${viewportWidth / 2}px`)
}

export function ViewportWidthStyles() {
  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleViewportChange = () => {
      syncViewportWidthCssVars()
    }

    handleViewportChange()

    const { visualViewport } = window

    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('orientationchange', handleViewportChange)
    visualViewport?.addEventListener('resize', handleViewportChange)

    return () => {
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('orientationchange', handleViewportChange)
      visualViewport?.removeEventListener('resize', handleViewportChange)
    }
  }, [])

  return null
}
