<template>
  <view class="history-page">
    <view class="top-safe" :style="{ paddingTop: `${statusBarHeight}px` }"></view>

    <view class="page-header">
      <text class="header-action" @click="goBack">←</text>
      <text class="header-title">历史课堂</text>
      <view class="header-placeholder"></view>
    </view>

    <scroll-view class="history-scroll" scroll-y>
      <view class="course-list" v-if="historyList.length > 0">
        <view v-for="item in historyList" :key="item.id" class="course-card" @click="goToClassroom(item)">
          <view class="course-top">
            <text class="course-title">{{ item.title }}</text>
            <view class="delete-btn" @click.stop="handleDelete(item)">
              <text class="delete-text">删除</text>
            </view>
          </view>
          <text class="course-subtitle">{{ item.pages || 0 }} 页 · {{ item.date || '最近学习' }}</text>
          <view class="course-tag"><text class="course-tag-text">继续学习</text></view>
        </view>
      </view>

      <view v-else class="empty-card">
        <text class="empty-title">还没有课堂记录</text>
        <text class="empty-copy">回到 AI 学堂，输入一个主题即可生成新的课堂。</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { deleteClassroom, getClassroomHistory } from '@/services/api'
import { getLayoutMetrics } from '@/utils/layout'

const { statusBarHeight } = getLayoutMetrics()
const historyList = ref([])

const goBack = () => {
  uni.navigateBack()
}

const loadHistory = async () => {
  const response = await getClassroomHistory()
  historyList.value = response.list || []
}

const goToClassroom = (item) => {
  uni.navigateTo({ url: `/pages/school/classroom?id=${item.id}` })
}

const handleDelete = async (item) => {
  if (!item?.id) return
  uni.showModal({
    title: '删除课堂',
    content: '确定要删除这节课堂吗？删除后不可恢复。',
    confirmText: '删除',
    confirmColor: '#ef4444',
    success: async (res) => {
      if (!res.confirm) return
      try {
        uni.showLoading({ title: '删除中…', mask: true })
        await deleteClassroom(item.id)
        historyList.value = (historyList.value || []).filter((x) => (x?.id || '') !== item.id)
        uni.showToast({ title: '已删除', icon: 'success' })
        try {
          await loadHistory()
        } catch (e) {
          // ignore: optimistic UI already removed the item
        }
      } catch (error) {
        uni.showToast({ title: error.message || '删除失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
  })
}

onShow(() => {
  loadHistory().catch(() => {
    historyList.value = []
  })
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';

.history-page {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
}

.top-safe {
  padding-left: 16rpx;
  padding-right: 16rpx;
}

.page-header {
  padding-left: 16rpx;
  padding-right: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56rpx;
}

.header-title,
.header-action {
  color: $text-white;
}

.header-action,
.header-placeholder {
  width: 40rpx;
  text-align: center;
}

.header-title {
  font-size: 30rpx;
  font-weight: 700;
}

.history-scroll {
  flex: 1;
}

.course-list,
.empty-card {
  padding: 16rpx 16rpx 24rpx;
}

.course-card {
  border-radius: 20rpx;
  background: #1c1c1e;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.course-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.course-title {
  flex: 1;
  color: $text-white;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.45;
}

.delete-btn {
  height: 44rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  border: 2rpx solid rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-text {
  color: #fca5a5;
  font-size: 22rpx;
  font-weight: 600;
}

.course-subtitle {
  display: block;
  color: #8e8e93;
  font-size: 22rpx;
  margin-bottom: 16rpx;
}

.course-tag {
  width: fit-content;
  border-radius: 999rpx;
  background: rgba(138, 43, 226, 0.2);
  padding: 8rpx 16rpx;
}

.course-tag-text {
  color: #c4b5fd;
  font-size: 20rpx;
}

.empty-title {
  display: block;
  color: $text-white;
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}

.empty-copy {
  color: #8e8e93;
  font-size: 24rpx;
  line-height: 1.65;
}
</style>

