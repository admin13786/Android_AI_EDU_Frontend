<template>
  <view class="brief-page">
    <view class="safe-top" :style="{ paddingTop: `${statusBarHeight + 12}px` }">
      <view class="hero-block">
        <view class="hero-actions">
          <view class="back-chip" @click="goBackHome">
            <text class="back-chip-icon">&lt;</text>
            <text class="back-chip-text">返回</text>
          </view>

          <view class="archive-chip" @click="openArchive">
            <text class="archive-chip-text">往期回顾</text>
          </view>
        </view>

        <view class="hero-copy">
          <text class="hero-kicker">3 STORIES / 1 DAY</text>
          <text class="hero-title">{{ issue.title }}</text>
          <text class="hero-subtitle">{{ issue.subtitle }}</text>
        </view>
      </view>
    </view>

    <scroll-view class="brief-scroll" scroll-y :show-scrollbar="false">
      <view class="content-shell">
        <NewsBriefSummaryCard
          v-for="(item, index) in issue.items"
          :key="item.id"
          :item="item"
          :card-number="index + 1"
          :tone-index="(index % 3) + 1"
          @open-brief="openBrief(item)"
          @open-link="openArticle(item)"
        />

        <view v-if="loading && !issue.items.length" class="loading-copy">
          <text class="loading-copy-text">正在同步今天的 AI 热榜前三条...</text>
        </view>

        <view class="footer-copy">
          <text class="footer-copy-text">{{ issue.footer }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onBackPress, onLoad } from '@dcloudio/uni-app'
import NewsBriefSummaryCard from '@/components/NewsBriefSummaryCard.vue'
import { getLatestNewsBriefIssue } from '@/data/news-brief'
import {
  fetchLatestNewsBriefIssue,
  getLatestNewsBriefIssueId,
  getRenderableNewsBriefIssueById,
} from '@/data/news-brief-runtime'
import { getLayoutMetrics } from '@/utils/layout'
import { safeNavigateBack } from '@/utils/navigation'

const { statusBarHeight } = getLayoutMetrics()
const latestIssueId = getLatestNewsBriefIssueId()
const issue = ref(getRenderableNewsBriefIssueById(latestIssueId) || getLatestNewsBriefIssue())
const loading = ref(false)

const openBrief = (item) => {
  if (!item?.id) return
  uni.navigateTo({
    url: `/pages/news-brief/brief?issueId=${encodeURIComponent(issue.value.id)}&itemId=${encodeURIComponent(item.id)}`,
  })
}

const openArticle = (item) => {
  if (!item?.articleUrl) return
  uni.navigateTo({
    url: `/pages/workshop/preview?url=${encodeURIComponent(item.articleUrl)}&title=${encodeURIComponent(item.headline || '新闻详情')}`,
  })
}

const openArchive = () => {
  uni.navigateTo({
    url: '/pages/news-brief/index',
  })
}

const goBackHome = () => {
  safeNavigateBack('/pages/home/index?openSidebar=1')
}

const loadIssue = async (rawIssueId = '') => {
  const targetIssueId = rawIssueId || latestIssueId
  issue.value = getRenderableNewsBriefIssueById(targetIssueId)

  if (targetIssueId !== latestIssueId) return

  loading.value = true
  try {
    const latestIssue = await fetchLatestNewsBriefIssue()
    if (Array.isArray(latestIssue?.items) && latestIssue.items.length > 0) {
      issue.value = latestIssue
    }
  } catch (error) {
    uni.showToast({
      title: error?.message || '获取今日趣闻失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

onLoad((query = {}) => {
  loadIssue(query.id)
})

onBackPress((options = {}) => {
  if (options.from === 'navigateBack') return false
  goBackHome()
  return true
})
</script>

<style lang="scss" scoped>
.brief-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top right, rgba(255, 232, 195, 0.38), transparent 36%),
    linear-gradient(180deg, #fff8f0 0%, #f3ece0 52%, #eee5d9 100%);
  color: #171717;
}

.safe-top {
  padding-left: 24rpx;
  padding-right: 24rpx;
}

.hero-block {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  padding: 8rpx 4rpx 10rpx;
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.back-chip,
.archive-chip {
  height: 48rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.76);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(37, 28, 12, 0.08);
}

.back-chip {
  min-width: 108rpx;
  gap: 8rpx;
}

.archive-chip {
  min-width: 150rpx;
  padding: 0 18rpx;
}

.back-chip-icon {
  color: #5d422e;
  font-size: 20rpx;
  font-weight: 800;
  line-height: 1;
}

.back-chip-text,
.archive-chip-text {
  color: #5d422e;
  font-size: 18rpx;
  font-weight: 800;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.hero-kicker {
  color: #c26229;
  font-size: 18rpx;
  font-weight: 800;
  letter-spacing: 4rpx;
  text-transform: uppercase;
  font-family: 'SFMono-Regular', 'JetBrains Mono', 'Consolas', monospace;
}

.hero-title {
  color: #15100d;
  font-size: 48rpx;
  font-weight: 900;
  line-height: 1.2;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.hero-subtitle {
  color: #7a6552;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 1.52;
  font-family: 'Avenir Next', 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.brief-scroll {
  flex: 1;
}

.content-shell {
  padding: 14rpx 20rpx 34rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.loading-copy {
  padding: 18rpx 12rpx 8rpx;
}

.loading-copy-text {
  color: #7d6956;
  font-size: 20rpx;
  line-height: 1.6;
}

.footer-copy {
  padding: 4rpx 10rpx 8rpx;
}

.footer-copy-text {
  color: #7d6956;
  font-size: 18rpx;
  line-height: 1.7;
}
</style>
