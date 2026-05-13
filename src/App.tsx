import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SiteShell } from './components/SiteShell'
import { EventCalendarPage } from './pages/EventCalendarPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { GatheringsPage } from './pages/GatheringsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteShell />}>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<GatheringsPage />} />
          <Route path="/events/calendar" element={<EventCalendarPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/events" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
