import { z } from 'zod'
import { http, validate } from '../lib/http'

// =============================================================================
// Request DTOs — mirror the OpenAPI shapes exactly so we catch field-name
// drift (and missing required fields) at the call site instead of as an
// opaque server-side 400. Patterns + minLengths match the published spec.
// =============================================================================

const NgPhone = z
  .string()
  .regex(/^\+234\d{10}$/, 'Phone must be in +234XXXXXXXXXX format')

const ClaimInviteDto = z.object({
  inviteToken: z.string().min(32),
  phone: NgPhone,
  email: z.string().email().optional(),
})

const VerifyOTPDto = z.object({
  phone: NgPhone,
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
})

const PasswordLoginDto = z.object({
  phoneOrEmail: z.string().min(1),
  password: z.string().min(8),
})

const ForgotPasswordDto = z.object({
  phoneOrEmail: z.string().min(1),
})

const ResetPasswordDto = z.object({
  // 6-digit numeric code, matches backend `ResetPasswordSchema`.
  token: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(8),
})

const ChangePasswordDto = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

const SetPasswordDto = z.object({
  newPassword: z.string().min(8),
})

const LogoutDto = z.object({
  refreshToken: z.string().min(1),
})

const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1),
})

// =============================================================================
// Response DTOs — only declared where the OpenAPI publishes a typed schema.
// Endpoints with prose-only responses pass through raw and are projected by
// the views; declaring a schema for them would be inventing a contract the
// backend hasn't committed to.
// =============================================================================

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

// =============================================================================
// API surface
// =============================================================================

export const authApi = {
  /**
   * Hosts onboard via a WhatsApp invite link. The invite carries an
   * opaque token that gets traded for an OTP challenge. Backend DTO
   * (`ClaimInviteDto`) names the field `inviteToken` (≥32 chars) — we
   * validate the payload here so a typo can't escape into the wire.
   * `email` is optional and gives the host an OTP-via-email channel.
   */
  async claimInvite(input) {
    const body = validate(ClaimInviteDto, input, 'ClaimInviteDto')
    const { data } = await http.post('/auth/claim-invite', body, {
      _skipAuth: true,
    })
    return data
  },

  async verifyOtp(input) {
    const body = validate(VerifyOTPDto, input, 'VerifyOTPDto')
    const { data } = await http.post('/auth/verify-otp', body, {
      _skipAuth: true,
    })
    return validate(VerifyOtpResponse, data, 'VerifyOTPResponseDto')
  },

  async loginWithPassword(input) {
    const body = validate(PasswordLoginDto, input, 'PasswordLoginDto')
    const { data } = await http.post('/auth/login-password', body, {
      _skipAuth: true,
    })
    return validate(VerifyOtpResponse, data, 'VerifyOTPResponseDto')
  },

  async forgotPassword(phoneOrEmail) {
    const body = validate(
      ForgotPasswordDto,
      { phoneOrEmail },
      'ForgotPasswordDto',
    )
    await http.post('/auth/forgot-password', body, { _skipAuth: true })
  },

  async resetPassword(input) {
    const body = validate(ResetPasswordDto, input, 'ResetPasswordDto')
    await http.post('/auth/reset-password', body, { _skipAuth: true })
  },

  async changePassword(input) {
    const body = validate(ChangePasswordDto, input, 'ChangePasswordDto')
    await http.patch('/auth/change-password', body)
  },

  async setPassword(newPassword) {
    const body = validate(SetPasswordDto, { newPassword }, 'SetPasswordDto')
    await http.patch('/auth/set-password', body)
  },

  async logout(refreshToken) {
    const body = validate(LogoutDto, { refreshToken }, 'LogoutDto')
    await http.post('/auth/logout', body, { _skipAuth: true })
  },
}

// Re-exported so the http-layer single-flight refresh can validate too.
export const _refreshDto = RefreshTokenDto
