<template>
  <view class="loading-page">
    <view class="top-safe" :style="{ paddingTop: `${statusBarHeight}px` }"></view>
    <view class="page-header">
      <text class="header-action" @click="goBack">←</text>
      <text class="header-title">生成课堂</text>
      <view class="header-placeholder"></view>
    </view>
    <view class="loading-content">
      <text class="loading-title">生成课程大纲</text>
      <text class="loading-copy">{{ loadingTip }}</text>
      <view class="doc-card">
        <text class="doc-icon">▤</text>
        <view class="progress-track"><view class="progress-fill"></view></view>
      </view>
      <text class="loading-foot">即将进入课堂</text>
    </view>
  </view>
</template>

<script setup>
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getLayoutMetrics } from '@/utils/layout'
import { safeNavigateBack } from '@/utils/navigation'

const { statusBarHeight } = getLayoutMetrics()
const loadingTip = ref('正在构建学习路径...')
let firstTimer = null
let secondTimer = null
let classroomId = ''
const goBack = () => safeNavigateBack('/pages/school/input')

onLoad((query) => {
  classroomId = query.id || ''
  if (!classroomId) {
    loadingTip.value = '缺少课堂 ID，请返回重试'
    uni.showToast({ title: '缺少课堂 ID', icon: 'none' })
    return
  }
  firstTimer = setTimeout(() => { loadingTip.value = '正在组织课堂内容和互动消息...' }, 900)
  secondTimer = setTimeout(() => { uni.redirectTo({ url: `/pages/school/classroom?id=${classroomId}` }) }, 1600)
})

onUnload(() => {
  clearTimeout(firstTimer)
  clearTimeout(secondTimer)
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';
.loading-page { min-height: 100vh; background: #0a0a0a; }
.top-safe { padding-left: 24rpx; padding-right: 24rpx; }
.page-header { padding: 0 24rpx; display: flex; align-items: center; justify-content: space-between; }
.header-action, .header-title { color: $text-white; }
.header-title { font-size: 30rpx; font-weight: 700; }
.header-action, .header-placeholder { width: 40rpx; text-align: center; }
.loading-content { min-height: calc(100vh - 140rpx); padding: 120rpx 24rpx 0; display: flex; flex-direction: column; align-items: center; }
.loading-title { color: $text-white; font-size: 38rpx; font-weight: 700; margin-bottom: 12rpx; }
.loading-copy, .loading-foot { color: #a1a1aa; font-size: 26rpx; }
.doc-card { width: 560rpx; height: 400rpx; border-radius: 28rpx; border: 2rpx solid #27272a; background: #18181b; margin: 40rpx 0 24rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20rpx; }
.doc-icon { color: #22d3ee; font-size: 88rpx; }
.progress-track { width: 320rpx; height: 8rpx; border-radius: 999rpx; background: #27272a; overflow: hidden; }
.progress-fill { width: 56%; height: 100%; background: linear-gradient(90deg,#22d3ee,#7c3aed); }
</style>
