import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { NavigationMenuProvider, useNavigationMenu } from './components/NavigationMenuProvider'
import { ScrollToTop } from './components/ScrollToTop'
import { SiteShell } from './components/SiteShell'
import { GatheringsPage } from './pages/GatheringsPage'
import { getInitialMenuHref } from './lib/navigationMenu'

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
            {/* Both slugs point to the same scrollytelling experience */}
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
            <Route path="*" element={withSuspense(<CmsPage />)} />
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

function withSuspense(content: ReactNode) {
  return <Suspense fallback={null}>{content}</Suspense>
}

export default App
