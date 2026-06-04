import { useEffect, useState } from 'react'
import { getStandings } from '../api'
import { Loading, ErrorBox, TeamName, money } from '../components/common'

const medal = (rank) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank)
const bomboLabel = { 1: 'B1 · Fuerte', 2: 'B2 · Bueno', 3: 'B3 · Regular', 4: 'B4 · Malo' }

export default function Clasificacion() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [open, setOpen] = useState({})

  useEffect(() => {
    getStandings().then(setData).catch(setError)
  }, [])

  if (error) return <ErrorBox error={error} />
  if (!data) return <Loading />

  const { standings, total_points, prize_total } = data
  const toggle = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }))

  return (
    <>
      <div className="page-head">
        <h1>Clasificación completa</h1>
        <div className="sub">
          {total_points} pts en juego · Premio {money(prize_total)} repartido proporcionalmente.
          Toca una fila para ver el desglose.
        </div>
      </div>

      {standings.length === 0 && (
        <div className="notice">Aún no hay participantes. Agrégalos en la pantalla de Ajustes.</div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th className="num">#</th>
              <th>Participante</th>
              <th className="num">Equipos vivos</th>
              <th className="num">Puntos</th>
              <th className="num">% del bote</th>
              <th className="num">Le toca</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => (
              <RowGroup key={s.id} s={s} open={open[s.id]} onToggle={() => toggle(s.id)} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )

  function RowGroup({ s, open, onToggle }) {
    return (
      <>
        <tr onClick={onToggle} style={{ cursor: 'pointer' }}>
          <td className="num"><span className="rank-medal">{medal(s.rank)}</span></td>
          <td>
            <div className="row">
              <span className="dot" style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
              <b>{s.name}</b>
              <span className="muted" style={{ fontSize: '.75rem' }}>{open ? '▲' : '▼'}</span>
            </div>
          </td>
          <td className="num">{s.alive_teams}/{s.teams_count}</td>
          <td className="num"><span className="pill-pts">{s.points}</span></td>
          <td className="num">{(s.share * 100).toFixed(1)}%</td>
          <td className="num"><b className="green">{money(s.money)}</b></td>
        </tr>
        {open && (
          <tr>
            <td colSpan={6} style={{ background: 'var(--bg-2)', padding: '0 .5rem .6rem' }}>
              {s.teams.length === 0 ? (
                <p className="muted" style={{ padding: '.6rem' }}>Sin equipos asignados.</p>
              ) : (
                <table style={{ fontSize: '.82rem' }}>
                  <thead>
                    <tr>
                      <th>Bombo</th>
                      <th>Equipo</th>
                      <th>Grupo</th>
                      <th>Estado</th>
                      <th className="num">Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.teams.map((t) => (
                      <tr key={t.team_id} style={{ opacity: t.eliminated ? 0.55 : 1 }}>
                        <td className="muted">{bomboLabel[t.bombo]}</td>
                        <td><TeamName name={t.name} size={32} bold /></td>
                        <td className="muted">{t.grupo}</td>
                        <td>
                          <span className={'badge' + (t.alive && t.stage !== 'none' ? ' live' : '')}>
                            {t.stage_label}
                          </span>
                        </td>
                        <td className="num"><b>{t.points}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </td>
          </tr>
        )}
      </>
    )
  }
}
