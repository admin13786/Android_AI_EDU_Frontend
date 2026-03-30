<template>
  <view class="profile-page">
    <view class="status-bar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <text class="status-time">13:10</text>
      <view class="status-icons"><text class="status-glyph">⌁</text><text class="status-glyph">◉</text><text class="status-glyph">▣</text></view>
    </view>
    <view class="page-header">
      <text class="header-action" @click="goBack">←</text>
      <text class="header-title">个人信息</text>
      <view class="header-placeholder"></view>
    </view>
    <scroll-view class="profile-scroll" scroll-y>
      <view class="avatar-section">
        <image class="avatar-image" src="/static/avatar.svg" mode="aspectFill"></image>
        <text class="profile-name">{{ mergedProfile.nickname }}</text>
        <text class="profile-meta">ID {{ userInfo.id }}</text>
      </view>
      <view class="content-area" :style="{ paddingBottom: (safeAreaInsetsBottom + 14) + 'px' }">
        <view class="info-card">
          <view class="info-row clickable" @click="goToNickname">
            <text class="row-label">昵称</text>
            <text class="row-value">{{ mergedProfile.nickname }}</text>
          </view>
          <view class="divider"></view>

          <view class="info-row clickable" @click="openGenderSheet">
            <text class="row-label">性别</text>
            <text class="row-value">{{ mergedProfile.gender }}</text>
          </view>
          <view class="divider"></view>

          <view class="info-row clickable" @click="goToBio">
            <text class="row-label">自我介绍</text>
            <text class="row-value multiline">{{ mergedProfile.bio }}</text>
          </view>
        </view>

        <view class="info-card">
          <view class="info-row"><text class="row-label">手机号</text><text class="row-value">{{ userInfo.phone }}</text></view>
          <view class="divider"></view>
          <view class="info-row"><text class="row-label">注册时间</text><text class="row-value">{{ userInfo.createdAt }}</text></view>
        </view>

        <view class="settings-card">
          <view class="info-row"><text class="row-label">后端地址</text><text class="row-value compact">联调配置</text></view>
          <text class="settings-tip">真机测试可直接填写阿里云后端地址，例如 http://121.89.87.255:10001。</text>
          <input class="settings-input" v-model="apiBaseUrl" placeholder="可选：填写后端地址" placeholder-class="row-placeholder" />
          <text class="settings-tip">若服务端设置了 UNIFIED_API_KEY，在此填写相同密钥（仅保存在本机，用于请求头 X-Api-Key）。</text>
          <input
            class="settings-input"
            v-model="unifiedApiKey"
            placeholder="可选：统一 API 密钥"
            placeholder-class="row-placeholder"
          />
        </view>
        <view class="stats-grid">
          <view class="stat-card"><text class="stat-number">{{ stats.courses }}</text><text class="stat-label">课堂数</text></view>
          <view class="stat-card"><text class="stat-number">{{ stats.hours }}</text><text class="stat-label">学习时长</text></view>
          <view class="stat-card"><text class="stat-number">{{ stats.codes }}</text><text class="stat-label">生成次数</text></view>
        </view>
        <view class="action-button primary" @click="handleSave"><text class="action-text">保存资料</text></view>
        <view class="action-button danger" @click="handleLogout"><text class="danger-text">退出登录</text></view>
      </view>
    </scroll-view>

    <view v-if="genderSheetVisible" class="sheet-mask" @click="closeGenderSheet">
      <view class="gender-sheet" @click.stop>
        <text class="sheet-title">性别设置</text>
        <view v-for="item in genderOptions" :key="item" class="sheet-option" @click="selectGender(item)">
          <text class="sheet-option-text">{{ item }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getClassroomHistory, updateApiBaseUrl, updateUserInfo } from '@/services/api'
import { useUserStore } from '@/stores/user'
import { getLayoutMetrics } from '@/utils/layout'
import {
  consumeProfilePendingToast,
  getLocalProfile,
  saveLocalProfile,
  setProfilePendingToast,
} from '@/utils/profile'

const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics()
const userStore = useUserStore()
const apiBaseUrl = ref(userStore.apiBaseUrl)
const unifiedApiKey = ref(uni.getStorageSync('unifiedApiKey') || '')
const stats = ref({ courses: 0, hours: 0, codes: 1 })
const localProfile = ref(getLocalProfile())
const genderSheetVisible = ref(false)
const genderOptions = ['未设置', '女', '男']
const userInfo = computed(() => userStore.userInfo || { id: '10001', nickname: '灵境用户', phone: '138****8888', createdAt: '2026-03-25' })
const mergedProfile = computed(() => ({
  ...localProfile.value,
  nickname: userInfo.value.nickname || localProfile.value.nickname,
}))

const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.reLaunch({ url: '/pages/home/index?openSidebar=1' })
  }
}

const syncProfile = () => {
  localProfile.value = saveLocalProfile({
    nickname: userInfo.value.nickname || getLocalProfile().nickname,
  })
}

const goToNickname = () => {
  uni.navigateTo({ url: '/pages/profile/nickname' })
}

const goToBio = () => {
  uni.navigateTo({ url: '/pages/profile/bio' })
}

const openGenderSheet = () => {
  genderSheetVisible.value = true
}

const closeGenderSheet = () => {
  genderSheetVisible.value = false
}

const selectGender = (gender) => {
  saveLocalProfile({ gender })
  setProfilePendingToast('性别选项已保存')
  closeGenderSheet()
  syncProfile()

  uni.showToast({
    title: '性别选项已保存',
    icon: 'success',
  })
}

const loadPageData = async () => {
  try {
    const user = await userStore.fetchUserInfo()
    apiBaseUrl.value = user.apiBaseUrl || userStore.apiBaseUrl
    saveLocalProfile({ nickname: user.nickname || getLocalProfile().nickname })
    // Mirror cloud profile fields into local (so edit pages show latest).
    if (user && (Object.prototype.hasOwnProperty.call(user, 'bio') || Object.prototype.hasOwnProperty.call(user, 'gender'))) {
      saveLocalProfile({
        bio: user.bio != null ? user.bio : getLocalProfile().bio,
        gender: user.gender != null ? user.gender : getLocalProfile().gender,
      })
    }
  } catch (error) {
    saveLocalProfile({ nickname: userInfo.value.nickname })
  }
  try {
    const history = await getClassroomHistory()
    stats.value.courses = history.list?.length || 0
    stats.value.hours = stats.value.courses * 2
  } catch (error) {
    stats.value.courses = 0
  }
}

const handleSave = async () => {
  try {
    const trimmed = apiBaseUrl.value.trim()
    if (trimmed && !/^https?:\/\/.+/.test(trimmed)) {
      uni.showToast({ title: '地址格式不正确，需以 http:// 或 https:// 开头', icon: 'none' })
      return
    }
    const cleaned = trimmed.replace(/\/+$/, '')

    const tasks = []
    if (cleaned !== userStore.apiBaseUrl) {
      tasks.push(updateApiBaseUrl(cleaned))
      userStore.setApiBaseUrl(cleaned)
      apiBaseUrl.value = cleaned
    }

    // Sync profile (bio/gender) to backend; keep nickname handled by nickname page.
    const lp = getLocalProfile()
    const nextGender = lp.gender || '未设置'
    const nextBio = lp.bio != null ? String(lp.bio) : ''
    const prev = userStore.userInfo || {}
    const prevGender = prev.gender != null ? String(prev.gender) : '未设置'
    const prevBio = prev.bio != null ? String(prev.bio) : ''
    if (nextGender !== prevGender || nextBio !== prevBio) {
      tasks.push(updateUserInfo({ bio: nextBio, gender: nextGender }))
    }

    if (tasks.length) {
      await Promise.all(tasks)
    }

    const nextKey = unifiedApiKey.value.trim()
    const prevKey = uni.getStorageSync('unifiedApiKey') || ''
    if (nextKey !== prevKey) {
      if (nextKey) {
        uni.setStorageSync('unifiedApiKey', nextKey)
      } else {
        uni.removeStorageSync('unifiedApiKey')
      }
    }

    await loadPageData()
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error.message, icon: 'none' })
  }
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.reLaunch({ url: '/pages/home/index' })
      }
    },
  })
}

onShow(async () => {
  await loadPageData()
  syncProfile()

  const toastMessage = consumeProfilePendingToast()
  if (toastMessage) {
    uni.showToast({
      title: toastMessage,
      icon: 'success',
    })
  }
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';
.profile-page { min-height: 100vh; background: #0a0a0a; display: flex; flex-direction: column; }
.status-bar, .page-header { padding: 0 16rpx; display: flex; align-items: center; justify-content: space-between; }
.status-bar { height: 44rpx; }
.status-time, .status-glyph, .header-title, .header-action { color: $text-white; }
.status-time, .status-glyph { font-size: 24rpx; font-weight: 600; }
.status-icons { display: flex; gap: 10rpx; }
.page-header { height: 56rpx; }
.header-action, .header-placeholder { width: 40rpx; text-align: center; }
.header-title { font-size: 30rpx; font-weight: 700; }
.profile-scroll { flex: 1; }
.avatar-section { display: flex; flex-direction: column; align-items: center; padding: 32rpx 0; }
.avatar-image { width: 180rpx; height: 180rpx; border-radius: 50%; border: 4rpx solid rgba(167,139,250,0.7); margin-bottom: 20rpx; }
.profile-name { color: $text-white; font-size: 38rpx; font-weight: 700; margin-bottom: 8rpx; }
.profile-meta { color: $text-muted; font-size: 24rpx; }
.content-area { padding: 0 16rpx 28rpx; }
.info-card, .settings-card { background: #1a1a1a; border-radius: 24rpx; padding: 20rpx 16rpx; margin-bottom: 16rpx; }
.info-row { min-height: 72rpx; display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
.info-row.clickable { min-height: 84rpx; }
.row-label, .row-value { font-size: 28rpx; }
.row-label { color: #a1a1aa; }
.row-value { color: $text-white; text-align: right; }
.row-value.multiline { max-width: 420rpx; font-size: 24rpx; line-height: 1.6; }
.row-value.compact { font-size: 22rpx; color: #8e8e93; }
.row-placeholder { color: #6b7280; }
.divider { height: 2rpx; background: rgba(255,255,255,0.08); margin: 8rpx 0; }
.settings-tip { display: block; color: #8e8e93; font-size: 24rpx; line-height: 1.6; margin: 8rpx 0 14rpx; }
.settings-input { min-height: 84rpx; border-radius: 20rpx; background: #111111; color: $text-white; font-size: 26rpx; padding: 0 20rpx; }
.stats-grid { display: flex; gap: 12rpx; margin-bottom: 16rpx; }
.stat-card { flex: 1; border-radius: 20rpx; background: #1a1a1a; padding: 26rpx 10rpx; text-align: center; }
.stat-number { display: block; color: #a78bfa; font-size: 40rpx; font-weight: 700; margin-bottom: 8rpx; }
.stat-label { color: #8e8e93; font-size: 22rpx; }
.action-button { height: 96rpx; border-radius: 28rpx; display: flex; align-items: center; justify-content: center; margin-bottom: 14rpx; }
.action-button.primary { background: #ffffff; }
.action-button.danger { border: 2rpx solid #ef4444; }
.action-text { color: #111111; font-size: 30rpx; font-weight: 700; }
.danger-text { color: #ef4444; font-size: 30rpx; font-weight: 700; }
.sheet-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.52); display: flex; align-items: flex-end; justify-content: center; padding: 24rpx; }
.gender-sheet { width: 100%; border-radius: 28rpx 28rpx 0 0; background: #1a1a1a; padding: 28rpx 24rpx 36rpx; }
.sheet-title { display: block; color: $text-white; font-size: 30rpx; font-weight: 700; text-align: center; margin-bottom: 24rpx; }
.sheet-option { min-height: 84rpx; border-radius: 20rpx; background: #111111; display: flex; align-items: center; justify-content: center; margin-bottom: 12rpx; }
.sheet-option-text { color: $text-white; font-size: 28rpx; }
</style>
