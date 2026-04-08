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
  background:
    radial-gradient(circle at top right, rgba(255, 229, 192, 0.34), transparent 34%),
    linear-gradient(180deg, $paper-bg 0%, $paper-bg-soft 52%, $paper-bg-deep 100%);
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
  background: rgba(255, 249, 241, 0.94);
  border-bottom: 2rpx solid rgba(107, 62, 31, 0.08);
  box-shadow: 0 18rpx 40rpx rgba(62, 35, 8, 0.08);
  backdrop-filter: blur(12rpx);
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
  height: 52rpx;
}

.header-back {
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.82);
  border: 2rpx solid rgba(107, 62, 31, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-soft;
}

.header-back-icon,
.header-title {
  color: $ink-strong;
}

.header-back-icon {
  font-size: 32rpx;
  line-height: 1;
  font-weight: 800;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 40rpx;
  font-weight: 900;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.profile-scroll {
  flex: 1;
}

.profile-body {
  padding: 0 18rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.avatar-section {
  position: relative;
  width: 132rpx;
  height: 132rpx;
  margin: 0 auto 44rpx;
}

.avatar-orb {
  width: 132rpx;
  height: 132rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 28% 30%, #f5dfc6 0%, #d48a52 42%, #9b5c2f 72%, #6b3e1f 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 20rpx 42rpx rgba(107, 62, 31, 0.18);
}

.avatar-highlight {
  position: absolute;
  inset: 6rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 68% 32%, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0) 50%);
}

.avatar-initial {
  position: relative;
  z-index: 1;
  color: #fff8f0;
  font-size: 46rpx;
  font-weight: 800;
}

.camera-badge {
  position: absolute;
  right: -8rpx;
  bottom: 0;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  border: 2rpx solid rgba(107, 62, 31, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-badge-text {
  color: $accent-brand-deep;
  font-size: 20rpx;
  font-weight: 800;
}

.info-card,
.intro-card,
.meta-card,
.guest-card {
  width: 100%;
  border-radius: 28rpx;
  background:
    radial-gradient(circle at top right, rgba(255, 237, 209, 0.76), transparent 36%),
    linear-gradient(160deg, rgba(255, 252, 247, 0.98), rgba(244, 233, 217, 0.98));
  border: 2rpx solid rgba(107, 62, 31, 0.08);
  box-sizing: border-box;
  box-shadow: $shadow-card;
}

.info-card,
.meta-card,
.guest-card {
  padding: 24rpx 24rpx;
}

.intro-card {
  padding: 24rpx 24rpx;
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
  color: $ink-strong;
  font-size: 30rpx;
  font-weight: 800;
}

.row-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;
  max-width: 58%;
}

.row-value {
  color: $ink-soft;
  font-size: 28rpx;
  text-align: right;
  min-width: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-arrow {
  color: $accent-brand-deep;
  font-size: 30rpx;
  line-height: 1;
}

.divider {
  height: 2rpx;
  background: rgba(107, 62, 31, 0.08);
  margin: 18rpx 0;
}

.intro-title {
  display: block;
  color: $ink-strong;
  font-size: 32rpx;
  font-weight: 900;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.intro-value {
  display: block;
  margin-top: 18rpx;
  color: $ink-body;
  font-size: 28rpx;
  line-height: 1.6;
}

.guest-title {
  display: block;
  color: $ink-strong;
  font-size: 34rpx;
  font-weight: 900;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.guest-copy {
  display: block;
  margin-top: 14rpx;
  color: $ink-body;
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
  box-sizing: border-box;
}

.guest-action.primary {
  background: linear-gradient(145deg, #c26229, #8e4b22);
  box-shadow: 0 18rpx 36rpx rgba(117, 63, 29, 0.18);
}

.guest-action.secondary {
  background: rgba(255, 255, 255, 0.78);
  border: 2rpx solid rgba(107, 62, 31, 0.12);
}

.guest-action-text {
  font-size: 28rpx;
  font-weight: 800;
}

.guest-action-text.dark {
  color: #fff7ef;
}

.guest-action-text.light {
  color: $accent-brand-deep;
}

.logout-button {
  width: 100%;
  min-height: 84rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.76);
  border: 3rpx solid rgba(107, 62, 31, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  box-shadow: $shadow-soft;
}

.logout-text {
  color: $accent-brand-deep;
  font-size: 30rpx;
  font-weight: 800;
}

.sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(62, 35, 8, 0.28);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 24rpx;
}

.gender-sheet {
  width: 100%;
  border-radius: 28rpx 28rpx 0 0;
  background:
    radial-gradient(circle at top right, rgba(255, 237, 209, 0.76), transparent 36%),
    linear-gradient(160deg, rgba(255, 252, 247, 0.98), rgba(244, 233, 217, 0.98));
  padding: 28rpx 24rpx 36rpx;
  border: 2rpx solid rgba(107, 62, 31, 0.08);
  box-shadow: $shadow-elevated;
}

.sheet-title {
  display: block;
  color: $ink-strong;
  font-size: 30rpx;
  font-weight: 900;
  text-align: center;
  margin-bottom: 24rpx;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.sheet-option {
  min-height: 84rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.74);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  border: 2rpx solid rgba(107, 62, 31, 0.08);
}

.sheet-option-text {
  color: $ink-strong;
  font-size: 28rpx;
  font-weight: 700;
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
  background: rgba(22, 17, 13, 0.92);
  box-shadow: 0 18rpx 40rpx rgba(62, 35, 8, 0.22);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
}

.floating-toast-icon {
  color: #fff8ef;
  font-size: 72rpx;
  font-weight: 700;
  line-height: 1;
}

.floating-toast-text {
  color: #fff8ef;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
  white-space: normal;
  word-break: break-all;
}
</style>
