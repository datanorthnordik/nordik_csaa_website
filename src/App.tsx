import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SiteShell } from './components/SiteShell'
import { EventDetailPage } from './pages/EventDetailPage'
import { GatheringsPage } from './pages/GatheringsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteShell />}>
          <Route path="/" element={<Navigate to="/gatherings" replace />} />
          <Route path="/gatherings" element={<GatheringsPage />} />
          <Route path="/gatherings/:eventId" element={<EventDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/gatherings" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
