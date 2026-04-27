/**
 * Single source of truth for host-app session tokens.
 *
 * Web doesn't have a hardware-backed keystore, so the threat model is XSS:
 * any script that can read `localStorage` can steal the tokens. We accept
 * that for now (refresh-token rotation on the backend bounds the blast
 * radius) and keep this layer narrow so a future move to httpOnly cookies
 * is a one-file change.
 *
 * Access token is intentionally held in memory as well as localStorage —
 * the in-memory copy avoids a sync read on every request, and reseeding
 * from storage on cold start covers tab reloads.
 */

const ACCESS_KEY = 'mimu.host.access_token'
const REFRESH_KEY = 'mimu.host.refresh_token'
const EXPIRES_AT_KEY = 'mimu.host.access_expires_at'
const USER_ID_KEY = 'mimu.host.user_id'

let memoryAccessToken = null

function safeRead(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeWrite(key, value) {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Storage may throw in private mode / quota exceeded — non-fatal.
  }
}

export const tokenStorage = {
  hydrate() {
    memoryAccessToken = safeRead(ACCESS_KEY)
    return Boolean(safeRead(REFRESH_KEY))
  },

  getAccessToken() {
    return memoryAccessToken ?? safeRead(ACCESS_KEY)
  },

  getRefreshToken() {
    return safeRead(REFRESH_KEY)
  },

  getAccessExpiresAt() {
    const v = safeRead(EXPIRES_AT_KEY)
    return v ? new Date(v) : null
  },

  getUserId() {
    return safeRead(USER_ID_KEY)
  },

  /**
   * Persist a fresh session. `expiresIn` is in seconds (matches the API).
   */
  setSession({ accessToken, refreshToken, expiresIn, userId }) {
    memoryAccessToken = accessToken
    safeWrite(ACCESS_KEY, accessToken)
    safeWrite(REFRESH_KEY, refreshToken)
    if (typeof expiresIn === 'number') {
      const at = new Date(Date.now() + expiresIn * 1000).toISOString()
      safeWrite(EXPIRES_AT_KEY, at)
    }
    if (userId) safeWrite(USER_ID_KEY, userId)
  },

  /**
   * Update only the token pair, e.g. after a silent refresh.
   */
  rotateTokens({ accessToken, refreshToken, expiresIn }) {
    memoryAccessToken = accessToken
    safeWrite(ACCESS_KEY, accessToken)
    if (refreshToken) safeWrite(REFRESH_KEY, refreshToken)
    if (typeof expiresIn === 'number') {
      const at = new Date(Date.now() + expiresIn * 1000).toISOString()
      safeWrite(EXPIRES_AT_KEY, at)
    }
  },

  clear() {
    memoryAccessToken = null
    safeWrite(ACCESS_KEY, null)
    safeWrite(REFRESH_KEY, null)
    safeWrite(EXPIRES_AT_KEY, null)
    safeWrite(USER_ID_KEY, null)
  },
}
