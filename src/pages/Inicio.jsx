import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { getSummary } from '../api'
import { Loading, ErrorBox, ParticipantTag, TeamName, money, fmtDateLong } from '../components/common'

const medals = ['🥇', '🥈', '🥉']

export default function Inicio() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getSummary().then(setData).catch(setError)
  }, [])

  if (error) return <ErrorBox error={error} />
  if (!data) return <Loading />

  const { next_matches, standings, total_points, prize_total, progress, alive_by_participant } = data
  const top3 = standings.slice(0, 3)
  const totalMatches = progress.group_total + progress.ko_total
  const playedMatches = progress.group_played + progress.ko_played
  const pct = totalMatches ? Math.round((playedMatches / totalMatches) * 100) : 0
  const chartData = [...alive_by_participant].sort((a, b) => b.alive - a.alive)

  return (
    <>
      <div className="page-head">
        <h1>Resumen general</h1>
        <div className="sub">Vista rápida de la quiniela del Mundial 2026</div>
      </div>

      {/* KPIs */}
      <div className="grid cols-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <span className="lbl">Premio total</span>
          <span className="big gold">{money(prize_total)}</span>
        </div>
        <div className="card stat">
          <span className="lbl">Puntos repartidos</span>
          <span className="big green">{total_points}</span>
        </div>
        <div className="card stat">
          <span className="lbl">Participantes</span>
          <span className="big">{standings.length}</span>
        </div>
        <div className="card stat">
          <span className="lbl">Avance del torneo</span>
          <span className="big">{pct}%</span>
          <div className="progress-bar" style={{ marginTop: '.3rem' }}>
            <i style={{ width: `${pct}%` }} />
          </div>
          <span className="lbl">{playedMatches}/{totalMatches} partidos</span>
        </div>
      </div>

      <div className="grid cols-2">
        {/* Próximos partidos */}
        <div className="card">
          <h3>Próximos partidos</h3>
          {next_matches.length === 0 && <p className="muted">No hay partidos pendientes. 🎉</p>}
          {next_matches.map((m) => (
            <div className="match" key={m.kind + m.id}>
              <div className="side" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <TeamName name={m.team_1 || 'Por definir'} size={36} bold />
                <ParticipantTag ownerId={m.team_1_owner} small />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="vs">vs</div>
                <div className="meta">{fmtDateLong(m.fecha)} · {m.hora}</div>
                <div className="badge" style={{ marginTop: 4 }}>{m.fase}</div>
              </div>
              <div className="side right" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                <TeamName name={m.team_2 || 'Por definir'} size={36} bold />
                <ParticipantTag ownerId={m.team_2_owner} small />
              </div>
            </div>
          ))}
        </div>

        {/* Top 3 */}
        <div className="card">
          <h3>Top 3 del ranking</h3>
          {top3.length === 0 && <p className="muted">Aún no hay participantes registrados.</p>}
          {top3.map((s, i) => (
            <div className="match" key={s.id} style={{ gridTemplateColumns: 'auto 1fr auto' }}>
              <span className="rank-medal">{medals[i]}</span>
              <div className="side">
                <span className="team">{s.name}</span>
                <span className="meta">{s.alive_teams} equipos vivos · {money(s.money)}</span>
              </div>
              <span className="pill-pts">{s.points} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Equipos vivos por participante */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>Equipos que le quedan a cada quien</h3>
        {chartData.length === 0 ? (
          <p className="muted">Registra participantes y asígnales equipos en Ajustes.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 34)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
              <XAxis type="number" domain={[0, 4]} tickCount={5} stroke="#6b7894" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={110} stroke="#9aa7c2" tick={{ fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{ background: '#151f36', border: '1px solid #25324f', borderRadius: 10 }}
                formatter={(v) => [`${v} equipos vivos`, '']}
              />
              <Bar dataKey="alive" radius={[0, 6, 6, 0]} barSize={18}>
                {chartData.map((d) => <Cell key={d.id} fill={d.color || '#3b82f6'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  )
}
