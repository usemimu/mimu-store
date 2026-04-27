import { http } from '../lib/http'

export const payoutsApi = {
  /** Currently-pending payout details + breakdown (gross, WHT, fees, net). */
  async upcoming() {
    const { data } = await http.get('/payouts/upcoming')
    return data
  },
  async history(params = {}) {
    const { data } = await http.get('/payouts/history', { params })
    return data
  },
  async detail(id) {
    const { data } = await http.get(`/payouts/${id}`)
    return data
  },
  /** Email a PDF receipt; body { email? } overrides the default address. */
  async requestReceipt(id, email) {
    const { data } = await http.post(
      `/payouts/${id}/request-receipt`,
      email ? { email } : {},
    )
    return data
  },
  /**
   * Early payout request — backend enforces a ₦20,000 minimum (returns 402
   * if balance is below threshold). Body requires `reason` 10–500 chars.
   */
  async earlyRequest(reason) {
    const { data } = await http.post('/payouts/early-request', { reason })
    return data
  },
}
