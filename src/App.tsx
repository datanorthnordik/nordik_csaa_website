import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { NavigationMenuProvider, useNavigationMenu } from './components/NavigationMenuProvider'
import { SiteShell } from './components/SiteShell'
import { EventCalendarPage } from './pages/EventCalendarPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { GatheringsPage } from './pages/GatheringsPage'
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
            <Route path="*" element={<ComingSoonPage />} />
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
