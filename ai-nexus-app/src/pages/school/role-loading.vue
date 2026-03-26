<template>
  <view class="loading-page">
    <view class="status-bar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <text class="status-time">9:41</text>
      <view class="status-icons"><text class="status-glyph">⌁</text><text class="status-glyph">◉</text><text class="status-glyph">▣</text></view>
    </view>
    <view class="page-header">
      <text class="header-action" @click="goBack">←</text>
      <text class="header-title">生成课堂</text>
      <view class="header-placeholder"></view>
    </view>
    <view class="loading-content">
      <text class="loading-title">生成课堂角色</text>
      <text class="loading-copy">{{ loadingTip }}</text>
      <view class="cards-row">
        <view class="role-card teacher"><text class="role-card-text">教师</text></view>
        <view class="role-card assistant"><text class="role-card-text">助教</text></view>
        <view class="role-card student"><text class="role-card-text">学生</text></view>
      </view>
      <text class="loading-foot">AI 智能体工作中...</text>
    </view>
  </view>
</template>

<script setup>
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getLayoutMetrics } from '@/utils/layout'

const { statusBarHeight } = getLayoutMetrics()
const loadingTip = ref('正在根据课程内容生成角色...')
let firstTimer = null
let secondTimer = null
let classroomId = ''
let topic = ''
const goBack = () => uni.navigateBack()

onLoad((query) => {
  classroomId = query.id || ''
  topic = query.topic || ''
  firstTimer = setTimeout(() => { loadingTip.value = '正在组织老师、助教和学生代表的人设...' }, 900)
  secondTimer = setTimeout(() => {
    uni.redirectTo({ url: `/pages/school/role-intro?id=${classroomId}&topic=${encodeURIComponent(topic)}` })
  }, 1600)
})

onUnload(() => {
  clearTimeout(firstTimer)
  clearTimeout(secondTimer)
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';
.loading-page { min-height: 100vh; background: #0a0a0a; }
.status-bar, .page-header { padding: 0 24rpx; display: flex; align-items: center; justify-content: space-between; }
.status-bar { height: 62rpx; }
.status-time, .status-glyph, .header-action, .header-title { color: $text-white; }
.status-icons { display: flex; gap: 8rpx; }
.header-title { font-size: 30rpx; font-weight: 700; }
.header-action, .header-placeholder { width: 40rpx; text-align: center; }
.loading-content { min-height: calc(100vh - 140rpx); padding: 120rpx 24rpx 0; display: flex; flex-direction: column; align-items: center; }
.loading-title { color: $text-white; font-size: 38rpx; font-weight: 700; margin-bottom: 12rpx; }
.loading-copy, .loading-foot { color: #a1a1aa; font-size: 26rpx; }
.cards-row { display: flex; justify-content: center; gap: 16rpx; margin: 36rpx 0 24rpx; }
.role-card { width: 120rpx; height: 160rpx; border-radius: 20rpx; display: flex; align-items: center; justify-content: center; }
.role-card.teacher { background: #7c3aed; }
.role-card.assistant { background: #22d3ee; }
.role-card.student { background: #c4f82a; }
.role-card-text { color: #0a0a0a; font-size: 24rpx; font-weight: 700; }
</style>
