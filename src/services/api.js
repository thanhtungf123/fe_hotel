const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'
export const endpoints = { 
    rooms: () => `${API_BASE}/rooms`,

  // --- Admin endpoints ---
//   accounts: () => `${API_BASE}/admin/accounts`,
//   employees: () => `${API_BASE}/admin/employees`,
//   employeeById: (id) => `${API_BASE}/admin/employees/${id}`,

}
export default API_BASE
