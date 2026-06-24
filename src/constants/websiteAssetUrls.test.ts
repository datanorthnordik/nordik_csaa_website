import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  WEBSITE_ASSET_BASE_URL,
  buildWebsiteAssetUrl,
  resolveWebsiteAssetBaseUrl,
} from './websiteAssetUrls'

describe('websiteAssetUrls', () => {
  afterEach(() => {
    window.__APP_CONFIG__ = undefined
    vi.unstubAllEnvs()
  })

  it('falls back to the default website asset base URL', () => {
    expect(WEBSITE_ASSET_BASE_URL).toBe(
      'https://storage.googleapis.com/nordik-csa-website-assets/assets',
    )
  })

  it('prefers the Cloud Run runtime website asset base URL when present', () => {
    window.__APP_CONFIG__ = {
      WEBSITE_ASSET_BASE_URL: 'https://assets.example.com/public/',
    }

    expect(resolveWebsiteAssetBaseUrl()).toBe('https://assets.example.com/public')
  })

  it('falls back to the Vite website asset base URL for local builds', () => {
    vi.stubEnv('VITE_WEBSITE_ASSET_BASE_URL', 'https://local-assets.example.com/')

    expect(resolveWebsiteAssetBaseUrl()).toBe('https://local-assets.example.com')
  })

  it('encodes file names when building asset URLs', () => {
    expect(buildWebsiteAssetUrl('hero image.webp')).toBe(
      `${WEBSITE_ASSET_BASE_URL}/hero%20image.webp`,
    )
  })
})
