const PROFILE_STORAGE_KEY = 'localProfile'
const PROFILE_TOAST_KEY = 'profilePendingToast'
const PROFILE_TOAST_TTL = 15000

const DEFAULT_PROFILE = {
  nickname: '灵境体验官',
  gender: '未设置',
  bio: '正在用真机测试 AI 工坊、AI 学堂和 AI 观察哨的整体流程。',
}

export const getLocalProfile = () => {
  const raw = uni.getStorageSync(PROFILE_STORAGE_KEY)
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_PROFILE }
  }

  return {
    ...DEFAULT_PROFILE,
    ...raw,
  }
}

export const saveLocalProfile = (patch = {}) => {
  const nextProfile = {
    ...getLocalProfile(),
    ...patch,
  }

  uni.setStorageSync(PROFILE_STORAGE_KEY, nextProfile)
  return nextProfile
}

export const setProfilePendingToast = (message) => {
  if (!message) return
  uni.setStorageSync(PROFILE_TOAST_KEY, {
    message,
    createdAt: Date.now(),
  })
}

export const consumeProfilePendingToast = () => {
  const payload = uni.getStorageSync(PROFILE_TOAST_KEY)
  if (payload) {
    uni.removeStorageSync(PROFILE_TOAST_KEY)
  }

  // Clear legacy string payloads left by older builds instead of showing stale toasts.
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  const message = typeof payload.message === 'string' ? payload.message : ''
  const createdAt = Number(payload.createdAt || 0)
  if (!message || !createdAt) {
    return ''
  }

  if (Date.now() - createdAt > PROFILE_TOAST_TTL) {
    return ''
  }

  return message
}
