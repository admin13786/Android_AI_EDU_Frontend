let unauthorizedHandler = null

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = typeof fn === 'function' ? fn : null
}

const getBaseUrl = () => {
  const storedBaseUrl = uni.getStorageSync('apiBaseUrl')
  if (storedBaseUrl) return storedBaseUrl

  // H5 使用 devServer proxy；App 默认指向 Android 模拟器映射地址。
  // 真机联调时可在 storage 中覆盖为局域网 IP。
  // #ifdef H5
  return ''
  // #endif
  // #ifndef H5
  return 'http://10.0.2.2:8000'
  // #endif
}

const normalizeError = (statusCode, data) => {
  if (typeof data === 'string') return data
  if (data?.detail) return data.detail
  if (data?.message) return data.message
  if (statusCode === 404) return '请求的资源不存在'
  if (statusCode >= 500) return '服务器开小差了，请稍后再试'
  return '请求失败，请稍后重试'
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
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 401) {
          try {
            if (unauthorizedHandler) unauthorizedHandler()
          } catch (e) {
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
          }
          uni.reLaunch({ url: '/pages/home/index' })
          reject(new Error('未授权'))
          return
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(normalizeError(res.statusCode, res.data)))
          return
        }

        resolve(res.data)
      },
      fail: (error) => {
        reject(new Error(error?.errMsg || '网络请求失败'))
      }
    })
  })
}

export default request
export { getBaseUrl }
