import { NavLink, Outlet } from 'react-router-dom'
import { Home, LayoutGrid, Swords, Trophy, Settings } from 'lucide-react'
import logo from '../assets/logo.png'

const links = [
  { to: '/', label: 'Inicio', Icon: Home, end: true },
  { to: '/grupos', label: 'Grupos', Icon: LayoutGrid },
  { to: '/eliminatorias', label: 'Eliminatorias', Icon: Swords },
  { to: '/clasificacion', label: 'Clasificación', Icon: Trophy },
  { to: '/admin', label: 'Admin', Icon: Settings },
]

export default function Layout() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img src={logo} alt="Quiniela Mageova" style={{ width: '100%' }} />
        </div>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            <span className="ico"><l.Icon size={20} strokeWidth={2} /></span>
            {l.label}
          </NavLink>
        ))}
        <div className="sidebar-foot">
          12 participantes · 48 equipos
          <br />Premio total $6,000
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => 'bottom-link' + (isActive ? ' active' : '')}
          >
            <span className="ico"><l.Icon size={22} strokeWidth={2} /></span>
            <span className="lbl">{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
