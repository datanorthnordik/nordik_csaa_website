import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { NavigationMenuProvider, useNavigationMenu } from './components/NavigationMenuProvider'
import { SiteShell } from './components/SiteShell'
import { EventCalendarPage } from './pages/EventCalendarPage'
import { CmsPage } from './pages/CmsPage'
import { DigitalNewsletterDetailPage } from './pages/DigitalNewsletterDetailPage'
import { DigitalNewslettersPage } from './pages/DigitalNewslettersPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { GatheringsPage } from './pages/GatheringsPage'
import { InMemorialPage } from './pages/InMemorialPage'
import { NewsMediaLandingPage } from './pages/NewsMediaLandingPage'
import { PressArchiveDetailPage } from './pages/PressArchiveDetailPage'
import { PressArchivePage } from './pages/PressArchivePage'
import { getInitialMenuHref } from './lib/navigationMenu'

function App() {
  return (
    <BrowserRouter>
      <NavigationMenuProvider>
        <Routes>
          <Route element={<SiteShell />}>
            <Route path="/" element={<MenuLandingRedirect />} />
            <Route path="/events" element={<GatheringsPage />} />
            <Route path="/events/calendar" element={<EventCalendarPage />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            <Route path="/our-story/healing-memorials/in-memorial" element={<InMemorialPage />} />
            <Route path="/news-media" element={<NewsMediaLandingPage />} />
            <Route
              path="/news-media/digital-newsletter/:newsletterId"
              element={<DigitalNewsletterDetailPage />}
            />
            <Route
              path="/news-media/digital-newsletter"
              element={<DigitalNewslettersPage />}
            />
            <Route
              path="/news-media/press-archive/:pressId"
              element={<PressArchiveDetailPage />}
            />
            <Route
              path="/news-media/press-archive"
              element={<PressArchivePage />}
            />
            <Route path="*" element={<CmsPage />} />
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

export default App
