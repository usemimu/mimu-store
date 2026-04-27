import { http } from '../lib/http'

export const supportApi = {
  async createIssue({ category, subject, description, attachments }) {
    const { data } = await http.post('/issues', {
      category,
      subject,
      description,
      ...(attachments?.length ? { attachments } : {}),
    })
    return data
  },
  async listIssues(params = {}) {
    const { data } = await http.get('/issues', { params })
    return data
  },
  async issue(id) {
    const { data } = await http.get(`/issues/${id}`)
    return data
  },
  async whatsappLink() {
    const { data } = await http.post('/issues/whatsapp-link')
    return data
  },
  async helpArticles() {
    const { data } = await http.get('/help/articles')
    return data
  },
  async helpArticle(slug) {
    const { data } = await http.get(`/help/articles/${slug}`)
    return data
  },
  async helpSearch(q) {
    const { data } = await http.get('/help/search', { params: { q } })
    return data
  },
}
