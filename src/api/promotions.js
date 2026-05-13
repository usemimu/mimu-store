import axios from 'axios'
import { z } from 'zod'
import { http, validate } from '../lib/http'

// Mirrors `PromotionUploadIntentDto`. The host asserts the file's
// integrity (sha256 + size) up front so the server's /complete step
// can verify the bytes match.
const PromotionUploadIntentDto = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(500).optional(),
  screenId: z.string().uuid(),
  originalFileName: z.string().min(1).max(500),
  format: z.enum(['video', 'image']),
  contentType: z.enum(['video/mp4', 'image/jpeg', 'image/png']),
  sizeBytes: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  durationSeconds: z.number().int().nonnegative(),
})

/**
 * Host promotions — the host's own creative content for their screens.
 *
 * Upload flow:
 *   1. POST `/host/promotions/upload-intent` with all the metadata
 *      (name, screenId, sha256, dimensions, ...) → server returns
 *      { promotionId, uploadUrl, expiresAt }
 *   2. PUT bytes to `uploadUrl` (presigned, no auth header).
 *   3. POST `/host/promotions/{id}/complete` → server HEADs S3,
 *      verifies size matches, advances to `pending_vetting`.
 *   4. Admin reviews and approves/rejects.
 *   5. POST `/host/promotions/{id}/activate` to add to rotation.
 *   6. DELETE `/host/promotions/{id}` to remove (soft-delete) any time.
 */
export const promotionsApi = {
  async uploadIntent(input) {
    const body = validate(
      PromotionUploadIntentDto,
      input,
      'PromotionUploadIntentDto',
    )
    const { data } = await http.post('/host/promotions/upload-intent', body)
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
            if (!e.total) return
            onProgress(Math.min(1, e.loaded / e.total))
          }
        : undefined,
    })
  },

  /** Confirm bytes landed; server advances to pending_vetting. */
  async complete(id) {
    const { data } = await http.post(`/host/promotions/${id}/complete`)
    return data
  },

  async list(params = {}) {
    const { data } = await http.get('/host/promotions', { params })
    return data
  },

  async detail(id) {
    const { data } = await http.get(`/host/promotions/${id}`)
    return data
  },

  async activate(id) {
    const { data } = await http.post(`/host/promotions/${id}/activate`)
    return data
  },

  async deactivate(id) {
    const { data } = await http.post(`/host/promotions/${id}/deactivate`)
    return data
  },

  async remove(id) {
    await http.delete(`/host/promotions/${id}`)
  },

  async performance(id) {
    const { data } = await http.get(`/host/promotions/${id}/performance`)
    return data
  },
}

/**
 * Compute the SHA-256 of a File/Blob as a lowercase hex string.
 * The backend's PromotionUploadIntentDto requires this so the
 * /complete step can prove the uploaded bytes match what was promised.
 */
export async function sha256Hex(file) {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Resolve image dimensions from a File. Returns `{width, height}`.
 */
export async function imageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight }
      URL.revokeObjectURL(url)
      resolve(dims)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to read image dimensions'))
    }
    img.src = url
  })
}

/**
 * Resolve video metadata: width, height, durationSeconds (rounded up).
 */
export async function videoMetadata(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    const url = URL.createObjectURL(file)
    video.onloadedmetadata = () => {
      const meta = {
        width: video.videoWidth,
        height: video.videoHeight,
        durationSeconds: Math.max(1, Math.ceil(video.duration)),
      }
      URL.revokeObjectURL(url)
      resolve(meta)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to read video metadata'))
    }
    video.src = url
  })
}

/**
 * Extract a JPEG cover from the first decode-able frame of a video.
 * Seeks slightly past 0 (0.1s) — many encoders produce a black-frame
 * keyframe at 0 — and renders to a canvas, then exports as JPEG at
 * 85% quality. Returns a Blob with type='image/jpeg'.
 *
 * Used by the host upload flow: every promotion record carries a
 * cover thumbnail for the host's own list and admin vetting preview.
 */
export async function extractVideoCover(file, { seekTo = 0.1, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    const url = URL.createObjectURL(file)
    let settled = false

    const cleanup = () => {
      URL.revokeObjectURL(url)
      video.src = ''
    }

    video.onloadedmetadata = () => {
      // Some browsers refuse to seek before metadata is loaded.
      video.currentTime = Math.min(seekTo, Math.max(0, video.duration - 0.05))
    }

    video.onseeked = () => {
      if (settled) return
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => {
            settled = true
            cleanup()
            if (!blob) {
              reject(new Error('Failed to encode cover frame'))
              return
            }
            resolve(blob)
          },
          'image/jpeg',
          quality,
        )
      } catch (err) {
        settled = true
        cleanup()
        reject(err)
      }
    }

    video.onerror = () => {
      if (settled) return
      settled = true
      cleanup()
      reject(new Error('Failed to decode video for cover extraction'))
    }

    video.src = url
  })
}
