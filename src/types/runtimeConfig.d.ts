export {}

declare global {
  interface Window {
    __APP_CONFIG__?: {
      API_BASE_URL?: string
      WEBSITE_ASSET_BASE_URL?: string
    }
  }
}
