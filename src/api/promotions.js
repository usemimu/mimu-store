import axios from 'axios'
import { z } from 'zod'
import { http, validate } from '../lib/http'

// Mirrors `PromotionUploadIntentDto`. The `contentType` enum is exact —
// the backend rejects anything else.
const PromotionUploadIntentDto = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive(),
  contentType: z.enum(['video/mp4', 'image/jpeg', 'image/png']),
  screenId: z.string().uuid(),
})

// Mirrors `CreatePromotionDto`. `description` is optional; everything else
// is required.
const CreatePromotionDto = z.object({
  promotionId: z.string().uuid(),
  name: z.string().min(2).max(255),
  description: z.string().max(500).optional(),
  screenId: z.string().uuid(),
})

/**
 * Host promotions — the host's own creative content for their screens.
 * Upload flow:
 *   1. POST `/promotions/upload-intent` with { fileName, fileSize, contentType, screenId }
 *      → server returns { promotionId, uploadUrl, expiresAt, headers }
 *   2. PUT bytes to `uploadUrl` (presigned, no auth header).
 *   3. POST `/promotions` with { promotionId, name, description?, screenId }
 *      → server records the promotion and triggers the processing pipeline.
 *   4. Once approved, POST `/promotions/{id}/activate` to add to rotation.
 */
export const promotionsApi = {
  async uploadIntent(input) {
    const body = validate(
      PromotionUploadIntentDto,
      input,
      'PromotionUploadIntentDto',
    )
    const { data } = await http.post('/promotions/upload-intent', body)
    return data
  },

  /**
   * Bypass the auth interceptor — presigned URLs reject our Bearer token.
   * `onProgress` (optional) gets a 0..1 fraction so the UI can render a
   * progress bar during the upload.
   */
  async putBytes({ url, file, headers = {}, onProgress }) {
    const raw = axios.create({ withCredentials: false })
    await raw.put(url, file, {
      headers: { 'Content-Type': file.type, ...headers },
      onUploadProgress: onProgress
        ? (e) => {
            // `total` may be undefined on Safari for some payloads — guard.
            if (!e.total) return
            onProgress(Math.min(1, e.loaded / e.total))
          }
        : undefined,
    })
  },

  async create(input) {
    const body = validate(CreatePromotionDto, input, 'CreatePromotionDto')
    const { data } = await http.post('/promotions', body)
    return data
  },

  async list(params = {}) {
    const { data } = await http.get('/promotions', { params })
    return data
  },

  async detail(id) {
    const { data } = await http.get(`/promotions/${id}`)
    return data
  },

  async activate(id) {
    const { data } = await http.post(`/promotions/${id}/activate`)
    return data
  },

  async deactivate(id) {
    const { data } = await http.post(`/promotions/${id}/deactivate`)
    return data
  },

  async performance(id) {
    const { data } = await http.get(`/promotions/${id}/performance`)
    return data
  },
}
