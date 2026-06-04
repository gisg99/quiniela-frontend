import { useEffect, useState } from 'react'
import { getGroups } from '../api'
import { Loading, ErrorBox, ParticipantTag, TeamName } from '../components/common'

export default function Grupos() {
  const [groups, setGroups] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getGroups().then(setGroups).catch(setError)
  }, [])

  if (error) return <ErrorBox error={error} />
  if (!groups) return <Loading />

  const keys = Object.keys(groups).sort()

  return (
    <>
      <div className="page-head">
        <h1>Fase de grupos</h1>
        <div className="sub">Los 2 primeros de cada grupo avanzan (+ mejores terceros). Resaltados en verde.</div>
      </div>

      <div className="grid cols-2">
        {keys.map((g) => (
          <div className="card" key={g}>
            <h3>Grupo {g}</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Equipo</th>
                  <th className="num">PJ</th>
                  <th className="num">G</th>
                  <th className="num">E</th>
                  <th className="num">P</th>
                  <th className="num">GF</th>
                  <th className="num">GC</th>
                  <th className="num">DG</th>
                  <th className="num">Pts</th>
                </tr>
              </thead>
              <tbody>
                {groups[g].map((r) => (
                  <tr key={r.team_id} className={r.pos <= 2 ? 'qualified' : ''}>
                    <td className="num muted">{r.pos}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <TeamName name={r.name} size={36} bold />
                        <ParticipantTag ownerId={r.owner_id} small />
                      </div>
                    </td>
                    <td className="num">{r.pj}</td>
                    <td className="num">{r.pg}</td>
                    <td className="num">{r.pe}</td>
                    <td className="num">{r.pp}</td>
                    <td className="num">{r.gf}</td>
                    <td className="num">{r.gc}</td>
                    <td className="num">{r.dg > 0 ? `+${r.dg}` : r.dg}</td>
                    <td className="num"><b>{r.pts}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  )
}
