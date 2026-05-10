import { http, validate } from '../lib/http'
import { z } from 'zod'

/**
 * Host eligibility-protection surface — host-self endpoints under
 * /v1/host. Same shapes the admin uses on /v1/admin/hosts/:id/...,
 * just resolved by JWT instead of by URL parameter.
 *
 * The backend treats sub-category overlap with an advertiser as the
 * default competitor signal; blocks add manual exclusions; allows
 * whitelist a specific advertiser despite an overlap. The scheduler
 * reads all three through one canonical query.
 */

// Active sub-category list — used by the picker. Public-ish: any
// authenticated user can read.
export const subcategoriesApi = {
  async listActive() {
    const { data } = await http.get('/business-subcategories', {
      // The /business-subcategories endpoint lives at the API root
      // (not under /v1/host), so override the audience prefix here.
      // The bracketed path collapses to whatever the env's base
      // host is, dropping the `/v1/host` audience.
      _absolute: true,
    })
    return data
  },
}

// Wrapping the pre-baked baseURL: when we hit the cross-audience
// /v1/business-subcategories, we use a manually-constructed URL so
// the audience prefix doesn't double-up.
import axios from 'axios'
const apiHost =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const PutSubcategoriesDto = z.object({
  subcategoryIds: z.array(z.string().uuid()).max(10),
})

const CreateBlockDto = z
  .object({
    blockedAdvertiserId: z.string().uuid().optional(),
    blockedSubcategoryId: z.string().uuid().optional(),
    blockedParentCategory: z.string().optional(),
    reason: z.string().max(500).optional(),
    expiresAt: z.string().optional(),
  })
  .refine(
    (v) =>
      [v.blockedAdvertiserId, v.blockedSubcategoryId, v.blockedParentCategory]
        .filter((x) => x != null)
        .length === 1,
    { message: 'Exactly one of advertiser / sub-category / parent category must be set.' },
  )

const CreateAllowDto = z.object({
  advertiserId: z.string().uuid(),
  reason: z.string().max(500).optional(),
  expiresAt: z.string().optional(),
})

export const eligibilityApi = {
  // ─── Subcategories ─────────────────────────────────────────────

  /**
   * Vocabulary picker source — calls /v1/business-subcategories
   * directly (not under /v1/host). The host's own selected tags
   * come from `getMine`.
   */
  async catalog() {
    const r = await axios.get(`${apiHost}/v1/business-subcategories`, {
      withCredentials: false,
      headers: {
        Accept: 'application/json',
        Authorization: http.defaults.headers.Authorization || '',
      },
    })
    return r.data
  },

  async getMine() {
    const { data } = await http.get('/profile/subcategories')
    return data
  },

  async putMine(subcategoryIds) {
    const body = validate(
      PutSubcategoriesDto,
      { subcategoryIds },
      'PutSubcategoriesDto',
    )
    const { data } = await http.put('/profile/subcategories', body)
    return data
  },

  // ─── Blocks ────────────────────────────────────────────────────

  async listBlocks() {
    const { data } = await http.get('/blocks')
    return data
  },

  async createBlock(input) {
    const body = validate(CreateBlockDto, input, 'CreateBlockDto')
    const { data } = await http.post('/blocks', body)
    return data
  },

  async removeBlock(blockId) {
    await http.delete(`/blocks/${blockId}`)
  },

  // ─── Allows ────────────────────────────────────────────────────

  async listAllows() {
    const { data } = await http.get('/allows')
    return data
  },

  async createAllow(input) {
    const body = validate(CreateAllowDto, input, 'CreateAllowDto')
    const { data } = await http.post('/allows', body)
    return data
  },

  async removeAllow(advertiserId) {
    await http.delete(`/allows/${advertiserId}`)
  },

  // ─── Audit ─────────────────────────────────────────────────────

  /**
   * "What plays on my screen" probe. Same answer the scheduler uses.
   */
  async auditScreen(screenId) {
    const { data } = await http.get(
      `/screens/${screenId}/eligibility-audit`,
    )
    return data
  },
}
