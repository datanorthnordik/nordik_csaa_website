const WEBSITE_ASSET_BASE_URL =
  'https://storage.googleapis.com/nordik-csa-website-assets/assets'

function buildWebsiteAssetUrl(fileName: string) {
  return `${WEBSITE_ASSET_BASE_URL}/${encodeURIComponent(fileName)}`
}

export const WEBSITE_ASSET_URLS = {
  canoeVector: buildWebsiteAssetUrl('canoe_vector.webp'),
  communitySupportTeamLogo: buildWebsiteAssetUrl('community-support-team-logo.webp'),
  cryingRockHero: buildWebsiteAssetUrl('cryingrock-hero.webp'),
  csaaLogo: buildWebsiteAssetUrl('csaa_logo.webp'),
  drShirleyHorn: buildWebsiteAssetUrl('Dr Shirley Horn.webp'),
  everyChildMattersHero: buildWebsiteAssetUrl('every-child-matters-hero.webp'),
  gatheringsHeroStage: buildWebsiteAssetUrl('gatherings-hero-stage.webp'),
  healingHeroSection: buildWebsiteAssetUrl('healing hero section.webp'),
  hero: buildWebsiteAssetUrl('hero.webp'),
  image20260501: buildWebsiteAssetUrl('Image_20260501_122158_387.webp'),
  irsVector: buildWebsiteAssetUrl('irs_vector.webp'),
  irsVectorPng: buildWebsiteAssetUrl('irs_vector.webp'),
  makwa17: buildWebsiteAssetUrl('makwa17.webp'),
  memorialFlower: buildWebsiteAssetUrl('memorial_flower.webp'),
  planeVector: buildWebsiteAssetUrl('plane_vector.webp'),
  reactLogo: buildWebsiteAssetUrl('react.svg'),
  rememberVector: buildWebsiteAssetUrl('remeber_vector.webp'),
  returnHomeVector: buildWebsiteAssetUrl('returnHome_vector.webp'),
  shingwaukHallHero: buildWebsiteAssetUrl('shingwaukhall-hero.webp'),
  shirleySignature: buildWebsiteAssetUrl("shirley' signature.webp"),
  srscLogo: buildWebsiteAssetUrl('srsc_logo.webp'),
  buggyVector: buildWebsiteAssetUrl('buggy_vector.webp'),
  modelTVector: buildWebsiteAssetUrl('model_t_vector.webp'),
  trainVector: buildWebsiteAssetUrl('train_vector.webp'),
  viteLogo: buildWebsiteAssetUrl('vite.svg'),
  watercolorMeadow: buildWebsiteAssetUrl('watercolor_meadow.webp'),
  wawnoshHeroSection: buildWebsiteAssetUrl('wawnosh-hero-section.webp'),
  mediaLanding: buildWebsiteAssetUrl('media_landing.webp'),
} as const
