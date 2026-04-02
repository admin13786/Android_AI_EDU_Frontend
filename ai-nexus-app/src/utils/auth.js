export const AUTH_ROUTE = '/pages/profile/auth'
export const COMPANY_SESSION_TOKEN_KEY = 'companySessionToken'
export const COMPANY_USER_INFO_KEY = 'companyUserInfo'
export const LEGACY_TOKEN_KEY = 'token'
export const LEGACY_USER_INFO_KEY = 'userInfo'
export const LAST_LOGIN_USERNAME_KEY = 'lastLoginUsername'

const PUBLIC_ROUTES = new Set([AUTH_ROUTE])

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value)

const getRememberedUsername = () => String(uni.getStorageSync(LAST_LOGIN_USERNAME_KEY) || '').trim()

const buildFallbackUserInfo = (username) => {
  const normalizedUsername = String(username || '').trim()
  if (!normalizedUsername) return null

  return {
    id: normalizedUsername,
    username: normalizedUsername,
    displayName: normalizedUsername,
    nickname: normalizedUsername,
  }
}

const normalizeStoredUserInfo = (userInfo) => {
  if (!isPlainObject(userInfo)) return null

  const rememberedUsername = getRememberedUsername()
  const username = String(userInfo.username || userInfo.id || rememberedUsername || '').trim()
  if (!username) return userInfo

  return {
    ...userInfo,
    id: String(userInfo.id || username).trim(),
    username,
    displayName: String(userInfo.displayName || userInfo.display_name || userInfo.nickname || username).trim(),
    nickname: String(userInfo.nickname || userInfo.displayName || userInfo.display_name || username).trim(),
  }
}

export const normalizeRoute = (route) => {
  const normalized = String(route || '').trim()
  if (!normalized) return ''
  return normalized.split('?')[0]
}

export const routeRequiresAuth = (route) => {
  const normalized = normalizeRoute(route)
  if (!normalized) return false
  return !PUBLIC_ROUTES.has(normalized)
}

export const getStoredSessionToken = () => {
  const nextToken = String(
    uni.getStorageSync(COMPANY_SESSION_TOKEN_KEY) || uni.getStorageSync(LEGACY_TOKEN_KEY) || '',
  ).trim()
  return nextToken
}

export const hasStoredSessionToken = () => !!getStoredSessionToken()

export const setStoredSessionToken = (token) => {
  const nextToken = String(token || '').trim()
  if (nextToken) {
    uni.setStorageSync(COMPANY_SESSION_TOKEN_KEY, nextToken)
    uni.setStorageSync(LEGACY_TOKEN_KEY, nextToken)
    return
  }

  uni.removeStorageSync(COMPANY_SESSION_TOKEN_KEY)
  uni.removeStorageSync(LEGACY_TOKEN_KEY)
}

export const getStoredUserInfo = () => {
  const primary = normalizeStoredUserInfo(uni.getStorageSync(COMPANY_USER_INFO_KEY))
  if (primary) return primary

  const legacy = normalizeStoredUserInfo(uni.getStorageSync(LEGACY_USER_INFO_KEY))
  if (legacy) return legacy

  if (getStoredSessionToken()) {
    return buildFallbackUserInfo(getRememberedUsername())
  }

  return null
}

export const getStoredAuthSnapshot = () => ({
  token: getStoredSessionToken(),
  userInfo: getStoredUserInfo(),
})

export const setStoredUserInfo = (userInfo) => {
  const normalized = normalizeStoredUserInfo(userInfo)

  if (normalized) {
    uni.setStorageSync(COMPANY_USER_INFO_KEY, normalized)
    uni.setStorageSync(LEGACY_USER_INFO_KEY, normalized)
    if (normalized.username) {
      uni.setStorageSync(LAST_LOGIN_USERNAME_KEY, normalized.username)
    }
    return
  }

  uni.removeStorageSync(COMPANY_USER_INFO_KEY)
  uni.removeStorageSync(LEGACY_USER_INFO_KEY)
}

export const clearAuthSessionStorage = () => {
  setStoredSessionToken('')
  setStoredUserInfo(null)
}

export const getCurrentUserScope = () => {
  const userInfo = getStoredUserInfo()
  if (!userInfo) return 'guest'
  return String(userInfo.username || userInfo.id || 'guest').trim() || 'guest'
}

export const buildAuthRedirectUrl = (redirectRoute = '') => {
  const normalized = normalizeRoute(redirectRoute)
  if (routeRequiresAuth(normalized)) {
    return `${AUTH_ROUTE}?redirect=${encodeURIComponent(redirectRoute)}`
  }
  return AUTH_ROUTE
}

export const redirectToAuth = (redirectRoute = '') => {
  uni.reLaunch({ url: buildAuthRedirectUrl(redirectRoute) })
}
