import { useEffect, useState, useCallback } from 'react'
import {
  getHealth, adminLogin, getMatches, getKnockout, getTeams,
  updateMatch, updateKnockout,
} from '../api'
import { Loading, ErrorBox, TeamName, Flag, fmtDate } from '../components/common'
import Ajustes from './Ajustes'

export default function Admin() {
  const [authChecked, setAuthChecked] = useState(false)
  const [adminRequired, setAdminRequired] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [loginErr, setLoginErr] = useState(null)
  const [tab, setTab] = useState('grupos')

  useEffect(() => {
    getHealth()
      .then((h) => {
        setAdminRequired(h.admin_required)
        if (!h.admin_required) setAuthed(true)
        else if (localStorage.getItem('admin_password')) setAuthed(true)
      })
      .catch(() => setAdminRequired(false))
      .finally(() => setAuthChecked(true))
  }, [])

  async function doLogin(e) {
    e.preventDefault()
    setLoginErr(null)
    try {
      await adminLogin(pass)
      localStorage.setItem('admin_password', pass)
      setAuthed(true)
    } catch (err) { setLoginErr(err) }
  }

  if (!authChecked) return <Loading />

  if (adminRequired && !authed) {
    return (
      <>
        <div className="page-head"><h1>Admin</h1><div className="sub">Acceso restringido</div></div>
        <div className="card" style={{ maxWidth: 380 }}>
          <h3>Iniciar sesión</h3>
          <form onSubmit={doLogin} style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
            <input type="password" placeholder="Contraseña de admin" value={pass} onChange={(e) => setPass(e.target.value)} />
            <button className="btn primary">Entrar</button>
            {loginErr && <ErrorBox error={loginErr} />}
          </form>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Admin</h1>
          <div className="sub">
            {tab === 'ajustes'
              ? 'Gestiona a los participantes, sus colores y los 4 equipos (uno por bombo) de cada quien.'
              : 'Al guardar un resultado, el bracket y los puntos se recalculan solos.'}
          </div>
        </div>
      </div>

      <div className="row" style={{ marginBottom: '1rem' }}>
        <button className={'btn' + (tab === 'grupos' ? ' primary' : '')} onClick={() => setTab('grupos')}>Fase de grupos</button>
        <button className={'btn' + (tab === 'ko' ? ' primary' : '')} onClick={() => setTab('ko')}>Eliminatorias</button>
        <button className={'btn' + (tab === 'ajustes' ? ' primary' : '')} onClick={() => setTab('ajustes')}>Participantes y equipos</button>
      </div>

      {tab === 'grupos' && <GruposAdmin />}
      {tab === 'ko' && <KnockoutAdmin />}
      {tab === 'ajustes' && <Ajustes embedded />}
    </>
  )
}

/* ---------------- Fase de grupos ---------------- */
function GruposAdmin() {
  const [matches, setMatches] = useState(null)
  const [error, setError] = useState(null)
  const load = useCallback(() => getMatches().then(setMatches).catch(setError), [])
  useEffect(() => { load() }, [load])

  if (error) return <ErrorBox error={error} />
  if (!matches) return <Loading />

  const jornadas = [1, 2, 3]
  return (
    <div className="grid cols-3">
      {jornadas.map((j) => (
        <div className="card" key={j}>
          <h3>Jornada {j}</h3>
          {matches.filter((m) => m.jornada === j).map((m) => (
            <ScoreRow
              key={m.id}
              left={m.team_1_name} right={m.team_2_name}
              meta={`G${m.grupo} · ${fmtDate(m.fecha)}`}
              g1={m.goles_1} g2={m.goles_2}
              onSave={async (g1, g2, played) => { await updateMatch(m.id, { goles_1: g1, goles_2: g2, played }); load() }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ---------------- Eliminatorias ---------------- */
function KnockoutAdmin() {
  const [matches, setMatches] = useState(null)
  const [teams, setTeams] = useState([])
  const [error, setError] = useState(null)
  const load = useCallback(() => {
    Promise.all([getKnockout(), getTeams()])
      .then(([k, t]) => { setMatches(k); setTeams(t) })
      .catch(setError)
  }, [])
  useEffect(() => { load() }, [load])

  if (error) return <ErrorBox error={error} />
  if (!matches) return <Loading />

  const rondas = [
    [1, 'Dieciseisavos'], [2, 'Octavos'], [3, 'Cuartos'], [4, 'Semifinal'], [5, 'Final / 3er puesto'],
  ]

  return (
    <div className="grid cols-2">
      {rondas.map(([r, title]) => (
        <div className="card" key={r}>
          <h3>{title}</h3>
          {matches.filter((m) => m.ronda === r).map((m) => (
            <KOEditRow key={m.id} m={m} teams={teams} onSaved={load} />
          ))}
        </div>
      ))}
    </div>
  )
}

function KOEditRow({ m, teams, onSaved }) {
  const [t1, setT1] = useState(m.team_1_id || '')
  const [t2, setT2] = useState(m.team_2_id || '')
  const [g1, setG1] = useState(m.goles_1 ?? '')
  const [g2, setG2] = useState(m.goles_2 ?? '')
  const [p1, setP1] = useState(m.pen_1 ?? '')
  const [p2, setP2] = useState(m.pen_2 ?? '')
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState(false)

  // Solo permitimos elegir equipo manualmente cuando el slot es "mejores terceros".
  const editable1 = m.slot_1_src_type === 'group' && !/^[12]° Grupo/.test(m.slot_1_label)
  const editable2 = m.slot_2_src_type === 'group' && !/^[12]° Grupo/.test(m.slot_2_label)
  const tie = g1 !== '' && g2 !== '' && Number(g1) === Number(g2)

  async function save() {
    setBusy(true)
    try {
      const body = {
        goles_1: g1 === '' ? null : Number(g1),
        goles_2: g2 === '' ? null : Number(g2),
        pen_1: p1 === '' ? null : Number(p1),
        pen_2: p2 === '' ? null : Number(p2),
        played: g1 !== '' && g2 !== '',
      }
      if (editable1) body.team_1_id = t1 === '' ? null : Number(t1)
      if (editable2) body.team_2_id = t2 === '' ? null : Number(t2)
      await updateKnockout(m.id, body)
      setOk(true); setTimeout(() => setOk(false), 1200)
      onSaved()
    } finally { setBusy(false) }
  }

  const TeamCell = ({ editable, value, setValue, name, label }) =>
    editable ? (
      <select value={value} onChange={(e) => setValue(e.target.value)} style={{ flex: 1, minWidth: 0 }}>
        <option value="">{label}</option>
        {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
    ) : name ? (
      <TeamName name={name} size={28} style={{ flex: 1, minWidth: 0 }} />
    ) : (
      <span className="team muted" style={{ flex: 1, minWidth: 0, fontSize: '.8rem' }}>{label}</span>
    )

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '.55rem .6rem', marginBottom: '.55rem' }}>
      <div className="spread" style={{ marginBottom: 4 }}>
        <span className="badge">{m.id}</span>
        <span className="muted" style={{ fontSize: '.72rem' }}>{fmtDate(m.fecha)} · {m.hora}</span>
      </div>
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <TeamCell editable={editable1} value={t1} setValue={setT1} name={m.team_1_name} label={m.slot_1_label} />
        <input className="num" style={{ width: 44 }} value={g1} onChange={(e) => setG1(e.target.value)} type="number" min="0" />
        <span className="muted">-</span>
        <input className="num" style={{ width: 44 }} value={g2} onChange={(e) => setG2(e.target.value)} type="number" min="0" />
        <TeamCell editable={editable2} value={t2} setValue={setT2} name={m.team_2_name} label={m.slot_2_label} />
      </div>
      {tie && (
        <div className="row" style={{ marginTop: 6 }}>
          <span className="muted" style={{ fontSize: '.75rem' }}>Penales:</span>
          <input className="num" style={{ width: 44 }} value={p1} onChange={(e) => setP1(e.target.value)} type="number" min="0" />
          <span className="muted">-</span>
          <input className="num" style={{ width: 44 }} value={p2} onChange={(e) => setP2(e.target.value)} type="number" min="0" />
        </div>
      )}
      <div className="row" style={{ marginTop: 6 }}>
        <button className="btn primary sm" onClick={save} disabled={busy}>Guardar</button>
        {ok && <span className="green" style={{ fontSize: '.8rem' }}>✓</span>}
      </div>
    </div>
  )
}

/* ---------------- Fila de marcador reutilizable ---------------- */
function ScoreRow({ left, right, meta, g1, g2, onSave }) {
  const [a, setA] = useState(g1 ?? '')
  const [b, setB] = useState(g2 ?? '')
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState(false)

  async function save() {
    setBusy(true)
    try {
      await onSave(a === '' ? null : Number(a), b === '' ? null : Number(b), a !== '' && b !== '')
      setOk(true); setTimeout(() => setOk(false), 1200)
    } finally { setBusy(false) }
  }

  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '.5rem 0' }}>
      <div className="muted" style={{ fontSize: '.72rem', marginBottom: 4 }}>{meta}</div>
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '.4rem', fontWeight: 600, minWidth: 0 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{left}</span>
          <Flag name={left} size={28} />
        </span>
        <input className="num" style={{ width: 56 }} value={a} onChange={(e) => setA(e.target.value)} type="number" min="0" />
        <span className="muted">-</span>
        <input className="num" style={{ width: 56 }} value={b} onChange={(e) => setB(e.target.value)} type="number" min="0" />
        <TeamName name={right} size={28} bold style={{ flex: 1 }} />
        <button className="btn sm primary" onClick={save} disabled={busy}>✓</button>
        {ok && <span className="green">✓</span>}
      </div>
    </div>
  )
}
