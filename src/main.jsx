import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { ParticipantsProvider } from './lib/participants'
import Layout from './components/Layout'
import Inicio from './pages/Inicio'
import Grupos from './pages/Grupos'
import Eliminatorias from './pages/Eliminatorias'
import Clasificacion from './pages/Clasificacion'
import Ajustes from './pages/Ajustes'
import Admin from './pages/Admin'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ParticipantsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/grupos" element={<Grupos />} />
            <Route path="/eliminatorias" element={<Eliminatorias />} />
            <Route path="/clasificacion" element={<Clasificacion />} />
            <Route path="/ajustes" element={<Ajustes />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ParticipantsProvider>
  </StrictMode>,
)
