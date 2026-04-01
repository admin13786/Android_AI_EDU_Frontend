<template>
  <view class="edit-page">
    <view class="top-safe" :style="{ paddingTop: `${statusBarHeight}px` }"></view>

    <view class="page-header">
      <text class="header-action" @click="goBack">←</text>
      <text class="header-title">自我介绍</text>
      <text class="header-action done" @click="handleSave">保存</text>
    </view>

    <view class="form-area">
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
const bio = ref('')

const goBack = () => {
  safeNavigateBack('/pages/profile/index')
}

const handleSave = () => {
  // Allow empty string to represent "cleared".
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

.edit-page { min-height: 100vh; background: #0f0f0f; }
.top-safe { padding-left: 16rpx; padding-right: 16rpx; }
.page-header { padding: 0 16rpx; display: flex; align-items: center; justify-content: space-between; }
.header-title, .header-action { color: $text-white; }
.page-header { height: 56rpx; }
.header-title { font-size: 30rpx; font-weight: 700; }
.header-action { min-width: 40rpx; text-align: center; font-size: 24rpx; }
.header-action.done { color: #22d3ee; }
.form-area { padding: 24rpx 16rpx; }
.text-area { width: 100%; min-height: 260rpx; border-radius: 24rpx; background: #1a1a1a; color: $text-white; font-size: 28rpx; padding: 24rpx; box-sizing: border-box; }
.text-placeholder { color: #6b7280; }
.count-text { display: block; color: #8e8e93; font-size: 22rpx; text-align: right; margin-top: 12rpx; }
</style>
