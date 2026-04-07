<template>
  <view class="brief-page">
    <view class="safe-top" :style="{ paddingTop: `${statusBarHeight + 12}px` }">
      <view class="hero-block">
        <view class="back-chip" @click="goBackToIssue">
          <text class="back-chip-icon">&lt;</text>
          <text class="back-chip-text">返回</text>
        </view>

        <view class="hero-copy">
          <text class="hero-kicker">{{ item.source || 'AI 简报' }}</text>
          <text class="hero-title">{{ item.headline }}</text>
          <text class="hero-subtitle">{{ issue.title }}</text>
        </view>
      </view>
    </view>

    <scroll-view class="brief-scroll" scroll-y :show-scrollbar="false">
      <view class="content-shell">
        <NewsBriefCard :item="item" :card-number="cardNumber" @open-link="openArticle(item)" />

        <view class="footer-copy">
          <text class="footer-copy-text">{{ issue.footer }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onBackPress, onLoad } from '@dcloudio/uni-app'
import NewsBriefCard from '@/components/NewsBriefCard.vue'
import { getLatestNewsBriefIssue } from '@/data/news-brief'
import { getNewsBrief } from '@/services/api'
import {
  fetchLatestNewsBriefIssue,
  getLatestNewsBriefIssueId,
  getRenderableNewsBriefIssueById,
  getRenderableNewsBriefItemByIds,
} from '@/data/news-brief-runtime'
import { getLayoutMetrics } from '@/utils/layout'
import { safeNavigateBack } from '@/utils/navigation'

const { statusBarHeight } = getLayoutMetrics()

const latestIssueId = getLatestNewsBriefIssueId()
const issueId = ref(latestIssueId)
const itemId = ref('')
const issue = ref(getRenderableNewsBriefIssueById(latestIssueId) || getLatestNewsBriefIssue())
const item = ref(issue.value.items[0] || {})

const cardNumber = computed(() => {
  const currentItems = Array.isArray(issue.value?.items) ? issue.value.items : []
  const index = currentItems.findIndex((entry) => entry.id === item.value?.id)
  return index >= 0 ? index + 1 : 1
})

const openArticle = (newsItem) => {
  if (!newsItem?.articleUrl) return
  uni.navigateTo({
    url: `/pages/workshop/preview?url=${encodeURIComponent(newsItem.articleUrl)}&title=${encodeURIComponent(newsItem.headline || '新闻详情')}`,
  })
}

const goBackToIssue = () => {
  safeNavigateBack(`/pages/news-brief/issue?id=${encodeURIComponent(issueId.value || issue.value.id)}`)
}

const applyRemoteBrief = async () => {
  const newsId = Number(item.value?.newsId || item.value?.id || 0)
  if (!newsId) return

  try {
    const response = await getNewsBrief(newsId)
    const brief = response?.data
    if (!brief || typeof brief !== 'object') return

    const paragraphs = Array.isArray(brief.paragraphs)
      ? brief.paragraphs.map((paragraph) => String(paragraph || '').trim()).filter(Boolean)
      : []

    item.value = {
      ...item.value,
      headline: String(brief.headline || item.value.headline || '').trim(),
      warning: String(brief.lead || item.value.warning || '').trim(),
      expandedBody: paragraphs.length > 0 ? paragraphs : item.value.expandedBody,
    }
  } catch (error) {
    // Keep the cached card content when the remote brief API is unavailable.
  }
}

const syncDetail = async () => {
  issue.value = getRenderableNewsBriefIssueById(issueId.value)
  item.value = getRenderableNewsBriefItemByIds(issueId.value, itemId.value) || issue.value.items[0] || {}

  if (issueId.value !== latestIssueId) return

  try {
    const latestIssue = await fetchLatestNewsBriefIssue()
    issue.value = latestIssue
    item.value = getRenderableNewsBriefItemByIds(issueId.value, itemId.value) || latestIssue.items[0] || {}
  } catch (error) {
    if (!item.value?.id) {
      uni.showToast({
        title: error?.message || '获取新闻详情失败',
        icon: 'none',
      })
    }
  }

  await applyRemoteBrief()
}

onLoad((query = {}) => {
  issueId.value = query.issueId || query.id || latestIssueId
  itemId.value = query.itemId || ''
  syncDetail()
})

onBackPress((options = {}) => {
  if (options.from === 'navigateBack') return false
  goBackToIssue()
  return true
})
</script>

<style lang="scss" scoped>
.brief-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top right, rgba(255, 232, 185, 0.42), transparent 36%),
    linear-gradient(180deg, #fff9f1 0%, #f4ede3 48%, #efe7dc 100%);
  color: #171717;
}

.safe-top {
  padding-left: 24rpx;
  padding-right: 24rpx;
}

.hero-block {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 8rpx 2rpx 10rpx;
}

.back-chip {
  align-self: flex-start;
  min-width: 110rpx;
  height: 48rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.84);
  border: 2rpx solid rgba(84, 54, 24, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  box-shadow: 0 8rpx 22rpx rgba(84, 54, 24, 0.08);
}

.back-chip-icon,
.back-chip-text {
  color: #5f422a;
  font-size: 20rpx;
  font-weight: 800;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.hero-kicker {
  color: #b9652e;
  font-size: 18rpx;
  font-weight: 800;
  letter-spacing: 4rpx;
  text-transform: uppercase;
  font-family: 'SFMono-Regular', 'JetBrains Mono', 'Consolas', monospace;
}

.hero-title {
  color: #14100c;
  font-size: 48rpx;
  font-weight: 900;
  line-height: 1.22;
  letter-spacing: 0.6rpx;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.hero-subtitle {
  color: #77614d;
  font-size: 22rpx;
  line-height: 1.5;
  font-weight: 700;
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

.footer-copy {
  padding: 4rpx 12rpx 8rpx;
}

.footer-copy-text {
  color: #816e59;
  font-size: 18rpx;
  line-height: 1.7;
}
</style>
