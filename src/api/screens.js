import { http } from '../lib/http'

/** Host's own screens — read-only on this side; admin manages assignments. */
export const screensApi = {
  async list(params = {}) {
    const { data } = await http.get('/screens', { params })
    return data
  },
  async detail(id) {
    const { data } = await http.get(`/screens/${id}`)
    return data
  },

  /**
   * GET the screen's current audio config. Returns canonical defaults
   * (enabled=false, volume=50, quiet hours null) for a screen with
   * no `audio_config` set yet.
   */
  async getAudioConfig(id) {
    const { data } = await http.get(`/screens/${id}/audio-config`)
    return data
  },

  /**
   * PATCH the screen's audio config. Partial-patch — include only
   * the fields you want to change.
   *
   * Body shape (all optional):
   *   { enabled?: boolean,
   *     volume0to100?: number,
   *     quietHoursStartMinutes?: number | null,
   *     quietHoursEndMinutes?: number | null }
   *
   * Quiet hours rule: send both or neither. Server returns the
   * full resulting config so the UI can refresh without an extra
   * round-trip. The player picks up the change via ConfigSyncWorker.
   */
  async patchAudioConfig(id, patch) {
    const { data } = await http.patch(
      `/screens/${id}/audio-config`,
      patch,
    )
    return data
  },
}
