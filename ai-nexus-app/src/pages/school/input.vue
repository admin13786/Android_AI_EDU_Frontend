<template>
  <view class="school-page">
    <view class="top-safe" :style="{ paddingTop: `${statusBarHeight}px` }"></view>
    <view class="page-header">
      <text class="header-action" @click="goBackToWorkshop">←</text>
      <text class="header-title">AI 学堂</text>
      <text class="header-action" @click="openHistory">⋯</text>
    </view>
    <scroll-view class="school-scroll" scroll-y>
      <view class="hero-section">
        <view class="hero-badge"></view>
        <text class="hero-title">AI 学堂</text>
        <text class="hero-copy">多智能体交互式课堂的生成式学习</text>
      </view>
      <view class="search-bar">
        <input class="search-input" v-model="topic" placeholder="输入你想学的任何内容，例如：提示词工程、RAG、AI Agent..." placeholder-class="search-placeholder" maxlength="100" @confirm="handleSubmit" />
      </view>
      <view class="empty-card">
        <text class="empty-title">开始一节新课堂</text>
        <text class="empty-copy">输入学习目标，系统会为你生成白板课件、讲解语音与互动问答。</text>
      </view>
    </scroll-view>
    <view class="bottom-action" :class="{ disabled: loading }" :style="{ paddingBottom: safeAreaInsetsBottom + 'px' }" @click="handleSubmit">
      <text class="bottom-action-text">{{ loading ? '正在创建课堂...' : '立即开课' }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { createClassroom } from '@/services/api'
import { getLayoutMetrics } from '@/utils/layout'

const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics()
const topic = ref('')
const loading = ref(false)

const goBackToWorkshop = () => {
  uni.reLaunch({ url: '/pages/home/index?openSidebar=1' })
}

const openHistory = () => {
  uni.navigateTo({ url: '/pages/school/history' })
}

const handleSubmit = async () => {
  const value = topic.value.trim()
  if (!value) {
    uni.showToast({ title: '请输入学习主题', icon: 'none' })
    return
  }
  if (loading.value) return
  loading.value = true
  uni.navigateTo({
    url: `/pages/school/role-loading?topic=${encodeURIComponent(value)}`,
    success: () => {
      loading.value = false
    },
    fail: () => {
      loading.value = false
      uni.showToast({ title: '页面跳转失败', icon: 'none' })
    },
  })
}
</script>

<style lang="scss" scoped>
@import '../../theme.scss';
.school-page { min-height: 100vh; background: #0a0a0a; display: flex; flex-direction: column; }
.top-safe { padding-left: 16rpx; padding-right: 16rpx; }
.page-header { padding-left: 16rpx; padding-right: 16rpx; display: flex; align-items: center; justify-content: space-between; }
.header-title, .header-action { color: $text-white; }
.page-header { height: 56rpx; }
.header-action { width: 40rpx; text-align: center; }
.header-title { font-size: 30rpx; font-weight: 700; }
.school-scroll { flex: 1; }
.hero-section { padding: 24rpx 16rpx 16rpx; display: flex; flex-direction: column; align-items: center; gap: 10rpx; }
.hero-badge { width: 96rpx; height: 96rpx; border-radius: 24rpx; background: linear-gradient(135deg,#8a2be2,#22d3ee); }
.hero-title { color: $text-white; font-size: 38rpx; font-weight: 700; }
.hero-copy { color: #8e8e93; font-size: 22rpx; }
.search-bar { margin: 0 16rpx; height: 88rpx; border-radius: 24rpx; background: #1c1c1e; border: 2rpx solid #00d5ff; padding: 0 20rpx; display: flex; align-items: center; }
.search-input { flex: 1; color: $text-white; font-size: 28rpx; }
.search-placeholder { color: #8e8e93; }
.empty-card { padding: 24rpx 16rpx 24rpx; }
.empty-title { display: block; color: $text-white; font-size: 30rpx; font-weight: 700; margin-bottom: 10rpx; }
.empty-copy { color: #8e8e93; font-size: 24rpx; line-height: 1.65; }
.bottom-action { margin: 0 16rpx 16rpx; height: 92rpx; border-radius: 24rpx; background: #8a2be2; display: flex; align-items: center; justify-content: center; }
.bottom-action.disabled { opacity: 0.65; }
.bottom-action-text { color: $text-white; font-size: 30rpx; font-weight: 700; }
</style>
