import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Studio from './pages/Studio'
import Showroom from './pages/Showroom'
import RoomPlanner from './pages/RoomPlanner'
import KitchenProjects from './pages/KitchenProjects'
import KitchenProject from './pages/KitchenProject'
import WardrobeProjects from './pages/WardrobeProjects'
import WardrobeProject from './pages/WardrobeProject'
import CabinetTemplates from './pages/CabinetTemplates'

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
          <Route path="templates" element={<CabinetTemplates />} />
          <Route path="kitchen" element={<KitchenProjects />} />
          <Route path="kitchen/:id" element={<KitchenProject />} />
          <Route path="wardrobe" element={<WardrobeProjects />} />
          <Route path="wardrobe/:id" element={<WardrobeProject />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
