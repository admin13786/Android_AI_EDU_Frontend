const WORKSHOP_HISTORY_KEY = 'workshopHistory'

const normalizeHistoryItem = (item = {}) => ({
  id: item.id || `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
  prompt: item.prompt || '',
  result: item.result || null,
  createdAt: item.createdAt || Date.now(),
})

export const getWorkshopHistory = () => {
  const raw = uni.getStorageSync(WORKSHOP_HISTORY_KEY)
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => normalizeHistoryItem(item))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export const getWorkshopConversation = (id) => {
  if (!id) return null
  return getWorkshopHistory().find((item) => item.id === id) || null
}

export const saveWorkshopConversation = (conversation) => {
  const nextConversation = normalizeHistoryItem(conversation)
  const history = getWorkshopHistory().filter((item) => item.id !== nextConversation.id)

  history.unshift(nextConversation)
  uni.setStorageSync(WORKSHOP_HISTORY_KEY, history)

  return nextConversation
}
