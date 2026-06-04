import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getParticipants } from '../api'

const Ctx = createContext({ participants: [], map: {}, reload: () => {}, loading: true })

export function ParticipantsProvider({ children }) {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    try {
      const data = await getParticipants()
      setParticipants(data)
    } catch {
      /* el backend puede no estar listo todavía */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  const map = Object.fromEntries(participants.map((p) => [p.id, p]))
  return <Ctx.Provider value={{ participants, map, reload, loading }}>{children}</Ctx.Provider>
}

export const useParticipants = () => useContext(Ctx)
