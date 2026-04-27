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
}
