let unauthorizedHandler = null
let handling401 = false
let last401At = 0
const DEFAULT_API_BASE_URL = 'http://121.89.87.255:10001'
const DEFAULT_NEWS_BASE_URL = 'http://8.135.4.46:8000'
const DEFAULT_OPENMAIC_BASE_URL = 'http://121.89.87.255:10200'

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = typeof fn === 'function' ? fn : null
}

const normalizeStoredUrl = (value) => {
  if (!value) return ''
  const normalizedUrl = String(value).trim().replace(/\/+$/, '')
  if (!normalizedUrl) return ''
  if (/^https?:\/\/(10\.0\.2\.2|127\.0\.0\.1|localhost)(:\d+)?$/i.test(normalizedUrl)) return ''
  return normalizedUrl
}

const getConfiguredBaseUrl = (storageKey, fallbackUrl) => {
  const storedBaseUrl = normalizeStoredUrl(uni.getStorageSync(storageKey))
  if (storedBaseUrl) return storedBaseUrl
  return fallbackUrl
}

const getBaseUrl = () => getConfiguredBaseUrl('apiBaseUrl', DEFAULT_API_BASE_URL)

const getNewsBaseUrl = () => getConfiguredBaseUrl('newsBaseUrl', DEFAULT_NEWS_BASE_URL)

const getOpenmaicBaseUrl = () => getConfiguredBaseUrl('openmaicBaseUrl', DEFAULT_OPENMAIC_BASE_URL)

const normalizeError = (statusCode, data) => {
  if (typeof data === 'string') return data
  if (data?.detail) return data.detail
  if (data?.message) return data.message
  if (statusCode === 404) return 'Resource not found'
  if (statusCode >= 500) return 'Server error, please retry later'
  return 'Request failed'
}

const request = (options) => {
  const token = uni.getStorageSync('token')
  const unifiedKey = uni.getStorageSync('unifiedApiKey')
  const baseUrl = options.baseUrl || getBaseUrl()

  return new Promise((resolve, reject) => {
    uni.request({
      url: baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data,
      timeout: options.timeout || 180000,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(unifiedKey ? { 'X-Api-Key': unifiedKey } : {}),
        ...options.header,
      },
      success: (res) => {
        if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')

          try {
            if (unauthorizedHandler) unauthorizedHandler()
          } catch (error) {
            // ignore
          }

          const now = Date.now()
          if (!handling401 || now - last401At > 2000) {
            handling401 = true
            last401At = now
            const pages = getCurrentPages?.() || []
            const currentRoute = pages.length ? `/${pages[pages.length - 1].route}` : ''
            if (currentRoute !== '/pages/home/index') {
              uni.reLaunch({ url: '/pages/home/index' })
            }
            setTimeout(() => {
              handling401 = false
            }, 2200)
          }

          reject(new Error('Unauthorized'))
          return
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(normalizeError(res.statusCode, res.data)))
          return
        }

        resolve(res.data)
      },
      fail: (error) => {
        reject(new Error(error?.errMsg || 'Network request failed'))
      },
    })
  })
}

export default request
export {
  DEFAULT_API_BASE_URL,
  DEFAULT_NEWS_BASE_URL,
  DEFAULT_OPENMAIC_BASE_URL,
  getBaseUrl,
  getNewsBaseUrl,
  getOpenmaicBaseUrl,
}
