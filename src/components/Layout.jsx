import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Inicio', ico: '🏠', end: true },
  { to: '/grupos', label: 'Grupos', ico: '🗂️' },
  { to: '/eliminatorias', label: 'Eliminatorias', ico: '🏟️' },
  { to: '/clasificacion', label: 'Clasificación', ico: '🏆' },
  { to: '/ajustes', label: 'Ajustes', ico: '⚙️' },
  { to: '/admin', label: 'Admin', ico: '🔐' },
]

export default function Layout() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">🏆</div>
          <div>
            <b>Quiniela Mageova</b>
            <br />
            <small>Mundial 2026</small>
          </div>
        </div>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            <span className="ico">{l.ico}</span>
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
    </div>
  )
}
