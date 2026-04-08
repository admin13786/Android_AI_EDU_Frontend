<template>
  <view class="edit-page">
    <view class="top-bar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="page-header">
        <view class="header-side header-back" @click="goBack">
          <text class="header-back-icon">←</text>
        </view>
        <text class="header-title">设置昵称</text>
        <view class="header-side header-action-done" @click="handleSave">
          <text class="header-action-text">完成</text>
        </view>
      </view>
    </view>

    <view class="form-area" :style="formAreaStyle">
      <input
        class="text-input"
        v-model="nickname"
        maxlength="20"
        placeholder="请输入昵称"
        placeholder-class="text-placeholder"
      />
    </view>
  </view>
</template>

<script setup>
import { onBackPress, onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { getLayoutMetrics } from '@/utils/layout'
import { getLocalProfile, saveLocalProfile, setProfilePendingToast } from '@/utils/profile'
import { safeNavigateBack } from '@/utils/navigation'

const { statusBarHeight } = getLayoutMetrics()
const topBarOffset = `${statusBarHeight + uni.upx2px(124)}px`
const formAreaStyle = {
  paddingTop: `calc(${topBarOffset} + 24rpx)`,
}

const userStore = useUserStore()
const nickname = ref('')

const goBack = () => {
  safeNavigateBack('/pages/profile/index')
}

const handleSave = async () => {
  const value = nickname.value.trim()
  if (!value) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  userStore.setUserInfo({
    ...(userStore.userInfo || {}),
    nickname: value,
  })
  saveLocalProfile({ nickname: value })
  setProfilePendingToast('昵称修改成功')
  safeNavigateBack('/pages/profile/index')
}

onLoad(() => {
  nickname.value = userStore.userInfo?.nickname || getLocalProfile().nickname
})

onBackPress((options = {}) => {
  if (options.from === 'navigateBack') {
    return false
  }

  goBack()
  return true
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';

.edit-page {
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
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-bottom: 18rpx;
  background: rgba(255, 249, 241, 0.94);
  border-bottom: 2rpx solid rgba(107, 62, 31, 0.08);
  box-shadow: 0 18rpx 40rpx rgba(62, 35, 8, 0.08);
  backdrop-filter: blur(12rpx);
  z-index: 30;
}

.page-header {
  min-height: 96rpx;
  padding-top: 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.header-side {
  width: 72rpx;
  min-width: 72rpx;
  height: 72rpx;
}

.header-back,
.header-action-done {
  padding: 0;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  gap: 0;
}

.header-back {
  width: 72rpx;
  min-width: 72rpx;
  background: rgba(255, 255, 255, 0.82);
  border: 2rpx solid rgba(107, 62, 31, 0.1);
  justify-content: center;
  box-shadow: $shadow-soft;
}

.header-action-done {
  background: rgba(255, 255, 255, 0.82);
  border: 2rpx solid rgba(107, 62, 31, 0.1);
  justify-content: center;
  box-shadow: $shadow-soft;
}

.header-back-icon,
.header-back-text,
.header-title,
.header-action-text {
  color: $ink-strong;
}

.header-back-icon {
  font-size: 34rpx;
  font-weight: 800;
  line-height: 1;
}

.header-action-text {
  color: $accent-brand-deep;
  font-size: 26rpx;
  font-weight: 800;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 40rpx;
  font-weight: 900;
  letter-spacing: 1rpx;
  color: $ink-strong;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.form-area {
  padding-left: 16rpx;
  padding-right: 16rpx;
}

.text-input {
  min-height: 104rpx;
  border-radius: 28rpx;
  background:
    radial-gradient(circle at top right, rgba(255, 237, 209, 0.72), transparent 36%),
    linear-gradient(160deg, rgba(255, 252, 247, 0.98), rgba(244, 233, 217, 0.98));
  color: $ink-strong;
  font-size: 30rpx;
  line-height: 1.4;
  padding: 0 28rpx;
  box-sizing: border-box;
  border: 2rpx solid rgba(107, 62, 31, 0.08);
  box-shadow: $shadow-card;
}

.text-placeholder {
  color: $ink-faint;
  font-size: 26rpx;
}
</style>
