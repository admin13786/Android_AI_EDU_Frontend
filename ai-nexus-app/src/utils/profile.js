const PROFILE_STORAGE_KEY = 'localProfile'
const PROFILE_TOAST_KEY = 'profilePendingToast'

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
  uni.setStorageSync(PROFILE_TOAST_KEY, message)
}

export const consumeProfilePendingToast = () => {
  const message = uni.getStorageSync(PROFILE_TOAST_KEY)
  if (message) {
    uni.removeStorageSync(PROFILE_TOAST_KEY)
  }
  return message || ''
}
