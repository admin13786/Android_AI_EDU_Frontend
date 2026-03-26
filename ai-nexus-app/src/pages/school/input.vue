<template>
  <view class="school-page">
    <view class="status-bar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <text class="status-time">9:41</text>
      <view class="status-icons"><text class="status-glyph">⌁</text><text class="status-glyph">◉</text><text class="status-glyph">▣</text></view>
    </view>
    <view class="page-header">
      <text class="header-action" @click="goBackToWorkshop">←</text>
      <text class="header-title">AI 学堂</text>
      <view class="header-placeholder"></view>
    </view>
    <scroll-view class="school-scroll" scroll-y>
      <view class="hero-section">
        <view class="hero-badge"></view>
        <text class="hero-title">OpenMAIC</text>
        <text class="hero-copy">多智能体交互式课堂的生成式学习</text>
      </view>
      <view class="search-bar">
        <input class="search-input" v-model="topic" placeholder="输入你想学的任何内容，例如：提示词工程、RAG、AI Agent..." placeholder-class="search-placeholder" maxlength="100" @confirm="handleSubmit" />
      </view>
      <view class="course-list" v-if="historyList.length > 0">
        <view v-for="item in historyList" :key="item.id" class="course-card" @click="goToClassroom(item)">
          <text class="course-title">{{ item.title }}</text>
          <text class="course-subtitle">{{ item.pages || 0 }} 页 · {{ item.date || '最近学习' }}</text>
          <view class="course-tag"><text class="course-tag-text">继续学习</text></view>
        </view>
      </view>
      <view v-else class="empty-card">
        <text class="empty-title">还没有课程记录</text>
        <text class="empty-copy">输入一个学习目标，系统会为你生成一节定制化课堂。</text>
      </view>
    </scroll-view>
    <view class="bottom-action" :class="{ disabled: loading }" :style="{ paddingBottom: safeAreaInsetsBottom + 'px' }" @click="handleSubmit">
      <text class="bottom-action-text">{{ loading ? '正在创建课堂...' : '立即开课' }}</text>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { createClassroom, getClassroomHistory } from '@/services/api'
import { getLayoutMetrics } from '@/utils/layout'

const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics()
const topic = ref('')
const historyList = ref([])
const loading = ref(false)

const goBackToWorkshop = () => {
  uni.reLaunch({ url: '/pages/home/index?openSidebar=1' })
}

const loadHistory = async () => {
  try {
    const response = await getClassroomHistory()
    historyList.value = response.list || []
  } catch (error) {
    historyList.value = []
  }
}

const handleSubmit = async () => {
  const value = topic.value.trim()
  if (!value) {
    uni.showToast({ title: '请输入学习主题', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const response = await createClassroom(value)
    uni.navigateTo({ url: `/pages/school/role-loading?id=${response.classroomId}&topic=${encodeURIComponent(value)}` })
  } catch (error) {
    uni.showToast({ title: error.message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

const goToClassroom = (item) => {
  uni.navigateTo({ url: `/pages/school/classroom?id=${item.id}` })
}

onMounted(() => { loadHistory() })

onShow(() => { loadHistory() })
</script>

<style lang="scss" scoped>
@import '../../theme.scss';
.school-page { min-height: 100vh; background: #0a0a0a; display: flex; flex-direction: column; }
.status-bar, .page-header { padding-left: 16rpx; padding-right: 16rpx; display: flex; align-items: center; justify-content: space-between; }
.status-bar { height: 62rpx; }
.status-time, .status-glyph, .header-title, .header-action { color: $text-white; }
.status-time, .status-glyph { font-size: 24rpx; font-weight: 600; }
.status-icons { display: flex; gap: 8rpx; }
.page-header { height: 56rpx; }
.header-action, .header-placeholder { width: 40rpx; text-align: center; }
.header-title { font-size: 30rpx; font-weight: 700; }
.school-scroll { flex: 1; }
.hero-section { padding: 24rpx 16rpx 16rpx; display: flex; flex-direction: column; align-items: center; gap: 10rpx; }
.hero-badge { width: 96rpx; height: 96rpx; border-radius: 24rpx; background: linear-gradient(135deg,#8a2be2,#22d3ee); }
.hero-title { color: $text-white; font-size: 38rpx; font-weight: 700; }
.hero-copy { color: #8e8e93; font-size: 22rpx; }
.search-bar { margin: 0 16rpx; height: 88rpx; border-radius: 24rpx; background: #1c1c1e; border: 2rpx solid #00d5ff; padding: 0 20rpx; display: flex; align-items: center; }
.search-input { flex: 1; color: $text-white; font-size: 28rpx; }
.search-placeholder { color: #8e8e93; }
.course-list, .empty-card { padding: 16rpx 16rpx 24rpx; }
.course-card { border-radius: 20rpx; background: #1c1c1e; padding: 24rpx; margin-bottom: 16rpx; }
.course-title { display: block; color: $text-white; font-size: 30rpx; font-weight: 700; line-height: 1.45; margin-bottom: 8rpx; }
.course-subtitle { display: block; color: #8e8e93; font-size: 22rpx; margin-bottom: 16rpx; }
.course-tag { width: fit-content; border-radius: 999rpx; background: rgba(138,43,226,0.2); padding: 8rpx 16rpx; }
.course-tag-text { color: #c4b5fd; font-size: 20rpx; }
.empty-title { display: block; color: $text-white; font-size: 30rpx; font-weight: 700; margin-bottom: 10rpx; }
.empty-copy { color: #8e8e93; font-size: 24rpx; line-height: 1.65; }
.bottom-action { margin: 0 16rpx 16rpx; height: 92rpx; border-radius: 24rpx; background: #8a2be2; display: flex; align-items: center; justify-content: center; }
.bottom-action.disabled { opacity: 0.65; }
.bottom-action-text { color: $text-white; font-size: 30rpx; font-weight: 700; }
</style>
