<template>
  <view class="role-page">
    <view class="status-bar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <text class="status-time">9:41</text>
      <view class="status-icons"><text class="status-glyph">⌁</text><text class="status-glyph">◉</text><text class="status-glyph">▣</text></view>
    </view>
    <view class="page-header">
      <text class="header-action" @click="goBack">←</text>
      <text class="header-title">课堂角色</text>
      <view class="header-placeholder"></view>
    </view>
    <scroll-view class="role-scroll" scroll-y v-if="classroom">
      <view class="title-area">
        <text class="big-title">你的课堂角色</text>
        <text class="sub-copy">AI 为你生成了专属的学习伙伴</text>
      </view>
      <view class="cards-area">
        <view v-for="role in classroom.roles" :key="role.id" class="role-card" :class="role.id">
          <view class="role-head">
            <view class="role-avatar" :class="role.id"><text class="role-avatar-text">{{ role.name.slice(0, 1) }}</text></view>
            <view class="role-meta">
              <text class="role-type">{{ role.type }}</text>
              <text class="role-name">{{ role.name }}</text>
            </view>
          </view>
          <text class="role-desc">{{ role.description }}</text>
        </view>
      </view>
    </scroll-view>
    <view class="bottom-button" @click="startGenerate"><text class="bottom-button-text">继续</text></view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getClassroomDetail } from '@/services/api'
import { getLayoutMetrics } from '@/utils/layout'

const { statusBarHeight } = getLayoutMetrics()
const classroom = ref(null)
let classroomId = ''
const goBack = () => uni.navigateBack()

const loadClassroom = async () => {
  try {
    const response = await getClassroomDetail(classroomId)
    classroom.value = response.classroom
  } catch (error) {
    uni.showToast({ title: error.message, icon: 'none' })
  }
}

const startGenerate = () => {
  uni.navigateTo({ url: `/pages/school/outline-loading?id=${classroomId}` })
}

onLoad((query) => {
  classroomId = query.id || ''
  loadClassroom()
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';
.role-page { min-height: 100vh; background: #0a0a0a; display: flex; flex-direction: column; }
.status-bar, .page-header { padding: 0 24rpx; display: flex; align-items: center; justify-content: space-between; }
.status-bar { height: 62rpx; }
.status-time, .status-glyph, .header-action, .header-title { color: $text-white; }
.status-icons { display: flex; gap: 8rpx; }
.header-title { font-size: 30rpx; font-weight: 700; }
.header-action, .header-placeholder { width: 40rpx; text-align: center; }
.role-scroll { flex: 1; }
.title-area { padding: 20rpx 24rpx 0; }
.big-title { display: block; color: $text-white; font-size: 38rpx; font-weight: 700; margin-bottom: 10rpx; }
.sub-copy { color: #a1a1aa; font-size: 24rpx; }
.cards-area { padding: 16rpx 24rpx 24rpx; }
.role-card { border-radius: 24rpx; background: #18181b; border: 2rpx solid #27272a; padding: 22rpx; margin-bottom: 16rpx; }
.role-card.teacher { border-color: rgba(124,58,237,0.5); }
.role-card.assistant { border-color: rgba(34,211,238,0.5); }
.role-card.student { border-color: rgba(196,248,42,0.5); }
.role-head { display: flex; align-items: center; gap: 16rpx; margin-bottom: 14rpx; }
.role-avatar { width: 72rpx; height: 72rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.role-avatar.teacher { background: #7c3aed; }
.role-avatar.assistant { background: #22d3ee; }
.role-avatar.student { background: #c4f82a; }
.role-avatar-text { color: #0a0a0a; font-size: 28rpx; font-weight: 700; }
.role-type { display: block; color: #a1a1aa; font-size: 22rpx; margin-bottom: 4rpx; }
.role-name { color: $text-white; font-size: 30rpx; font-weight: 700; }
.role-desc { color: #a1a1aa; font-size: 24rpx; line-height: 1.65; }
.bottom-button { margin: 0 24rpx 24rpx; height: 96rpx; border-radius: 28rpx; background: #7c3aed; display: flex; align-items: center; justify-content: center; }
.bottom-button-text { color: $text-white; font-size: 30rpx; font-weight: 700; }
</style>
