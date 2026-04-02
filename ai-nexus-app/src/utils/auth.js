export const AUTH_ROUTE = '/pages/profile/auth'
export const COMPANY_SESSION_TOKEN_KEY = 'companySessionToken'
export const COMPANY_USER_INFO_KEY = 'companyUserInfo'
export const LEGACY_TOKEN_KEY = 'token'
export const LEGACY_USER_INFO_KEY = 'userInfo'

const PUBLIC_ROUTES = new Set([AUTH_ROUTE])

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value)

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
  const primary = uni.getStorageSync(COMPANY_USER_INFO_KEY)
  if (isPlainObject(primary)) return primary

  const legacy = uni.getStorageSync(LEGACY_USER_INFO_KEY)
  if (isPlainObject(legacy)) return legacy

  return null
}

export const setStoredUserInfo = (userInfo) => {
  if (isPlainObject(userInfo)) {
    uni.setStorageSync(COMPANY_USER_INFO_KEY, userInfo)
    uni.setStorageSync(LEGACY_USER_INFO_KEY, userInfo)
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
