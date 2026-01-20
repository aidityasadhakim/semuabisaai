/**
 * API client with optional Clerk authentication
 * Provides type-safe API methods for communicating with the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
}

/**
 * Get the auth token from Clerk (if available)
 * This function should be called within a component that has access to Clerk context
 */
let getAuthToken: (() => Promise<string | null>) | null = null

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  getAuthToken = getter
}

/**
 * Make an authenticated API request
 */
export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Add auth token if available
  if (getAuthToken) {
    const token = await getAuthToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `API error: ${response.status}`)
  }

  return response.json()
}

// ====================
// API Methods
// ====================

/**
 * Health check endpoint
 */
export async function getHealth() {
  return apiFetch<{ status: string; database: string }>('/api/health')
}

// ====================
// Example CRUD Methods (uncomment and modify as needed)
// ====================

// export interface User {
//   id: number
//   email: string
//   name: string
//   created_at: string
// }

// export async function getUsers() {
//   return apiFetch<User[]>('/api/users')
// }

// export async function getUser(id: number) {
//   return apiFetch<User>(`/api/users/${id}`)
// }

// export async function createUser(data: { email: string; name: string }) {
//   return apiFetch<User>('/api/users', { method: 'POST', body: data })
// }

// export async function updateUser(id: number, data: { name: string }) {
//   return apiFetch<User>(`/api/users/${id}`, { method: 'PUT', body: data })
// }

// export async function deleteUser(id: number) {
//   return apiFetch<void>(`/api/users/${id}`, { method: 'DELETE' })
// }
