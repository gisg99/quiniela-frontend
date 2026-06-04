import axios from 'axios'

// En desarrollo Vite hace proxy de /api -> backend (ver vite.config.js).
// En producción puedes definir VITE_API_URL con la URL completa del backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

// Adjunta la contraseña de admin (si existe) a las peticiones de escritura.
api.interceptors.request.use((config) => {
  const pass = localStorage.getItem('admin_password')
  if (pass) config.headers['x-admin-password'] = pass
  return config
})

export default api

// --- Helpers de la API ---
export const getSummary       = () => api.get('/summary').then((r) => r.data)
export const getGroups        = () => api.get('/groups').then((r) => r.data)
export const getMatches       = () => api.get('/matches').then((r) => r.data)
export const getKnockout      = () => api.get('/knockout').then((r) => r.data)
export const getStandings     = () => api.get('/standings').then((r) => r.data)
export const getParticipants  = () => api.get('/participants').then((r) => r.data)
export const getTeams         = () => api.get('/teams').then((r) => r.data)

export const createParticipant = (data) => api.post('/participants', data).then((r) => r.data)
export const updateParticipant = (id, data) => api.put(`/participants/${id}`, data).then((r) => r.data)
export const deleteParticipant = (id) => api.delete(`/participants/${id}`).then((r) => r.data)
export const setParticipantTeams = (id, teamIds) =>
  api.put(`/participants/${id}/teams`, { team_ids: teamIds }).then((r) => r.data)

export const updateMatch    = (id, data) => api.put(`/matches/${id}`, data).then((r) => r.data)
export const updateKnockout = (id, data) => api.put(`/knockout/${id}`, data).then((r) => r.data)

export const adminLogin = (password) => api.post('/admin/login', { password }).then((r) => r.data)
export const getHealth   = () => api.get('/health').then((r) => r.data)
