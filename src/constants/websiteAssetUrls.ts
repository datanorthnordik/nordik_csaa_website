const WEBSITE_ASSET_BASE_URL =
  'https://storage.googleapis.com/nordik-csa-website-assets/assets'

function buildWebsiteAssetUrl(fileName: string) {
  return `${WEBSITE_ASSET_BASE_URL}/${encodeURIComponent(fileName)}`
}

export const WEBSITE_ASSET_URLS = {
  canoeVector: buildWebsiteAssetUrl('canoe_vector.png'),
  communitySupportTeamLogo: buildWebsiteAssetUrl('community-support-team-logo.png'),
  cryingRockHero: buildWebsiteAssetUrl('cryingrock-hero.png'),
  csaaLogo: buildWebsiteAssetUrl('csaa_logo.png'),
  drShirleyHorn: buildWebsiteAssetUrl('Dr Shirley Horn.jpg'),
  everyChildMattersHero: buildWebsiteAssetUrl('every-child-matters-hero.jpg'),
  gatheringsHeroStage: buildWebsiteAssetUrl('gatherings-hero-stage.jpg'),
  healingHeroSection: buildWebsiteAssetUrl('healing hero section.jpg'),
  hero: buildWebsiteAssetUrl('hero.png'),
  image20260501: buildWebsiteAssetUrl('Image_20260501_122158_387.jpeg'),
  irsVector: buildWebsiteAssetUrl('irs_vector.jpeg'),
  irsVectorPng: buildWebsiteAssetUrl('irs_vector.png'),
  makwa17: buildWebsiteAssetUrl('makwa17.jpg'),
  memorialFlower: buildWebsiteAssetUrl('memorial_flower.png'),
  planeVector: buildWebsiteAssetUrl('plane_vector.png'),
  reactLogo: buildWebsiteAssetUrl('react.svg'),
  rememberVector: buildWebsiteAssetUrl('remeber_vector.png'),
  returnHomeVector: buildWebsiteAssetUrl('returnHome_vector.png'),
  shingwaukHallHero: buildWebsiteAssetUrl('shingwaukhall-hero.jpg'),
  shirleySignature: buildWebsiteAssetUrl("shirley' signature.png"),
  srscLogo: buildWebsiteAssetUrl('srsc_logo.png'),
  buggyVector: buildWebsiteAssetUrl('buggy_vector.png'),
  modelTVector: buildWebsiteAssetUrl('model_t_vector.png'),
  trainVector: buildWebsiteAssetUrl('train_vector.png'),
  viteLogo: buildWebsiteAssetUrl('vite.svg'),
  watercolorMeadow: buildWebsiteAssetUrl('watercolor_meadow.png'),
  wawnoshHeroSection: buildWebsiteAssetUrl('wawnosh-hero-section.jpg'),
  mediaLanding: buildWebsiteAssetUrl('media_landing.jpg'),
} as const
