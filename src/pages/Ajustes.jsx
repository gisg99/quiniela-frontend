import { useEffect, useState, useCallback } from 'react'
import {
  getTeams, createParticipant, updateParticipant, deleteParticipant, setParticipantTeams,
} from '../api'
import { useParticipants } from '../lib/participants'
import { Loading, ErrorBox, Flag } from '../components/common'

const BOMBOS = [
  { n: 1, label: 'Bombo 1 · Fuerte' },
  { n: 2, label: 'Bombo 2 · Bueno' },
  { n: 3, label: 'Bombo 3 · Regular' },
  { n: 4, label: 'Bombo 4 · Malo' },
]
const PRESET = ['#ef4444', '#f97316', '#f4c430', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#a3e635', '#fb7185', '#f59e0b']

export default function Ajustes() {
  const { participants, reload } = useParticipants()
  const [teams, setTeams] = useState(null)
  const [error, setError] = useState(null)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET[5])
  const [busy, setBusy] = useState(false)

  const loadTeams = useCallback(() => {
    getTeams().then(setTeams).catch(setError)
  }, [])
  useEffect(() => { loadTeams() }, [loadTeams])

  if (error) return <ErrorBox error={error} />
  if (!teams) return <Loading />

  const teamsByBombo = (b) => teams.filter((t) => t.bombo === b)

  async function refreshAll() {
    await reload()
    loadTeams()
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setBusy(true)
    try {
      await createParticipant({ name: newName.trim(), color: newColor })
      setNewName('')
      await refreshAll()
    } catch (err) { setError(err) } finally { setBusy(false) }
  }

  return (
    <>
      <div className="page-head">
        <h1>Ajustes</h1>
        <div className="sub">Gestiona a los participantes, sus colores y los 4 equipos (uno por bombo) de cada quien.</div>
      </div>

      {/* Alta de participante */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Agregar participante</h3>
        <form className="row" onSubmit={handleCreate}>
          <input
            placeholder="Nombre"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 1, minWidth: 180 }}
          />
          <ColorPicker value={newColor} onChange={setNewColor} />
          <button className="btn primary" disabled={busy || !newName.trim()}>+ Agregar</button>
        </form>
        {participants.length >= 12 && (
          <p className="muted" style={{ marginTop: '.6rem' }}>Ya tienes {participants.length} participantes (lo previsto eran 12).</p>
        )}
      </div>

      {participants.length === 0 && (
        <div className="notice">Agrega a las 12 personas y luego asígnale a cada una sus 4 equipos.</div>
      )}

      <div className="grid cols-2">
        {participants.map((p) => (
          <ParticipantCard
            key={p.id}
            p={p}
            teamsByBombo={teamsByBombo}
            allTeams={teams}
            onChanged={refreshAll}
            onError={setError}
          />
        ))}
      </div>
    </>
  )
}

function ColorPicker({ value, onChange }) {
  return (
    <div className="row" style={{ gap: 4 }}>
      {PRESET.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          title={c}
          style={{
            width: 22, height: 22, borderRadius: '50%', background: c,
            border: value === c ? '2px solid #fff' : '2px solid transparent',
          }}
        />
      ))}
    </div>
  )
}

function ParticipantCard({ p, teamsByBombo, allTeams, onChanged, onError }) {
  const [name, setName] = useState(p.name)
  const [color, setColor] = useState(p.color)
  const [sel, setSel] = useState(() => {
    const m = {}
    for (const t of p.teams) m[t.bombo] = t.team_id
    return m
  })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  // team_id -> owner (para deshabilitar los ya tomados por otros)
  const ownerByTeam = {}
  for (const t of allTeams) if (t.owner_id) ownerByTeam[t.id] = t.owner_id

  async function saveMeta() {
    setBusy(true)
    try {
      await updateParticipant(p.id, { name: name.trim() || p.name, color })
      await onChanged()
      setMsg('Guardado ✓')
    } catch (e) { onError(e) } finally { setBusy(false); setTimeout(() => setMsg(null), 1500) }
  }

  async function saveTeams() {
    const ids = Object.values(sel).filter(Boolean)
    setBusy(true)
    try {
      await setParticipantTeams(p.id, ids)
      await onChanged()
      setMsg('Equipos guardados ✓')
    } catch (e) { onError(e); setMsg(null) } finally { setBusy(false); setTimeout(() => setMsg(null), 1500) }
  }

  async function remove() {
    if (!confirm(`¿Eliminar a ${p.name}?`)) return
    setBusy(true)
    try { await deleteParticipant(p.id); await onChanged() }
    catch (e) { onError(e) } finally { setBusy(false) }
  }

  return (
    <div className="card">
      <div className="spread" style={{ marginBottom: '.8rem' }}>
        <div className="row" style={{ flex: 1 }}>
          <span style={{ width: 14, height: 14, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
        </div>
        <button className="btn danger sm" onClick={remove} disabled={busy}>Eliminar</button>
      </div>

      <ColorPicker value={color} onChange={setColor} />
      <div className="row" style={{ marginTop: '.6rem' }}>
        <button className="btn sm" onClick={saveMeta} disabled={busy}>Guardar nombre/color</button>
        {msg && <span className="green" style={{ fontSize: '.8rem' }}>{msg}</span>}
      </div>

      <div className="divider" />

      <h3 style={{ marginBottom: '.6rem' }}>Equipos asignados</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        {BOMBOS.map((b) => (
          <div className="spread" key={b.n}>
            <span className="muted" style={{ fontSize: '.8rem', flex: '0 0 120px' }}>{b.label}</span>
            <Flag name={allTeams.find((t) => t.id === sel[b.n])?.name} size={36} />
            <select
              value={sel[b.n] || ''}
              onChange={(e) => setSel((s) => ({ ...s, [b.n]: e.target.value ? Number(e.target.value) : '' }))}
              style={{ flex: 1 }}
            >
              <option value="">— Sin asignar —</option>
              {teamsByBombo(b.n).map((t) => {
                const owner = ownerByTeam[t.id]
                const takenByOther = owner && owner !== p.id
                return (
                  <option key={t.id} value={t.id} disabled={takenByOther}>
                    {t.name} (Grupo {t.grupo}){takenByOther ? ' — ocupado' : ''}
                  </option>
                )
              })}
            </select>
          </div>
        ))}
      </div>
      <button className="btn primary sm" onClick={saveTeams} disabled={busy} style={{ marginTop: '.7rem' }}>
        Guardar equipos
      </button>
    </div>
  )
}
