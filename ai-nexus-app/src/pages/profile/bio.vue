<template>
  <view class="edit-page">
    <view class="top-bar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="page-header">
        <view class="header-side header-back" @click="goBack">
          <text class="header-back-icon">←</text>
        </view>
        <text class="header-title">自我介绍</text>
        <view class="header-side header-action-done" @click="handleSave">
          <text class="header-action-text">保存</text>
        </view>
      </view>
    </view>

    <view class="form-area" :style="formAreaStyle">
      <textarea
        class="text-area"
        v-model="bio"
        maxlength="50"
        placeholder="请输入不多于 50 字的自我介绍"
        placeholder-class="text-placeholder"
      />
      <text class="count-text">{{ bio.length }}/50</text>
    </view>
  </view>
</template>

<script setup>
import { onBackPress, onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getLayoutMetrics } from '@/utils/layout'
import { getLocalProfile, saveLocalProfile, setProfilePendingToast } from '@/utils/profile'
import { safeNavigateBack } from '@/utils/navigation'

const { statusBarHeight } = getLayoutMetrics()
const topBarOffset = `${statusBarHeight + uni.upx2px(124)}px`
const formAreaStyle = {
  paddingTop: `calc(${topBarOffset} + 24rpx)`,
}

const bio = ref('')

const goBack = () => {
  safeNavigateBack('/pages/profile/index')
}

const handleSave = () => {
  saveLocalProfile({ bio: bio.value.trim() })
  setProfilePendingToast('自我介绍修改成功')
  safeNavigateBack('/pages/profile/index')
}

onLoad(() => {
  bio.value = getLocalProfile().bio
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
  background: #0f0f0f;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-bottom: 18rpx;
  background: rgba(15, 15, 15, 0.98);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 16rpx 32rpx rgba(0, 0, 0, 0.24);
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
  background: #17171a;
  border: 2rpx solid rgba(255, 255, 255, 0.08);
  justify-content: center;
}

.header-action-done {
  background: rgba(34, 211, 238, 0.12);
  border: 2rpx solid rgba(34, 211, 238, 0.26);
  justify-content: center;
}

.header-back-icon,
.header-back-text,
.header-title,
.header-action-text {
  color: $text-white;
}

.header-back-icon {
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1;
}

.header-action-text {
  color: #22d3ee;
  font-size: 26rpx;
  font-weight: 700;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 42rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.form-area {
  padding-left: 16rpx;
  padding-right: 16rpx;
}

.text-area {
  width: 100%;
  min-height: 260rpx;
  border-radius: 24rpx;
  background: #1a1a1a;
  color: $text-white;
  font-size: 28rpx;
  padding: 24rpx;
  box-sizing: border-box;
}

.text-placeholder {
  color: #6b7280;
}

.count-text {
  display: block;
  color: #8e8e93;
  font-size: 22rpx;
  text-align: right;
  margin-top: 12rpx;
}
</style>
