import { useParticipants } from '../lib/participants'
import { flagUrl } from '../lib/flags'

// Bandera de una selección. Si no hay nombre/código, no muestra nada.
export function Flag({ name, size = 18, style }) {
  const url = name ? flagUrl(name, 80) : null
  if (!url) return null
  return (
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      style={{
        aspectRatio: '1 / 1',
        borderRadius: '16px 0',
        objectFit: 'cover',
        boxShadow: '0 0 0 1px rgba(255,255,255,.12)',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}

// Nombre de equipo con su bandera al lado.
export function TeamName({ name, size = 18, bold, style, className }) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '.45rem', minWidth: 0, fontWeight: bold ? 700 : undefined, ...style }}
    >
      <Flag name={name} size={size} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
    </span>
  )
}

// Convierte un color hex (#rrggbb) a "rgba(r,g,b,a)"
function hexToRgba(hex, a) {
  const h = (hex || '#3b82f6').replace('#', '')
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = parseInt(n.slice(0, 2), 16)
  const g = parseInt(n.slice(2, 4), 16)
  const b = parseInt(n.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${a})`
}

// Etiqueta de participante con su color. Si no hay owner, muestra "Libre".
export function ParticipantTag({ ownerId, fallback = 'Libre', small }) {
  const { map } = useParticipants()
  const p = ownerId ? map[ownerId] : null
  if (!p) {
    return <span className="tag empty" style={small ? { fontSize: '.7rem' } : undefined}>{fallback}</span>
  }
  return (
    <span
      className="tag"
      style={{
        color: p.color,
        background: hexToRgba(p.color, 0.14),
        borderColor: hexToRgba(p.color, 0.4),
        fontSize: small ? '.7rem' : undefined,
      }}
    >
      <span className="dot" />
      {p.name}
    </span>
  )
}

export function Loading({ text = 'Cargando…' }) {
  return (
    <div className="center">
      <div>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p className="muted">{text}</p>
      </div>
    </div>
  )
}

export function ErrorBox({ error }) {
  const msg = error?.response?.data?.error || error?.message || 'Ocurrió un error'
  return <div className="error-box">⚠️ {msg}</div>
}

export const money = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(n || 0)

// Acepta tanto 'YYYY-MM-DD' como un ISO completo ('...T...Z') y evita
// corrimientos de zona horaria usando solo la parte de la fecha.
const parseDate = (iso) => {
  if (!iso) return null
  const ymd = String(iso).slice(0, 10) // 'YYYY-MM-DD'
  const d = new Date(ymd + 'T12:00:00')
  return isNaN(d) ? null : d
}

export const fmtDate = (iso) => {
  const d = parseDate(iso)
  return d ? d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : ''
}

export const fmtDateLong = (iso) => {
  const d = parseDate(iso)
  return d ? d.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' }) : ''
}
