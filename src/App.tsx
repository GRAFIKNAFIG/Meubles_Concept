import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Studio from './pages/Studio'
import Showroom from './pages/Showroom'
import RoomPlanner from './pages/RoomPlanner'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="studio" element={<Studio />} />
          <Route path="studio/:id" element={<Studio />} />
          <Route path="showroom" element={<Showroom />} />
          <Route path="planner" element={<RoomPlanner />} />
          <Route path="planner/:id" element={<RoomPlanner />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
