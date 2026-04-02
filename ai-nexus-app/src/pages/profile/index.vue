<template>
  <view class="profile-page">
    <view class="top-bar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="page-header">
        <view class="header-back" @click="goBack">
          <text class="header-back-icon">←</text>
        </view>
        <text class="header-title">个人信息</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <scroll-view class="profile-scroll" :style="profileScrollStyle" scroll-y>
      <view class="profile-body" :style="{ paddingBottom: `${safeAreaInsetsBottom + 28}px` }">
        <view class="avatar-section">
          <view class="avatar-orb">
            <view class="avatar-highlight"></view>
            <text class="avatar-initial">{{ avatarInitial }}</text>
          </view>
          <view class="camera-badge" @click="handleAvatarTap">
            <text class="camera-badge-text">机</text>
          </view>
        </view>

        <template v-if="isAuthenticated">
          <view class="info-card">
            <view class="info-row clickable" @click="goToNickname">
              <text class="row-label">昵称</text>
              <view class="row-right">
                <text class="row-value">{{ mergedProfile.nickname }}</text>
                <text class="row-arrow">›</text>
              </view>
            </view>

            <view class="divider"></view>

            <view class="info-row clickable" @click="openGenderSheet">
              <text class="row-label">性别</text>
              <view class="row-right">
                <text class="row-value">{{ mergedProfile.gender }}</text>
                <text class="row-arrow">›</text>
              </view>
            </view>
          </view>

          <view class="intro-card" @click="goToBio">
            <text class="intro-title">自我介绍</text>
            <text class="intro-value">{{ introDisplay }}</text>
          </view>

          <view class="meta-card">
            <view class="info-row">
              <text class="row-label">账号状态</text>
              <text class="row-value">已登录</text>
            </view>
            <view class="divider"></view>
            <view class="info-row">
              <text class="row-label">用户名</text>
              <text class="row-value">{{ displayUsername }}</text>
            </view>
          </view>

          <view class="logout-button" @click="handleLogout">
            <text class="logout-text">退出登录</text>
          </view>
        </template>

        <template v-else>
          <view class="guest-card">
            <text class="guest-title">尚未登录账号</text>
            <text class="guest-copy">登录后可同步个人身份，并使用公司后端提供的账号能力。</text>
            <view class="guest-action primary" @click="openAuth('login')">
              <text class="guest-action-text dark">登录账号</text>
            </view>
            <view class="guest-action secondary" @click="openAuth('register')">
              <text class="guest-action-text light">新用户注册</text>
            </view>
          </view>

          <view class="meta-card">
            <view class="info-row">
              <text class="row-label">账号状态</text>
              <text class="row-value">访客模式</text>
            </view>
            <view class="divider"></view>
            <view class="info-row">
              <text class="row-label">用户名</text>
              <text class="row-value">未登录</text>
            </view>
          </view>
        </template>
      </view>
    </scroll-view>

    <view v-if="genderSheetVisible && isAuthenticated" class="sheet-mask" @click="closeGenderSheet">
      <view class="gender-sheet" @click.stop>
        <text class="sheet-title">性别设置</text>
        <view v-for="item in genderOptions" :key="item" class="sheet-option" @click="selectGender(item)">
          <text class="sheet-option-text">{{ item }}</text>
        </view>
      </view>
    </view>

    <view v-if="toastState.visible" class="floating-toast">
      <view class="floating-toast-panel">
        <text v-if="toastState.type === 'success'" class="floating-toast-icon">✓</text>
        <text class="floating-toast-text">{{ toastState.message }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { onBackPress, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { getLayoutMetrics } from '@/utils/layout'
import { safeNavigateBack } from '@/utils/navigation'
import {
  consumeProfilePendingToast,
  getLocalProfile,
  saveLocalProfile,
  setProfilePendingToast,
} from '@/utils/profile'

const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics()
const topBarOffset = `${statusBarHeight + uni.upx2px(124)}px`
const profileScrollStyle = {
  marginTop: topBarOffset,
  height: `calc(100vh - ${topBarOffset})`,
}

const userStore = useUserStore()
const localProfile = ref(getLocalProfile())
const genderSheetVisible = ref(false)
const genderOptions = ['未设置', '女', '男']
const toastState = ref({
  visible: false,
  message: '',
  type: 'success',
})
let toastTimer = null

const isAuthenticated = computed(() => userStore.isAuthenticated)
const userInfo = computed(() => {
  if (userStore.userInfo) return userStore.userInfo
  return {
    id: 'guest',
    username: '',
    nickname: '灵境用户',
  }
})

const displayUsername = computed(() => userInfo.value.username || userInfo.value.id || '后端未提供')

const mergedProfile = computed(() => ({
  ...localProfile.value,
  nickname: userInfo.value.nickname || localProfile.value.nickname,
}))

const avatarInitial = computed(() => {
  const source = mergedProfile.value.nickname || displayUsername.value || '灵'
  return String(source).trim().slice(0, 1) || '灵'
})

const introDisplay = computed(() => {
  const bio = String(mergedProfile.value.bio || '').trim()
  return bio ? `${bio}  ›` : '介绍一下自己  ›'
})

const showInlineToast = (message, type = 'success', duration = 1800) => {
  if (!message) return

  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }

  toastState.value = {
    visible: true,
    message,
    type,
  }

  toastTimer = setTimeout(() => {
    toastState.value.visible = false
    toastTimer = null
  }, duration)
}

const syncProfile = () => {
  localProfile.value = saveLocalProfile({
    nickname: userInfo.value.nickname || getLocalProfile().nickname,
  })
}

const loadPageData = async () => {
  syncProfile()
}

const goBack = () => {
  safeNavigateBack('/pages/home/index?openSidebar=1')
}

const openAuth = (mode = 'login') => {
  uni.navigateTo({
    url: `/pages/profile/auth?mode=${mode}&redirect=${encodeURIComponent('/pages/profile/index')}`,
  })
}

const goToNickname = () => {
  uni.navigateTo({ url: '/pages/profile/nickname' })
}

const goToBio = () => {
  uni.navigateTo({ url: '/pages/profile/bio' })
}

const handleAvatarTap = () => {
  uni.showToast({ title: '头像能力待接入', icon: 'none' })
}

const openGenderSheet = () => {
  if (!isAuthenticated.value) return
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
  showInlineToast('性别选项已保存')
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定退出当前账号吗？',
    success: async (res) => {
      if (!res.confirm) return

      try {
        await userStore.logoutRemote()
        showInlineToast('已退出登录')
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/profile/auth' })
        }, 300)
      } catch (error) {
        uni.showToast({ title: error.message || '退出失败', icon: 'none' })
      }
    },
  })
}

onShow(async () => {
  await loadPageData()

  const toastMessage = consumeProfilePendingToast()
  if (toastMessage) {
    showInlineToast(toastMessage)
  }
})

onBeforeUnmount(() => {
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
})

onBackPress((options = {}) => {
  if (options.from === 'navigateBack') {
    return false
  }

  if (genderSheetVisible.value) {
    closeGenderSheet()
    return true
  }

  goBack()
  return true
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';

.profile-page {
  min-height: 100vh;
  background: #0b0b0d;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-bottom: 18rpx;
  background: rgba(11, 11, 13, 0.96);
}

.page-header {
  min-height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-back,
.header-placeholder {
  width: 86rpx;
  min-width: 86rpx;
  height: 46rpx;
}

.header-back {
  border-radius: 999rpx;
  background: #17171c;
  border: 2rpx solid #272730;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-back-icon,
.header-title {
  color: #f5f5f7;
}

.header-back-icon {
  font-size: 30rpx;
  line-height: 1;
  font-weight: 700;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 38rpx;
  font-weight: 700;
}

.profile-scroll {
  flex: 1;
}

.profile-body {
  padding: 0 16rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.avatar-section {
  position: relative;
  width: 112rpx;
  height: 112rpx;
  margin: 0 auto 40rpx;
}

.avatar-orb {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 28% 30%, #d8f2ff 0%, #4db1ff 42%, #2e89ea 72%, #1f5eb4 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-highlight {
  position: absolute;
  inset: 6rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 68% 32%, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0) 50%);
}

.avatar-initial {
  position: relative;
  z-index: 1;
  color: rgba(245, 245, 247, 0.94);
  font-size: 40rpx;
  font-weight: 700;
}

.camera-badge {
  position: absolute;
  right: -10rpx;
  bottom: 0;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #1d1d23;
  border: 2rpx solid #272730;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-badge-text {
  color: #f5f5f7;
  font-size: 20rpx;
  font-weight: 700;
}

.info-card,
.intro-card,
.meta-card,
.guest-card {
  width: 100%;
  border-radius: 20rpx;
  background: #17171c;
  border: 2rpx solid #272730;
  box-sizing: border-box;
}

.info-card,
.meta-card,
.guest-card {
  padding: 20rpx 22rpx;
}

.intro-card {
  padding: 20rpx 22rpx;
  margin-top: 20rpx;
}

.meta-card,
.logout-button {
  margin-top: 20rpx;
}

.info-row {
  min-height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.info-row.clickable {
  min-height: 52rpx;
}

.row-label {
  color: #f5f5f7;
  font-size: 30rpx;
  font-weight: 600;
}

.row-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;
  max-width: 58%;
}

.row-value {
  color: #a7a7b3;
  font-size: 28rpx;
  text-align: right;
  min-width: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-arrow {
  color: #a7a7b3;
  font-size: 30rpx;
  line-height: 1;
}

.divider {
  height: 2rpx;
  background: #272730;
  margin: 18rpx 0;
}

.intro-title {
  display: block;
  color: #f5f5f7;
  font-size: 32rpx;
  font-weight: 600;
}

.intro-value {
  display: block;
  margin-top: 18rpx;
  color: #a7a7b3;
  font-size: 28rpx;
  line-height: 1.6;
}

.guest-title {
  display: block;
  color: #f5f5f7;
  font-size: 34rpx;
  font-weight: 700;
}

.guest-copy {
  display: block;
  margin-top: 14rpx;
  color: #a7a7b3;
  font-size: 26rpx;
  line-height: 1.7;
}

.guest-action {
  margin-top: 18rpx;
  min-height: 84rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guest-action.primary {
  background: #f5f5f7;
}

.guest-action.secondary {
  background: #0b0b0d;
  border: 2rpx solid #3a3a45;
}

.guest-action-text {
  font-size: 28rpx;
  font-weight: 700;
}

.guest-action-text.dark {
  color: #0b0b0d;
}

.guest-action-text.light {
  color: #f5f5f7;
}

.logout-button {
  width: 100%;
  min-height: 56rpx;
  border-radius: 999rpx;
  background: #0b0b0d;
  border: 3rpx solid #3a3a45;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.logout-text {
  color: #f5f5f7;
  font-size: 30rpx;
  font-weight: 600;
}

.sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(17, 17, 24, 0.72);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 24rpx;
}

.gender-sheet {
  width: 100%;
  border-radius: 28rpx 28rpx 0 0;
  background: #17171c;
  padding: 28rpx 24rpx 36rpx;
}

.sheet-title {
  display: block;
  color: #f5f5f7;
  font-size: 30rpx;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24rpx;
}

.sheet-option {
  min-height: 84rpx;
  border-radius: 20rpx;
  background: #0b0b0d;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  border: 2rpx solid #272730;
}

.sheet-option-text {
  color: #f5f5f7;
  font-size: 28rpx;
}

.floating-toast {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  z-index: 50;
  pointer-events: none;
}

.floating-toast-panel {
  max-width: 540rpx;
  min-width: 280rpx;
  padding: 28rpx 32rpx;
  border-radius: 28rpx;
  background: rgba(8, 8, 8, 0.92);
  box-shadow: 0 18rpx 40rpx rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
}

.floating-toast-icon {
  color: #ffffff;
  font-size: 72rpx;
  font-weight: 700;
  line-height: 1;
}

.floating-toast-text {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
  white-space: normal;
  word-break: break-all;
}
</style>
