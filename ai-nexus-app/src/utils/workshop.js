import { getCurrentUserScope } from '@/utils/auth'
import { stripWorkshopApiPrefix } from '@/services/api'

const WORKSHOP_HISTORY_KEY = 'workshopHistory'
const WORKSHOP_HISTORY_BUCKET_KEY = 'workshopHistoryByUser'

const pickText = (value, fallback = '') => {
  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized || fallback
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    const joined = value.map((item) => pickText(item)).filter(Boolean).join(' ')
    return joined || fallback
  }

  if (value && typeof value === 'object') {
    for (const key of ['summary', 'message', 'detail', 'error', 'text', 'title', 'content']) {
      const normalized = pickText(value[key], '')
      if (normalized) return normalized
    }
  }

  return fallback
}

const extractMessageText = (message = {}) => pickText(message?.content || message?.text || message?.message || '', '')

const firstMessageByRole = (messages = [], role = '') =>
  (Array.isArray(messages) ? messages : []).find((item) => String(item?.role || '').trim() === role) || null

const lastMessageByRole = (messages = [], role = '') =>
  [...(Array.isArray(messages) ? messages : [])]
    .reverse()
    .find((item) => String(item?.role || '').trim() === role) || null

const buildFallbackId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`

const buildDefaultPreview = (item = {}, result = {}) => {
  const previewUrl = stripWorkshopApiPrefix(result?.previewUrl || result?.url || item?.preview?.url || item?.previewUrl || item?.url || '')
  const previewCode = result?.code || item?.preview?.code?.content || item?.html || ''

  return {
    mode: item?.preview?.mode || (previewUrl ? 'url' : previewCode ? 'code' : 'empty'),
    html: item?.preview?.html || '',
    url: previewUrl,
    code: {
      lang: item?.preview?.code?.lang || result?.language || 'html',
      content: previewCode,
    },
  }
}

const normalizeHistoryItem = (item = {}) => {
  const prompt =
    pickText(item.prompt, '') ||
    extractMessageText(firstMessageByRole(item.messages, 'user')) ||
    pickText(item.title, '')
  const assistantSummary =
    pickText(item?.result?.summary || item.summary, '') ||
    extractMessageText(lastMessageByRole(item.messages, 'assistant')) ||
    prompt
  const previewUrl = stripWorkshopApiPrefix(item?.result?.previewUrl || item?.result?.url || item?.preview?.url || item?.previewUrl || item?.url || '')
  const code = pickText(item?.result?.code, '') || pickText(item?.preview?.code?.content || item?.html, '')
  const title = pickText(item.title, '') || prompt || 'Workshop Preview'

  const normalizedResult = {
    ...(item?.result && typeof item.result === 'object' ? item.result : {}),
    title: pickText(item?.result?.title, title) || title,
    summary: pickText(item?.result?.summary, assistantSummary) || assistantSummary,
    text: pickText(item?.result?.text, assistantSummary) || assistantSummary,
    message: pickText(item?.result?.message, assistantSummary) || assistantSummary,
    previewUrl,
    url: previewUrl,
    code,
    language: item?.result?.language || item?.preview?.code?.lang || 'html',
  }

  return {
    ...item,
    id: item.id || buildFallbackId(),
    title,
    prompt,
    result: normalizedResult,
    messages: Array.isArray(item.messages) ? item.messages : [],
    preview: buildDefaultPreview(item, normalizedResult),
    createdAt: item.createdAt || item.created_at || Date.now(),
    updatedAt: item.updatedAt || item.updated_at || item.createdAt || item.created_at || Date.now(),
  }
}

const normalizeWorkshopScope = (scope) => {
  const normalized = String(scope || '').trim()
  return normalized || 'guest'
}

const getWorkshopHistoryBucket = () => {
  const scoped = uni.getStorageSync(WORKSHOP_HISTORY_BUCKET_KEY)
  if (scoped && typeof scoped === 'object' && !Array.isArray(scoped)) {
    return scoped
  }

  const legacy = uni.getStorageSync(WORKSHOP_HISTORY_KEY)
  if (Array.isArray(legacy)) {
    return {
      [normalizeWorkshopScope(getCurrentUserScope())]: legacy.map((item) => normalizeHistoryItem(item)),
    }
  }

  return {}
}

export const getWorkshopHistory = (scope) => {
  const bucket = getWorkshopHistoryBucket()
  const raw = bucket[normalizeWorkshopScope(scope || getCurrentUserScope())]
  if (!Array.isArray(raw)) return []

  return raw.map((item) => normalizeHistoryItem(item)).sort((a, b) => {
    const timeA = Number(a.updatedAt || a.createdAt || 0)
    const timeB = Number(b.updatedAt || b.createdAt || 0)
    return timeB - timeA
  })
}

export const setWorkshopHistory = (list = [], scope) => {
  const workshopScope = normalizeWorkshopScope(scope || getCurrentUserScope())
  const bucket = getWorkshopHistoryBucket()
  const nextHistory = (Array.isArray(list) ? list : []).map((item) => normalizeHistoryItem(item))

  uni.setStorageSync(WORKSHOP_HISTORY_BUCKET_KEY, {
    ...bucket,
    [workshopScope]: nextHistory,
  })
  uni.setStorageSync(WORKSHOP_HISTORY_KEY, nextHistory)

  return nextHistory
}

export const getWorkshopConversation = (id, scope) => {
  if (!id) return null
  return getWorkshopHistory(scope).find((item) => item.id === id) || null
}

export const saveWorkshopConversation = (conversation, scope) => {
  const nextConversation = normalizeHistoryItem(conversation)
  const history = getWorkshopHistory(scope).filter((item) => item.id !== nextConversation.id)

  history.unshift(nextConversation)
  setWorkshopHistory(history, scope)

  return nextConversation
}
