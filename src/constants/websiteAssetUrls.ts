const WEBSITE_ASSET_BASE_URL =
  'https://storage.googleapis.com/nordik-csa-website-assets/assets'

function buildWebsiteAssetUrl(fileName: string) {
  return `${WEBSITE_ASSET_BASE_URL}/${encodeURIComponent(fileName)}`
}

export const WEBSITE_ASSET_URLS = {
  communitySupportTeamLogo: buildWebsiteAssetUrl('community-support-team-logo.png'),
  cryingRockHero: buildWebsiteAssetUrl('cryingrock-hero.png'),
  csaaLogo: buildWebsiteAssetUrl('csaa_logo.png'),
  everyChildMattersHero: buildWebsiteAssetUrl('every-child-matters-hero.jpg'),
  gatheringsHeroStage: buildWebsiteAssetUrl('gatherings-hero-stage.jpg'),
  healingHeroSection: buildWebsiteAssetUrl('healing hero section.jpg'),
  hero: buildWebsiteAssetUrl('hero.png'),
  image20260501: buildWebsiteAssetUrl('Image_20260501_122158_387.jpeg'),
  irsVector: buildWebsiteAssetUrl('irs_vector.jpeg'),
  makwa17: buildWebsiteAssetUrl('makwa17.jpg'),
  memorialFlower: buildWebsiteAssetUrl('memorial_flower.png'),
  reactLogo: buildWebsiteAssetUrl('react.svg'),
  shingwaukHallHero: buildWebsiteAssetUrl('shingwaukhall-hero.jpg'),
  viteLogo: buildWebsiteAssetUrl('vite.svg'),
  watercolorMeadow: buildWebsiteAssetUrl('watercolor_meadow.png'),
  wawnoshHeroSection: buildWebsiteAssetUrl('wawnosh-hero-section.jpg'),
} as const
