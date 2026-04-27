import axios from 'axios'
import { tokenStorage } from './tokenStorage'

const baseURL =
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') +
  (import.meta.env.VITE_API_AUDIENCE_PREFIX || '/v1/host')

/**
 * Primary axios instance. Feature code calls relative paths like
 * `/auth/login-password`; the audience prefix is baked into the baseURL.
 */
export const http = axios.create({
  baseURL,
  timeout: 30_000,
  headers: { Accept: 'application/json' },
})

/**
 * Refresh-only instance. No auth interceptor, so a 401 here can't loop back
 * into another refresh.
 */
const refreshHttp = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

let onUnauthenticated = null

/**
 * The auth store registers a callback so the interceptor can sign the user
 * out without importing the store (which would create a circular dep).
 */
export function setUnauthenticatedHandler(fn) {
  onUnauthenticated = fn
}

http.interceptors.request.use((config) => {
  if (config._skipAuth) return config
  const token = tokenStorage.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// --- Single-flight refresh: coalesce concurrent 401s onto one refresh call.
let inflightRefresh = null

async function refreshTokens() {
  if (inflightRefresh) return inflightRefresh
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return Promise.resolve(false)

  inflightRefresh = (async () => {
    try {
      const res = await refreshHttp.post('/auth/refresh', { refreshToken })
      tokenStorage.rotateTokens({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        expiresIn: res.data.expiresIn,
      })
      return true
    } catch {
      return false
    } finally {
      inflightRefresh = null
    }
  })()

  return inflightRefresh
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {}
    const status = error.response?.status

    if (
      status === 401 &&
      !original._retried &&
      !original._skipAuth &&
      original.url !== '/auth/refresh'
    ) {
      original._retried = true
      const ok = await refreshTokens()
      if (ok) {
        const token = tokenStorage.getAccessToken()
        if (token) original.headers.Authorization = `Bearer ${token}`
        return http(original)
      }
      onUnauthenticated?.()
    }

    return Promise.reject(normalizeError(error))
  },
)

/**
 * Domain-level error envelope. Components only need `message` for toasts and
 * `fieldErrors` for inline form validation; the `status` and `code` are there
 * for narrower handling (e.g. surfacing rate-limit countdowns).
 */
export class ApiError extends Error {
  constructor({ message, status, code, fieldErrors, cause }) {
    super(message)
    this.name = 'ApiError'
    this.status = status ?? 0
    this.code = code ?? null
    this.fieldErrors = fieldErrors ?? {}
    this.cause = cause
  }

  get isNetworkError() {
    return this.status === 0
  }
  get isUnauthenticated() {
    return this.status === 401
  }
  get isValidation() {
    return this.status === 422 || Object.keys(this.fieldErrors).length > 0
  }
}

/**
 * The backend has two flavours of validation envelope:
 *   1. NestJS + Zod pipe → `errors: [{ code, path: [...], message }]`
 *   2. NestJS class-validator → `errors: { field: [messages] }`
 * Squash both into `{ field: firstMessage }`.
 */
function parseFieldErrors(raw) {
  const out = {}
  if (!raw) return out
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (!entry || typeof entry !== 'object') continue
      const message = entry.message ? String(entry.message) : ''
      if (!message) continue
      const path = entry.path
      const field = Array.isArray(path) && path.length > 0
        ? path.join('.')
        : entry.field
          ? String(entry.field)
          : '_'
      if (!(field in out)) out[field] = message
    }
    return out
  }
  if (typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw)) {
      out[k] = Array.isArray(v) ? String(v[0] ?? '') : String(v)
    }
  }
  return out
}

function normalizeError(error) {
  if (axios.isCancel(error)) {
    return new ApiError({ message: 'Request cancelled', status: 0, cause: error })
  }
  if (!error.response) {
    return new ApiError({
      message: 'Network error — please check your connection.',
      status: 0,
      cause: error,
    })
  }
  const { status, data } = error.response
  const fieldErrors = parseFieldErrors(data?.errors)
  const message =
    (data && (data.message || data.error)) ||
    (status >= 500 ? 'Server error — please try again.' : 'Request failed')
  return new ApiError({
    message: Array.isArray(message) ? message[0] : message,
    status,
    code: data?.code ?? null,
    fieldErrors,
    cause: error,
  })
}
