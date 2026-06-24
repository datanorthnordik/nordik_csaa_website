export type RuntimeConfigKey = 'API_BASE_URL' | 'WEBSITE_ASSET_BASE_URL'

export const normalizeBaseUrl = (value: string | undefined) => {
  const trimmed = value?.trim()
  if (!trimmed) {
    return undefined
  }

  return trimmed.replace(/\/+$/, '')
}

export const getRuntimeConfigValue = (key: RuntimeConfigKey) => {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.__APP_CONFIG__?.[key]
}

export const resolveConfiguredBaseUrl = ({
  runtimeValue,
  envValue,
  fallback,
}: {
  runtimeValue: string | undefined
  envValue: string | undefined
  fallback: string
}) => normalizeBaseUrl(runtimeValue) ?? normalizeBaseUrl(envValue) ?? fallback
