import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { pagesApi } from './api/pagesApi'
import { NavigationMenuProvider, useNavigationMenu } from './components/NavigationMenuProvider'
import { PageSuspenseFallback } from './components/PageSuspenseFallback'
import { ScrollToTop } from './components/ScrollToTop'
import { SiteShell } from './components/SiteShell'
import { resolvePageHeroImageUrl } from './components/cms/cmsPageMedia'
import { GatheringsPage } from './pages/GatheringsPage'
import { getInitialMenuHref, normalizeInternalPath } from './lib/navigationMenu'

const EventCalendarPage = lazy(() =>
  import('./pages/EventCalendarPage').then((module) => ({
    default: module.EventCalendarPage,
  })),
)
const CmsPage = lazy(() =>
  import('./pages/CmsPage').then((module) => ({
    default: module.CmsPage,
  })),
)
const DigitalNewsletterDetailPage = lazy(() =>
  import('./pages/DigitalNewsletterDetailPage').then((module) => ({
    default: module.DigitalNewsletterDetailPage,
  })),
)
const DigitalNewslettersPage = lazy(() =>
  import('./pages/DigitalNewslettersPage').then((module) => ({
    default: module.DigitalNewslettersPage,
  })),
)
const EventDetailPage = lazy(() =>
  import('./pages/EventDetailPage').then((module) => ({
    default: module.EventDetailPage,
  })),
)
const CsaaLegacyPage = lazy(() =>
  import('./pages/CsaaLegacyPage').then((module) => ({
    default: module.CsaaLegacyPage,
  })),
)
const HealingMemorialsPage = lazy(() =>
  import('./pages/HealingMemorialsPage').then((module) => ({
    default: module.HealingMemorialsPage,
  })),
)
const OurStoryPage = lazy(() =>
  import('./pages/OurStoryPage').then((module) => ({
    default: module.OurStoryPage,
  })),
)
const InMemorialPage = lazy(() =>
  import('./pages/InMemorialPage').then((module) => ({
    default: module.InMemorialPage,
  })),
)
const NewsMediaLandingPage = lazy(() =>
  import('./pages/NewsMediaLandingPage').then((module) => ({
    default: module.NewsMediaLandingPage,
  })),
)
const PressArchiveDetailPage = lazy(() =>
  import('./pages/PressArchiveDetailPage').then((module) => ({
    default: module.PressArchiveDetailPage,
  })),
)
const PressArchivePage = lazy(() =>
  import('./pages/PressArchivePage').then((module) => ({
    default: module.PressArchivePage,
  })),
)
const CommunityResourcesPage = lazy(() =>
  import('./pages/ResourcesPage').then((module) => ({
    default: module.CommunityResourcesPage,
  })),
)
const BooksTestPage = lazy(() =>
  import('./pages/BooksTestPage').then((module) => ({
    default: module.BooksTestPage,
  }))
)

const CookbookSandboxPage = lazy(() =>
  import('./pages/CookbookSandboxPage').then((module) => ({
    default: module.CookbookSandboxPage,
  }))
)

const LivingHistoryHubPage = lazy(() =>
  import('./pages/LivingHistoryHubPage').then((module) => ({
    default: module.LivingHistoryHubPage,
  })),
)
const CommunityCirclePage = lazy(() =>
  import('./pages/CommunityCirclePage').then((module) => ({
    default: module.CommunityCirclePage,
  })),
)
const CommunityCookbookPage = lazy(() =>
  import('./pages/CommunityCookbookPage').then((module) => ({
    default: module.CommunityCookbookPage,
  })),
)
const CommunityGalleryPage = lazy(() =>
  import('./pages/CommunityGalleryPage').then((module) => ({
    default: module.CommunityGalleryPage,
  })),
)
const CommunityBookshelfPage = lazy(() =>
  import('./pages/CommunityBookshelfPage').then((module) => ({
    default: module.CommunityBookshelfPage,
  })),
)

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <NavigationMenuProvider>
        <Routes>
          <Route element={<SiteShell />}>
            <Route path="/" element={<MenuLandingRedirect />} />
            <Route path="/events" element={<GatheringsPage />} />
            <Route path="/events/calendar" element={withSuspense(<EventCalendarPage />)} />
            <Route path="/events/:eventId" element={withSuspense(<EventDetailPage />)} />
            <Route path="/our-story" element={withSuspense(<OurStoryPage />)} />
            <Route
              path="/our-story/csaa-legacy"
              element={withSuspense(<CsaaLegacyPage />)}
            />
            <Route
              path="/our-story/the-csaa-legacy"
              element={withSuspense(<CsaaLegacyPage />)}
            />
            <Route
              path="/our-story/healing-memorials"
              element={withSuspense(<HealingMemorialsPage />)}
            />
            <Route
              path="/our-story/healing-memorials/in-memorial"
              element={withSuspense(<InMemorialPage />)}
            />
            <Route path="/news-media" element={withSuspense(<NewsMediaLandingPage />)} />
            <Route
              path="/news-media/digital-newsletter/:newsletterId"
              element={withSuspense(<DigitalNewsletterDetailPage />)}
            />
            <Route
              path="/news-media/digital-newsletter"
              element={withSuspense(<DigitalNewslettersPage />)}
            />
            <Route
              path="/news-media/press-archive/:pressId"
              element={withSuspense(<PressArchiveDetailPage />)}
            />
            <Route
              path="/news-media/press-archive"
              element={withSuspense(<PressArchivePage />)}
            />
            <Route
              path="/community-support-team/resources"
              element={withSuspense(<CommunityResourcesPage />)}
            />
            <Route path="/test-book" element={withSuspense(<BooksTestPage />)} />
            <Route path="/test-books" element={withSuspense(<BooksTestPage />)} />
            <Route path="/community-cookbook" element={withSuspense(<CookbookSandboxPage />)} />
            <Route
              path="/living-history-hub"
              element={withSuspense(<LivingHistoryHubPage />)}
            />
            <Route
              path="/our-story/living-history-hub"
              element={withSuspense(<LivingHistoryHubPage />)}
            />
            <Route
              path="/community-circle"
              element={withSuspense(<CommunityCirclePage />)}
            />
            <Route
              path="/community-circle/cookbook"
              element={withSuspense(<CommunityCookbookPage />)}
            />
            <Route
              path="/community-circle/gallery"
              element={withSuspense(<CommunityGalleryPage />)}
            />
            <Route
              path="/community-circle/bookshelf"
              element={withSuspense(<CommunityBookshelfPage />)}
            />
            <Route path="*" element={<CmsPageRoute />} />
          </Route>
        </Routes>
      </NavigationMenuProvider>
    </BrowserRouter>
  )
}

function MenuLandingRedirect() {
  const { menu, isLoading } = useNavigationMenu()

  if (isLoading) {
    return null
  }

  return <Navigate to={getInitialMenuHref(menu.items)} replace />
}

function CmsPageRoute() {
  const { pathname } = useLocation()
  const normalizedPath = normalizeInternalPath(pathname)

  void pagesApi
    .preloadPageBySlug(normalizedPath)
    .then((page) => {
      preloadRouteImage(resolvePageHeroImageUrl(page))
    })
    .catch(() => {})

  return withSuspense(<CmsPage />)
}

function withSuspense(content: ReactNode) {
  return <Suspense fallback={<PageSuspenseFallback />}>{content}</Suspense>
}

const preloadedRouteImages = new Set<string>()

function preloadRouteImage(imageUrl?: string | null) {
  const trimmedImageUrl = imageUrl?.trim()
  if (!trimmedImageUrl || typeof document === 'undefined' || preloadedRouteImages.has(trimmedImageUrl)) {
    return
  }

  preloadedRouteImages.add(trimmedImageUrl)

  const existingPreload = Array.from(
    document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]'),
  ).find((link) => link.getAttribute('href') === trimmedImageUrl)
  if (!existingPreload) {
    const preloadLink = document.createElement('link')
    preloadLink.rel = 'preload'
    preloadLink.as = 'image'
    preloadLink.href = trimmedImageUrl
    preloadLink.setAttribute('fetchpriority', 'high')
    document.head.appendChild(preloadLink)
  }

  const warmedImage = new Image()
  warmedImage.decoding = 'async'
  warmedImage.setAttribute('fetchpriority', 'high')
  warmedImage.src = trimmedImageUrl
}

export default App
