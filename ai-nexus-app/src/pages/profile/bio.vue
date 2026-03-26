<template>
  <view class="edit-page">
    <view class="status-bar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <text class="status-time">13:10</text>
      <view class="status-icons">
        <text class="status-glyph">◦</text>
        <text class="status-glyph">◦</text>
        <text class="status-glyph">▮</text>
      </view>
    </view>

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
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getLayoutMetrics } from '@/utils/layout'
import { getLocalProfile, saveLocalProfile, setProfilePendingToast } from '@/utils/profile'

const { statusBarHeight } = getLayoutMetrics()
const bio = ref('')

const goBack = () => {
  uni.navigateBack()
}

const handleSave = () => {
  saveLocalProfile({ bio: bio.value.trim() || '这个人很神秘，还没有留下自我介绍。' })
  setProfilePendingToast('自我介绍修改成功')
  uni.navigateBack()
}

onLoad(() => {
  bio.value = getLocalProfile().bio
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';

.edit-page { min-height: 100vh; background: #0f0f0f; }
.status-bar, .page-header { padding: 0 16rpx; display: flex; align-items: center; justify-content: space-between; }
.status-bar { height: 44rpx; }
.status-time, .status-glyph, .header-title, .header-action { color: $text-white; }
.status-time, .status-glyph { font-size: 24rpx; font-weight: 600; }
.status-icons { display: flex; gap: 10rpx; }
.page-header { height: 56rpx; }
.header-title { font-size: 30rpx; font-weight: 700; }
.header-action { min-width: 40rpx; text-align: center; font-size: 24rpx; }
.header-action.done { color: #22d3ee; }
.form-area { padding: 24rpx 16rpx; }
.text-area { width: 100%; min-height: 260rpx; border-radius: 24rpx; background: #1a1a1a; color: $text-white; font-size: 28rpx; padding: 24rpx; box-sizing: border-box; }
.text-placeholder { color: #6b7280; }
.count-text { display: block; color: #8e8e93; font-size: 22rpx; text-align: right; margin-top: 12rpx; }
</style>
