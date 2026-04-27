import { http } from '../lib/http'

export const earningsApi = {
  async summary() {
    const { data } = await http.get('/earnings/summary')
    return data
  },
  async history(params = {}) {
    // Common params: { from, to, page, limit }
    const { data } = await http.get('/earnings/history', { params })
    return data
  },
  async byDay(params = {}) {
    // Common params: { from, to } returning daily buckets — used to draw
    // the dashboard chart.
    const { data } = await http.get('/earnings/by-day', { params })
    return data
  },
}
