<template>
  <view class="news-page">
    <view class="top-bar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="page-header">
        <view class="header-side header-back" @click="goBackToWorkshop">
          <text class="header-back-icon">←</text>
          <!-- <text class="header-back-text">退出</text> -->
        </view>
        <text class="header-title">AI 观察哨</text>
        <view class="header-side header-placeholder"></view>
      </view>

      <view class="segment-wrap">
        <view class="segment-control">
          <view class="segment-item" :class="{ active: activeTab === 'business' }" @click="switchTab('business')">
            <text class="segment-text">商业榜</text>
          </view>
          <view class="segment-item" :class="{ active: activeTab === 'personal' }" @click="switchTab('personal')">
            <text class="segment-text">个人榜</text>
          </view>
        </view>
      </view>
    </view>

    <scroll-view
      class="news-scroll"
      :style="newsScrollStyle"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="loadNews"
    >
      <view class="news-list" v-if="newsList.length > 0">
        <view v-for="(item, index) in newsList" :key="item.id" class="news-card" @click="viewDetail(item)">
          <view class="card-top">
            <view class="rank-chip">
              <text class="rank-chip-text">#{{ index + 1 }}</text>
            </view>
            <text class="card-score">热度 {{ item.score }}</text>
          </view>

          <text class="card-title">{{ item.title }}</text>
          <text class="card-summary">{{ item.summary }}</text>

          <view class="card-tags">
            <view class="tag primary">
              <text class="tag-text">{{ item.source || 'AI资讯速览' }}</text>
            </view>
            <view class="tag">
              <text class="tag-text">{{ activeTab === 'business' ? '商业' : '个人' }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="loading" class="loading-state">
        <text class="loading-title">正在拉取资讯</text>
        <text class="loading-copy">首次启动后端时可能需要一点初始化时间，稍后下拉刷新即可。</text>
      </view>

      <view v-else class="empty-state">
        <text class="empty-title">还没有资讯内容</text>
        <text class="empty-copy">后端抓取完成后，这里会显示最新榜单。你也可以切换榜单类型再试一次。</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { onBackPress } from '@dcloudio/uni-app'
import { getNewsList } from '@/services/api'
import { getLayoutMetrics } from '@/utils/layout'

const { statusBarHeight } = getLayoutMetrics()
const topBarOffset = `${statusBarHeight + uni.upx2px(222)}px`
const newsScrollStyle = {
  marginTop: topBarOffset,
  height: `calc(100vh - ${topBarOffset})`,
}

const activeTab = ref('business')
const newsList = ref([])
const loading = ref(false)
const refreshing = ref(false)

const goBackToWorkshop = () => {
  uni.reLaunch({ url: '/pages/home/index?openSidebar=1' })
}

const switchTab = (tab) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  loadNews()
}

const loadNews = async () => {
  loading.value = true
  refreshing.value = true
  try {
    const response = await getNewsList(activeTab.value)
    newsList.value = response.list || []
  } catch (error) {
    newsList.value = []
    uni.showToast({ title: error.message, icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const viewDetail = (item) => {
  if (!item.url) return
  uni.navigateTo({
    url: `/pages/workshop/preview?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title || '新闻详情')}`,
  })
}

onMounted(() => {
  loadNews()
})

onBackPress((options = {}) => {
  if (options.from === 'navigateBack') {
    return false
  }

  goBackToWorkshop()
  return true
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';

.news-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(255, 229, 192, 0.34), transparent 34%),
    linear-gradient(180deg, $paper-bg 0%, $paper-bg-soft 52%, $paper-bg-deep 100%);
  display: flex;
  flex-direction: column;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  flex-shrink: 0;
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
  width: 144rpx;
  min-width: 144rpx;
}

.header-back {
  width: 72rpx;
  min-width: 72rpx;
  height: 72rpx;
  padding: 0;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.82);
  border: 2rpx solid rgba(107, 62, 31, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  box-shadow: $shadow-soft;
}

.header-placeholder {
  height: 72rpx;
}

.header-back-icon,
.header-back-text,
.header-title {
  color: $ink-strong;
}

.header-back-icon {
  font-size: 34rpx;
  font-weight: 800;
  line-height: 1;
}

.header-back-text {
  font-size: 26rpx;
  font-weight: 700;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 44rpx;
  font-weight: 900;
  letter-spacing: 1rpx;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.segment-wrap {
  padding-top: 12rpx;
}

.segment-control {
  background: rgba(255, 255, 255, 0.66);
  border-radius: 30rpx;
  padding: 8rpx;
  display: flex;
  gap: 8rpx;
  border: 2rpx solid rgba(107, 62, 31, 0.08);
  box-shadow: $shadow-soft;
}

.segment-item {
  flex: 1;
  height: 72rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.segment-item.active {
  background:
    radial-gradient(circle at top right, rgba(255, 236, 208, 0.96), transparent 36%),
    linear-gradient(145deg, rgba(255, 251, 245, 0.98), rgba(244, 232, 214, 0.98));
}

.segment-text {
  color: $ink-soft;
  font-size: 26rpx;
  font-weight: 700;
}

.segment-item.active .segment-text {
  color: $accent-brand-deep;
}

.news-scroll {
  flex: 1;
}

.news-list,
.empty-state,
.loading-state {
  padding: 20rpx 24rpx 30rpx;
}

.news-card {
  border-radius: 30rpx;
  background:
    radial-gradient(circle at top right, rgba(255, 237, 209, 0.8), transparent 35%),
    linear-gradient(160deg, rgba(255, 252, 247, 0.98), rgba(244, 233, 217, 0.98));
  border: 2rpx solid rgba(107, 62, 31, 0.08);
  padding: 26rpx 24rpx 24rpx;
  margin-bottom: 18rpx;
  box-shadow: $shadow-card;
}

.card-top,
.card-tags {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-top {
  margin-bottom: 18rpx;
}

.rank-chip,
.tag {
  border-radius: 999rpx;
  padding: 10rpx 18rpx;
  background: rgba(255, 255, 255, 0.68);
  border: 2rpx solid rgba(107, 62, 31, 0.08);
}

.rank-chip {
  background: rgba(194, 98, 41, 0.12);
}

.tag.primary {
  background: rgba(111, 123, 77, 0.12);
}

.rank-chip-text,
.tag-text,
.card-score {
  font-size: 22rpx;
}

.rank-chip-text {
  color: $accent-brand-deep;
  font-weight: 800;
}

.card-score,
.tag-text {
  color: $ink-soft;
}

.card-title {
  display: block;
  color: $ink-strong;
  font-size: 32rpx;
  font-weight: 900;
  line-height: 1.45;
  margin-bottom: 14rpx;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.card-summary {
  display: block;
  color: $ink-body;
  font-size: 24rpx;
  line-height: 1.65;
  margin-bottom: 18rpx;
}

.card-tags {
  justify-content: flex-start;
  gap: 12rpx;
}

.empty-title,
.loading-title {
  display: block;
  color: $ink-strong;
  font-size: 34rpx;
  font-weight: 900;
  margin-bottom: 12rpx;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.empty-copy,
.loading-copy {
  color: $ink-body;
  font-size: 26rpx;
  line-height: 1.7;
}

.empty-state,
.loading-state {
  margin: 0 4rpx;
  border-radius: 30rpx;
  background:
    radial-gradient(circle at top right, rgba(255, 235, 203, 0.78), transparent 36%),
    linear-gradient(160deg, rgba(255, 252, 247, 0.96), rgba(243, 234, 221, 0.96));
  border: 2rpx dashed rgba(107, 62, 31, 0.16);
  box-shadow: $shadow-card;
}
</style>
