import { z } from 'zod'
import { http } from '../lib/http'

const TokenPair = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
})

const ApiUser = z.object({
  id: z.string(),
  userType: z.enum(['host', 'advertiser']),
  phoneNumber: z.string(),
  email: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  isNewUser: z.boolean().optional().default(false),
})

const VerifyOtpResponse = TokenPair.extend({ user: ApiUser })

/**
 * Validates the response with zod and returns the parsed value. Throws if
 * the API drifts from the contract — better to fail loudly here than to let
 * a malformed payload propagate and crash a downstream component.
 */
function parse(schema, data) {
  const r = schema.safeParse(data)
  if (!r.success) {
    if (import.meta.env.DEV) {
      console.error('API contract mismatch', r.error.format())
    }
    throw new Error('Unexpected response from server.')
  }
  return r.data
}

export const authApi = {
  // Hosts onboard via an emailed/SMSed invite link. The invite carries an
  // opaque token that gets traded for an OTP challenge.
  async claimInvite({ token, phone }) {
    const { data } = await http.post(
      '/auth/claim-invite',
      { token, phone },
      { _skipAuth: true },
    )
    return data
  },

  async verifyOtp({ phone, code }) {
    const { data } = await http.post(
      '/auth/verify-otp',
      { phone, code },
      { _skipAuth: true },
    )
    return parse(VerifyOtpResponse, data)
  },

  async loginWithPassword({ phoneOrEmail, password }) {
    const { data } = await http.post(
      '/auth/login-password',
      { phoneOrEmail, password },
      { _skipAuth: true },
    )
    return parse(VerifyOtpResponse, data)
  },

  async forgotPassword(phoneOrEmail) {
    await http.post(
      '/auth/forgot-password',
      { phoneOrEmail },
      { _skipAuth: true },
    )
  },

  async resetPassword({ token, newPassword }) {
    await http.post(
      '/auth/reset-password',
      { token, newPassword },
      { _skipAuth: true },
    )
  },

  async changePassword({ currentPassword, newPassword }) {
    await http.patch('/auth/change-password', { currentPassword, newPassword })
  },

  async setPassword(newPassword) {
    await http.patch('/auth/set-password', { newPassword })
  },

  async logout(refreshToken) {
    await http.post(
      '/auth/logout',
      { refreshToken },
      { _skipAuth: true },
    )
  },
}
