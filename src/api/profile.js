import { http } from '../lib/http'

export const profileApi = {
  async getProfile() {
    const { data } = await http.get('/profile')
    return data
  },

  async updateProfile(patch) {
    const { data } = await http.patch('/profile', patch)
    return data
  },

  async completionStatus() {
    const { data } = await http.get('/profile/completion-status')
    return data
  },

  /** Paystack-backed bank list. Cached aggressively client-side. */
  async listBanks() {
    const { data } = await http.get('/profile/banks')
    return data
  },

  /**
   * Two-step bank flow:
   *   1. POST `/profile/bank-account` with `{ bankCode, accountNumber }`
   *      → server resolves the account name via Paystack and returns it.
   *   2. POST `/profile/bank-account/confirm` with `{ confirmed: true }` once
   *      the user has eyeballed the name.
   */
  async addBankAccount({ bankCode, accountNumber }) {
    const { data } = await http.post('/profile/bank-account', {
      bankCode,
      accountNumber,
    })
    return data
  },

  async confirmBankAccount(confirmed) {
    const { data } = await http.post('/profile/bank-account/confirm', {
      confirmed,
    })
    return data
  },

  async whtExplanation() {
    const { data } = await http.get('/info/wht-explanation')
    return data
  },
}
