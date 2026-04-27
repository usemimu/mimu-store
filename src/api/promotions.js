import axios from 'axios'
import { http } from '../lib/http'

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
  async uploadIntent({ fileName, fileSize, contentType, screenId }) {
    const { data } = await http.post('/promotions/upload-intent', {
      fileName,
      fileSize,
      contentType,
      screenId,
    })
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

  async create({ promotionId, name, description, screenId }) {
    const { data } = await http.post('/promotions', {
      promotionId,
      name,
      ...(description ? { description } : {}),
      screenId,
    })
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
