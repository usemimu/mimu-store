import { defineStore } from 'pinia'
import { profileApi } from '../api/profile'

/**
 * Cache for the host's own profile + bank account state. We keep this in
 * Pinia (rather than vue-query) because several distinct surfaces — header,
 * dashboard, account page, edit-business — read from it and we want a
 * single, mutation-aware source of truth.
 *
 * vue-query is still the right tool for *list* state (banks, payouts,
 * earnings); the profile is one-shot per session.
 */
export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    completion: null,
    pendingBankConfirmation: null, // { accountName, bankCode, accountNumber }
    loading: false,
    error: null,
  }),

  getters: {
    isComplete: (s) => Boolean(s.completion?.isComplete),
    missingFields: (s) => s.completion?.missingFields ?? [],
  },

  actions: {
    async load(force = false) {
      if (this.profile && !force) return this.profile
      this.loading = true
      this.error = null
      try {
        const [profile, completion] = await Promise.all([
          profileApi.getProfile(),
          profileApi.completionStatus().catch(() => null),
        ])
        this.profile = profile
        this.completion = completion
        return profile
      } catch (err) {
        if (err.status === 404) {
          this.profile = null
          return null
        }
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    async update(patch) {
      const updated = await profileApi.updateProfile(patch)
      this.profile = updated
      // Completion status may change on update; refresh it but don't block.
      profileApi.completionStatus().then((c) => (this.completion = c)).catch(() => {})
      return updated
    },

    /**
     * Step 1 of bank flow. Returns the resolved account-holder name so the
     * UI can ask the user to confirm.
     */
    async resolveBankAccount({ bankCode, accountNumber }) {
      const res = await profileApi.addBankAccount({ bankCode, accountNumber })
      this.pendingBankConfirmation = {
        ...res,
        bankCode,
        accountNumber,
      }
      return res
    },

    /** Step 2 of bank flow. Persists or rejects the resolved account. */
    async confirmBankAccount(confirmed) {
      const res = await profileApi.confirmBankAccount(confirmed)
      this.pendingBankConfirmation = null
      if (confirmed) {
        // Trust the server; refresh profile to pull the new bank record.
        await this.load(true)
      }
      return res
    },

    cancelBankConfirmation() {
      this.pendingBankConfirmation = null
    },
  },
})
