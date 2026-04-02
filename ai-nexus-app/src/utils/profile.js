import { getStoredUserInfo } from '@/utils/auth'

const PROFILE_STORAGE_KEY = 'localProfile'
const PROFILE_TOAST_KEY = 'profilePendingToast'
const PROFILE_TOAST_TTL = 15000

const DEFAULT_PROFILE = {
  nickname: '灵境体验官',
  gender: '未设置',
  bio: '正在用真机测试 AI 工坊、AI 学堂和 AI 观察哨的整体流程。',
}

const isLegacyProfileShape = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  return 'nickname' in value || 'gender' in value || 'bio' in value
}

const normalizeProfileScope = (scope) => {
  const normalized = String(scope || '').trim()
  return normalized || 'guest'
}

const getStoredUserScope = () => {
  const userInfo = getStoredUserInfo()
  if (!userInfo || typeof userInfo !== 'object') {
    return 'guest'
  }

  return normalizeProfileScope(userInfo.username || userInfo.id || 'guest')
}

const getProfileStorageBucket = () => {
  const raw = uni.getStorageSync(PROFILE_STORAGE_KEY)
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {}
  }

  if (isLegacyProfileShape(raw)) {
    return {
      [getStoredUserScope()]: {
        ...DEFAULT_PROFILE,
        ...raw,
      },
    }
  }

  return raw
}

export const getLocalProfile = (scope) => {
  const bucket = getProfileStorageBucket()
  const scopedProfile = bucket[normalizeProfileScope(scope || getStoredUserScope())]
  if (!scopedProfile || typeof scopedProfile !== 'object' || Array.isArray(scopedProfile)) {
    return { ...DEFAULT_PROFILE }
  }

  return {
    ...DEFAULT_PROFILE,
    ...scopedProfile,
  }
}

export const saveLocalProfile = (patch = {}, scope) => {
  const profileScope = normalizeProfileScope(scope || getStoredUserScope())
  const bucket = getProfileStorageBucket()
  const nextProfile = {
    ...getLocalProfile(profileScope),
    ...patch,
  }

  uni.setStorageSync(PROFILE_STORAGE_KEY, {
    ...bucket,
    [profileScope]: nextProfile,
  })
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
