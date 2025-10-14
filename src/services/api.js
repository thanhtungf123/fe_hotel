const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'
export const endpoints = { rooms: () => `${API_BASE}/rooms` }
export default API_BASE
