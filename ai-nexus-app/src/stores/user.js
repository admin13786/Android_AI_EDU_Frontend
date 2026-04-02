import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { loginSession, logoutCurrentSession, registerSession } from '@/services/api'
import {
  clearAuthSessionStorage,
  getStoredSessionToken,
  getStoredUserInfo,
  setStoredSessionToken,
  setStoredUserInfo,
} from '@/utils/auth'

const normalizeUserInfo = (info) => {
  if (!info || typeof info !== 'object') return null

  const username = String(info.username || '').trim()
  const displayName = String(info.displayName || info.display_name || info.nickname || username).trim()

  return {
    ...info,
    username,
    displayName: displayName || username,
    nickname: String(info.nickname || displayName || username || '灵境用户').trim(),
    id: String(info.id || username || 'guest').trim(),
    phone: String(info.phone || '').trim(),
    createdAt: String(info.createdAt || info.created_at || '').trim(),
  }
}

const isUnauthorizedError = (error) => Number(error?.statusCode || 0) === 401

export const useUserStore = defineStore('user', () => {
  const token = ref(getStoredSessionToken())
  const userInfo = ref(normalizeUserInfo(getStoredUserInfo()) || null)
  const apiBaseUrl = ref(uni.getStorageSync('apiBaseUrl') || '')
  const isAuthenticated = computed(() => !!token.value && !!userInfo.value?.username)

  const setToken = (t) => {
    const nextToken = String(t || '').trim()
    token.value = nextToken
    setStoredSessionToken(nextToken)
  }

  const setUserInfo = (info) => {
    const normalized = normalizeUserInfo(info)
    userInfo.value = normalized
    setStoredUserInfo(normalized)
  }

  const setApiBaseUrl = (value) => {
    apiBaseUrl.value = value
    if (value) {
      uni.setStorageSync('apiBaseUrl', value)
    } else {
      uni.removeStorageSync('apiBaseUrl')
    }
  }

  const applyAuthResponse = (response) => {
    const nextToken = String(response?.token || '').trim()
    if (!nextToken) {
      throw new Error('登录成功，但后端没有返回 token')
    }

    setToken(nextToken)
    setUserInfo(response?.user || null)
    return userInfo.value
  }

  const login = async (payload) => {
    const response = await loginSession(payload)
    return applyAuthResponse(response)
  }

  const register = async (payload) => {
    const response = await registerSession(payload)
    return applyAuthResponse(response)
  }

  const fetchUserInfo = async () => {
    return userInfo.value
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    clearAuthSessionStorage()
  }

  const logoutRemote = async () => {
    try {
      if (token.value) {
        try {
          await logoutCurrentSession()
        } catch (error) {
          if (!isUnauthorizedError(error)) {
            throw error
          }
        }
      }
    } finally {
      logout()
    }
  }

  return {
    token,
    userInfo,
    apiBaseUrl,
    isAuthenticated,
    setToken,
    setUserInfo,
    setApiBaseUrl,
    login,
    register,
    fetchUserInfo,
    logout,
    logoutRemote,
  }
})
