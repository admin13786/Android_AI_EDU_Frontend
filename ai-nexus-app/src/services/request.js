let unauthorizedHandler = null
let handling401 = false
let last401At = 0
const DEFAULT_API_BASE_URL = 'http://121.89.87.255:10001'

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = typeof fn === 'function' ? fn : null
}

const getBaseUrl = () => {
  const storedBaseUrl = uni.getStorageSync('apiBaseUrl')
  if (storedBaseUrl) {
    const normalizedBaseUrl = String(storedBaseUrl).trim().replace(/\/+$/, '')
    if (!/^https?:\/\/(10\.0\.2\.2|127\.0\.0\.1|localhost)(:\d+)?$/i.test(normalizedBaseUrl)) {
      return normalizedBaseUrl
    }
  }

  // #ifdef H5
  return DEFAULT_API_BASE_URL
  // #endif
  // #ifndef H5
  return DEFAULT_API_BASE_URL
  // #endif
}

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

  return new Promise((resolve, reject) => {
    uni.request({
      url: getBaseUrl() + options.url,
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
export { DEFAULT_API_BASE_URL, getBaseUrl }
