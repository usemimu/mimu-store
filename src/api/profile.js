import { z } from 'zod'
import { http, validate } from '../lib/http'

// Mirrors the OpenAPI host-profile DTOs. Every field is optional on the
// backend's `UpdateHostProfileDto`, but we still validate so a typo here
// turns into a useful client-side error rather than a silent server-side
// no-op.
const UpdateHostProfileDto = z
  .object({
    name: z.string().min(1).max(200).optional(),
    businessName: z.string().min(2).max(200).optional(),
    businessCategory: z.string().optional(),
    businessAddress: z.string().max(500).optional().nullable(),
    lga: z.string().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'At least one field is required',
  })

const AddBankAccountDto = z.object({
  bankCode: z.string().min(1),
  accountNumber: z.string().min(10).max(10),
})

const ConfirmBankAccountDto = z.object({
  confirmed: z.boolean(),
})

export const profileApi = {
  async getProfile() {
    const { data } = await http.get('/profile')
    return data
  },

  async updateProfile(patch) {
    const body = validate(UpdateHostProfileDto, patch, 'UpdateHostProfileDto')
    const { data } = await http.patch('/profile', body)
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
  async addBankAccount(input) {
    const body = validate(AddBankAccountDto, input, 'AddBankAccountDto')
    const { data } = await http.post('/profile/bank-account', body)
    return data
  },

  async confirmBankAccount(confirmed) {
    const body = validate(
      ConfirmBankAccountDto,
      { confirmed },
      'ConfirmBankAccountDto',
    )
    const { data } = await http.post('/profile/bank-account/confirm', body)
    return data
  },

  async whtExplanation() {
    const { data } = await http.get('/info/wht-explanation')
    return data
  },

  // ── Multi-bank API (up to 3 verified accounts) ────────────────────
  async listBankAccounts() {
    const { data } = await http.get('/profile/bank-accounts')
    return data
  },
  async addBankAccountV2(input) {
    const body = validate(AddBankAccountDto, input, 'AddBankAccountDto')
    const { data } = await http.post('/profile/bank-accounts', body)
    return data
  },
  async confirmBankAccountV2(id, confirmed) {
    const body = validate(
      ConfirmBankAccountDto,
      { confirmed },
      'ConfirmBankAccountDto',
    )
    const { data } = await http.post(`/profile/bank-accounts/${id}/confirm`, body)
    return data
  },
  async setPrimaryBankAccount(id) {
    const { data } = await http.post(`/profile/bank-accounts/${id}/primary`)
    return data
  },
  async removeBankAccount(id) {
    const { data } = await http.delete(`/profile/bank-accounts/${id}`)
    return data
  },
}
