import { getCurrentUserScope } from '@/utils/auth'

const WORKSHOP_HISTORY_KEY = 'workshopHistory'
const WORKSHOP_HISTORY_BUCKET_KEY = 'workshopHistoryByUser'

const normalizeHistoryItem = (item = {}) => ({
  id: item.id || `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
  prompt: item.prompt || '',
  result: item.result || null,
  createdAt: item.createdAt || Date.now(),
})

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

  return raw.map((item) => normalizeHistoryItem(item)).sort((a, b) => b.createdAt - a.createdAt)
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
