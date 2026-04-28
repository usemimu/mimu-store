import { z } from 'zod'
import { http, validate } from '../lib/http'

// Backend constraint: reason 10–500 chars (matches `EarlyPayoutRequestDto`).
const EarlyPayoutRequestDto = z.object({
  reason: z.string().min(10).max(500),
})

// `RequestReceiptDto` — email is optional; if omitted server uses the
// account's primary email.
const RequestReceiptDto = z.object({
  email: z.string().email().optional(),
})

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
    const body = validate(
      RequestReceiptDto,
      email ? { email } : {},
      'RequestReceiptDto',
    )
    const { data } = await http.post(
      `/payouts/${id}/request-receipt`,
      body,
    )
    return data
  },
  /**
   * Early payout request. Backend enforces a ₦20,000 minimum (returns 402
   * if balance is below threshold) and rejects anything outside the 10–500
   * char reason range with a 400; we surface that early via the DTO.
   */
  async earlyRequest(reason) {
    const body = validate(EarlyPayoutRequestDto, { reason }, 'EarlyPayoutRequestDto')
    const { data } = await http.post('/payouts/early-request', body)
    return data
  },
}
