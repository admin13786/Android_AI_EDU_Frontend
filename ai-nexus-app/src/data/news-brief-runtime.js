import { getNewsList } from '@/services/api'
import { getLatestNewsBriefIssue, getNewsBriefIssueById } from '@/data/news-brief'

const LATEST_ISSUE_STORAGE_KEY = 'newsBriefLatestIssueRuntime'

const ISSUE_SUBTITLE =
  '这里有为你精心挑选的 AI 智慧与生活点滴，每天7点准时更新，希望能伴你度过轻松且有收获的每一天。'

const normalizeParagraphs = (text = '') => {
  const value = String(text || '').trim()
  if (!value) return []

  const parts = value
    .split(/(?<=[。！？!?])/)
    .map((item) => item.trim())
    .filter(Boolean)

  return parts.length > 0 ? parts : [value]
}

const createLatestIssueShell = () => {
  const latestIssue = getLatestNewsBriefIssue()
  return {
    ...latestIssue,
    subtitle: ISSUE_SUBTITLE,
    items: [],
  }
}

const normalizeRuntimeItem = (item = {}, index = 0) => {
  const summary = String(item.raw?.brief?.lead || item.summary || '').trim()
  const briefParagraphs = Array.isArray(item.raw?.brief?.paragraphs)
    ? item.raw.brief.paragraphs.map((paragraph) => String(paragraph || '').trim()).filter(Boolean)
    : []

  return {
    id: String(item.id || `personal-top-${index + 1}`),
    newsId: Number(item.id || 0),
    source: String(item.source || 'AI 热讯'),
    headline: String(item.raw?.brief?.headline || item.title || '今日 AI 热点'),
    warning: summary,
    articleUrl: String(item.url || ''),
    coverImage: String(item.coverUrl || ''),
    expandedBody: briefParagraphs.length > 0 ? briefParagraphs : normalizeParagraphs(summary),
  }
}

const normalizeRuntimeIssue = (newsList = []) => {
  const latestIssue = createLatestIssueShell()
  return {
    ...latestIssue,
    items: newsList.slice(0, 3).map((item, index) => normalizeRuntimeItem(item, index)),
  }
}

export const getLatestNewsBriefIssueId = () => getLatestNewsBriefIssue().id

export const getCachedLatestNewsBriefIssue = () => {
  const cachedIssue = uni.getStorageSync(LATEST_ISSUE_STORAGE_KEY)
  if (!cachedIssue || typeof cachedIssue !== 'object' || Array.isArray(cachedIssue)) {
    return null
  }

  return {
    ...createLatestIssueShell(),
    ...cachedIssue,
    items: Array.isArray(cachedIssue.items) ? cachedIssue.items : [],
  }
}

export const fetchLatestNewsBriefIssue = async () => {
  const response = await getNewsList('personal')
  const issue = normalizeRuntimeIssue(Array.isArray(response?.list) ? response.list : [])
  uni.setStorageSync(LATEST_ISSUE_STORAGE_KEY, issue)
  return issue
}

export const getRenderableNewsBriefIssueById = (issueId = '') => {
  if (String(issueId || '') === getLatestNewsBriefIssueId()) {
    return getCachedLatestNewsBriefIssue() || createLatestIssueShell()
  }

  return getNewsBriefIssueById(issueId)
}

export const getRenderableNewsBriefItemByIds = (issueId = '', itemId = '') => {
  const issue = getRenderableNewsBriefIssueById(issueId)
  const items = Array.isArray(issue?.items) ? issue.items : []
  return items.find((item) => item.id === itemId) || items[0] || null
}
