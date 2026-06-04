import { useEffect, useState } from 'react'
import { getKnockout } from '../api'
import { Loading, ErrorBox, ParticipantTag, TeamName, fmtDate } from '../components/common'

const RONDAS = [
  { ronda: 1, title: 'Dieciseisavos' },
  { ronda: 2, title: 'Octavos' },
  { ronda: 3, title: 'Cuartos' },
  { ronda: 4, title: 'Semifinal' },
  { ronda: 5, title: 'Final / 3er puesto' },
]

function Slot({ name, label, owner, goles, pen, win }) {
  return (
    <div className="spread" style={{ opacity: name ? 1 : 0.6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexWrap: 'wrap' }}>
        {name ? (
          <TeamName name={name} size={36} style={{ fontWeight: win ? 800 : 600, color: win ? 'var(--gold)' : undefined }} />
        ) : (
          <span className="team" style={{ fontWeight: 600, color: 'var(--text-mute)', fontSize: '.85rem' }}>{label}</span>
        )}
        {name && <ParticipantTag ownerId={owner} small />}
      </div>
      <span className="score" style={{ minWidth: 'auto' }}>
        {goles != null ? goles : '–'}
        {pen != null && <sup className="muted" style={{ fontSize: '.65rem' }}> ({pen})</sup>}
      </span>
    </div>
  )
}

function KOCard({ m }) {
  const played = m.played
  let w1 = false, w2 = false
  if (played && m.goles_1 != null && m.goles_2 != null) {
    if (m.goles_1 > m.goles_2) w1 = true
    else if (m.goles_2 > m.goles_1) w2 = true
    else if (m.pen_1 != null && m.pen_2 != null) { w1 = m.pen_1 > m.pen_2; w2 = m.pen_2 > m.pen_1 }
  }
  return (
    <div className="card" style={{ padding: '.7rem .8rem' }}>
      <div className="spread" style={{ marginBottom: 6 }}>
        <span className="badge">{m.id}</span>
        <span className="meta muted" style={{ fontSize: '.72rem' }}>{fmtDate(m.fecha)} · {m.hora}</span>
      </div>
      <Slot name={m.team_1_name} label={m.slot_1_label} owner={m.team_1_owner} goles={m.goles_1} pen={m.pen_1} win={w1} />
      <div className="divider" style={{ margin: '.45rem 0' }} />
      <Slot name={m.team_2_name} label={m.slot_2_label} owner={m.team_2_owner} goles={m.goles_2} pen={m.pen_2} win={w2} />
    </div>
  )
}

export default function Eliminatorias() {
  const [matches, setMatches] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getKnockout().then(setMatches).catch(setError)
  }, [])

  if (error) return <ErrorBox error={error} />
  if (!matches) return <Loading />

  const byRonda = (r) => matches.filter((m) => m.ronda === r).sort((a, b) => a.orden - b.orden)

  return (
    <>
      <div className="page-head">
        <h1>Eliminatorias</h1>
        <div className="sub">
          Los cruces se completan automáticamente al cargar los resultados. Los “mejores terceros”
          se asignan a mano desde la pantalla Admin.
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', alignItems: 'flex-start' }}>
        {RONDAS.map((r) => (
          <div key={r.ronda} style={{ minWidth: 250, flex: '0 0 250px' }}>
            <h3 style={{ fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-mute)', marginBottom: '.7rem' }}>
              {r.title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
              {byRonda(r.ronda).map((m) => <KOCard key={m.id} m={m} />)}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
