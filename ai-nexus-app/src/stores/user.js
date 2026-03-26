import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo } from '@/services/api'

export const useUserStore = defineStore('user', () => {
  const token = ref(uni.getStorageSync('token') || '')
  const userInfo = ref(uni.getStorageSync('userInfo') || null)
  const apiBaseUrl = ref(uni.getStorageSync('apiBaseUrl') || '')

  const setToken = (t) => {
    token.value = t
    if (t) {
      uni.setStorageSync('token', t)
    } else {
      uni.removeStorageSync('token')
    }
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    if (info) {
      uni.setStorageSync('userInfo', info)
    } else {
      uni.removeStorageSync('userInfo')
    }
  }

  const setApiBaseUrl = (value) => {
    apiBaseUrl.value = value
    if (value) {
      uni.setStorageSync('apiBaseUrl', value)
    } else {
      uni.removeStorageSync('apiBaseUrl')
    }
  }

  const fetchUserInfo = async () => {
    const response = await getUserInfo()
    const u = response.user
    setUserInfo(u)
    if (u && Object.prototype.hasOwnProperty.call(u, 'apiBaseUrl')) {
      const raw = u.apiBaseUrl
      if (raw != null) {
        setApiBaseUrl(String(raw).trim())
      }
    }
    return u
  }

  const logout = () => {
    setToken('')
    setUserInfo(null)
  }

  return {
    token,
    userInfo,
    apiBaseUrl,
    setToken,
    setUserInfo,
    setApiBaseUrl,
    fetchUserInfo,
    logout
  }
})
