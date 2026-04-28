import { z } from 'zod'
import { http, validate } from '../lib/http'

// Mirrors `CreateIssueDto`. Category enum + length bounds are pulled
// straight from the OpenAPI spec.
const CreateIssueDto = z.object({
  category: z.enum([
    'power',
    'network',
    'screen_damage',
    'ads_not_playing',
    'payment_issue',
    'app_issue',
    'content_issue',
    'other',
  ]),
  subject: z.string().min(5).max(255),
  description: z.string().min(10).max(2000),
  attachments: z.array(z.string().url()).max(5).optional(),
})

export const supportApi = {
  async createIssue(input) {
    const body = validate(CreateIssueDto, input, 'CreateIssueDto')
    const { data } = await http.post('/issues', body)
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
