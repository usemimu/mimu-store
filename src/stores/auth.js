import { defineStore } from 'pinia'
import { authApi } from '../api/auth'
import { tokenStorage } from '../lib/tokenStorage'

/**
 * Single source of truth for the host's session.
 *
 * The store does NOT write tokens directly to localStorage — that goes
 * through `tokenStorage` so a future migration to httpOnly cookies is a
 * single-file change. Components should treat `user` as authoritative for
 * UI-visible identity; `status === 'authenticated'` for route guards.
 *
 * Statuses:
 *   'unknown'         — pre-bootstrap, render a splash/loader
 *   'unauthenticated' — show login
 *   'authenticated'   — protected routes available
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    status: 'unknown',
    user: null,
    error: null,
  }),

  getters: {
    isAuthenticated: (s) => s.status === 'authenticated',
  },

  actions: {
    /**
     * Resolve the initial state on app boot from persisted tokens. Doesn't
     * fetch /me yet — that belongs to Stage 3 (host profile) where we'll
     * hydrate the full user record. For now the route guard only needs to
     * know "is there a session?".
     */
    bootstrap() {
      const hasSession = tokenStorage.hydrate()
      if (hasSession) {
        this.status = 'authenticated'
        this.user = { id: tokenStorage.getUserId() }
      } else {
        this.status = 'unauthenticated'
        this.user = null
      }
    },

    async loginWithPassword({ phoneOrEmail, password }) {
      const res = await authApi.loginWithPassword({ phoneOrEmail, password })
      this._applySession(res)
    },

    async verifyOtp({ phone, code }) {
      const res = await authApi.verifyOtp({ phone, code })
      this._applySession(res)
    },

    async claimInvite({ token, phone }) {
      return authApi.claimInvite({ token, phone })
    },

    async forgotPassword(phoneOrEmail) {
      await authApi.forgotPassword(phoneOrEmail)
    },

    async resetPassword({ token, newPassword }) {
      await authApi.resetPassword({ token, newPassword })
    },

    async changePassword({ currentPassword, newPassword }) {
      await authApi.changePassword({ currentPassword, newPassword })
    },

    async setPassword(newPassword) {
      await authApi.setPassword(newPassword)
    },

    /**
     * Logs out remotely (best-effort) and always clears local state. Safe to
     * call when the access token is already invalid — the API call will fail
     * silently, but the local clear still runs.
     */
    async logout() {
      const refreshToken = tokenStorage.getRefreshToken()
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken)
        } catch {
          /* server unreachable / token already revoked — ignore */
        }
      }
      this._clear()
    },

    /**
     * Called by the http interceptor when a refresh fails. Synchronous local
     * clear so the route guard kicks in immediately.
     */
    forceSignOut() {
      this._clear()
    },

    _applySession(res) {
      tokenStorage.setSession({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        expiresIn: res.expiresIn,
        userId: res.user.id,
      })
      this.status = 'authenticated'
      this.user = res.user
      this.error = null
    },

    _clear() {
      tokenStorage.clear()
      this.status = 'unauthenticated'
      this.user = null
    },
  },
})
