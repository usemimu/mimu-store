import { defineStore } from 'pinia'
import { authApi } from '../api/auth'
import { profileApi } from '../api/profile'
import { tokenStorage } from '../lib/tokenStorage'
import { useProfileStore } from './profile'

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
     * Resolve the initial state on app boot.
     *
     * `tokenStorage.hydrate()` only tells us whether a refresh token exists
     * locally — that's necessary but not sufficient. Without server-side
     * validation, any leftover string in localStorage (a stale token, a
     * mock token from earlier development) would flip `isAuthenticated` to
     * true and let the user past the route guard. The dashboard would
     * then render with empty fallbacks while every API call 401s in the
     * background — exactly the "logged in with no data" UX bug.
     *
     * Flow:
     *   - No token in storage → immediate `'unauthenticated'`.
     *   - Token present → status stays `'unknown'`, the route guard parks
     *     the user on the splash, we probe `/profile`. The 401-refresh
     *     interceptor handles token rotation transparently. If that
     *     terminal-fails, the http layer's `onUnauthenticated` callback
     *     calls `forceSignOut()` and we land on `'unauthenticated'`.
     *   - Probe succeeds → `'authenticated'` + merged identity.
     *   - Other error (server down, CORS, transient): trust local state,
     *     flip to `'authenticated'`, let the user retry. Better than
     *     locking them out on a network blip.
     */
    async bootstrap() {
      const hasSession = tokenStorage.hydrate()
      if (!hasSession) {
        this.status = 'unauthenticated'
        this.user = null
        return
      }
      // Stay 'unknown' so the route guard parks on the splash. We commit
      // to a status only after the probe resolves.
      try {
        const profile = await profileApi.getProfile()
        this.user = { id: tokenStorage.getUserId(), ...profile }
        this.status = 'authenticated'
        // Fan the already-fetched profile + a fresh completion-status
        // into the profile store so the route guard can read
        // `completion.isComplete` immediately on cold-load. Without
        // this, a returning host with an incomplete profile would
        // briefly flash the dashboard before being redirected to
        // onboarding. The completion call is fire-and-forget — if it
        // fails the user falls through to the dashboard, which is
        // recoverable from the Account page.
        const profileStore = useProfileStore()
        profileStore.profile = profile
        profileApi
          .completionStatus()
          .then((c) => {
            profileStore.completion = c
          })
          .catch(() => {})
      } catch (err) {
        if (err?.status === 401) {
          // 401 here means the access AND refresh both failed (the
          // interceptor's refresh path is exhausted). The
          // `onUnauthenticated` handler in main.js has already cleared
          // tokens and we should mirror that locally.
          this._clear()
          return
        }
        if (err?.status === 404) {
          // Token valid but no profile yet (e.g. host claim-invite done
          // but profile not loaded) — accept the session, leave user lean.
          this.user = { id: tokenStorage.getUserId() }
          this.status = 'authenticated'
          return
        }
        // Network/server hiccup. Trust the local token; subsequent calls
        // will retry against the live server.
        this.user = { id: tokenStorage.getUserId() }
        this.status = 'authenticated'
      }
    },

    async loginWithPassword({ phoneOrEmail, password }) {
      const res = await authApi.loginWithPassword({ phoneOrEmail, password })
      this._applySession(res)
      return res
    },

    async verifyOtp({ phone, code }) {
      const res = await authApi.verifyOtp({ phone, code })
      this._applySession(res)
      return res
    },

    async claimInvite({ inviteToken, phone, email }) {
      return authApi.claimInvite({ inviteToken, phone, email })
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
