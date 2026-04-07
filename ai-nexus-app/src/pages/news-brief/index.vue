<template>
  <view class="brief-page">
    <view class="safe-top" :style="{ paddingTop: `${statusBarHeight + 12}px` }">
      <view class="hero-block">
        <view class="back-chip" @click="goBackHome">
          <text class="back-chip-icon">&lt;</text>
          <text class="back-chip-text">返回</text>
        </view>

        <view class="hero-copy">
          <text class="hero-kicker">HOT / WEIRD / REAL</text>
          <text class="hero-title">AI趣闻萃取</text>
          <text class="hero-subtitle">把今天最离谱、最有梗、最值得点开的 AI 热闹，一次筛给你</text>
        </view>
      </view>
    </view>

    <scroll-view class="brief-scroll" scroll-y :show-scrollbar="false">
      <view class="content-shell">
        <view
          v-for="issueItem in issues"
          :key="issueItem.id"
          class="issue-card"
          @click="openIssue(issueItem.id)"
        >
          <view class="issue-card-head">
            <text class="issue-date">{{ formatIssueDate(issueItem) }}</text>
            <text class="issue-count">{{ getIssueMeta(issueItem) }}</text>
          </view>

          <view class="issue-lines">
            <view
              v-for="(newsItem, index) in issueItem.items.slice(0, 3)"
              :key="newsItem.id"
              class="issue-line"
            >
              <text class="issue-line-index" :class="{ active: index === 0 }">
                {{ String(index + 1).padStart(2, '0') }}
              </text>
              <view class="issue-line-copy">
                <text class="issue-line-title" :class="{ active: index === 0 }">
                  {{ newsItem.headline }}
                </text>
                <text v-if="newsItem.warning" class="issue-line-summary">
                  {{ newsItem.warning }}
                </text>
              </view>
            </view>
          </view>

          <view class="issue-card-foot">
            <text class="issue-foot-copy">{{ issueItem.subtitle }}</text>
            <text class="issue-foot-link">点进当天三条</text>
          </view>
        </view>

        <view class="footer-copy">
          <text class="footer-copy-text">{{ latestIssue.footer }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { onBackPress } from '@dcloudio/uni-app'
import { getLatestNewsBriefIssue, getRecentNewsBriefIssues } from '@/data/news-brief'
import { getLayoutMetrics } from '@/utils/layout'
import { safeNavigateBack } from '@/utils/navigation'

const { statusBarHeight } = getLayoutMetrics()

const latestIssue = computed(() => getLatestNewsBriefIssue())
const issues = computed(() => getRecentNewsBriefIssues(7))

const goBackHome = () => {
  safeNavigateBack('/pages/home/index?openSidebar=1')
}

const openIssue = (issueId) => {
  uni.navigateTo({
    url: `/pages/news-brief/issue?id=${encodeURIComponent(issueId)}`,
  })
}

const formatIssueDate = (issue) => {
  const value = String(issue?.id || issue?.date || '').trim()
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) {
    return `${match[1]}年 ${match[2]}月 ${match[3]}日`
  }
  return value
}

const getIssueMeta = (issue) => {
  if (issue?.selectionCount) {
    return `从 ${issue.selectionCount} 条资讯中筛出`
  }
  return `当天 ${Array.isArray(issue?.items) ? issue.items.length : 0} 条重点`
}

onBackPress((options = {}) => {
  if (options.from === 'navigateBack') return false
  goBackHome()
  return true
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';

.brief-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top right, rgba(255, 226, 178, 0.42), transparent 35%),
    linear-gradient(180deg, #fff9f1 0%, #f6eee2 46%, #efe6da 100%);
  color: #171717;
}

.safe-top {
  padding-left: 24rpx;
  padding-right: 24rpx;
}

.hero-block {
  position: relative;
  padding: 34rpx 10rpx 28rpx;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  text-align: center;
}

.back-chip {
  position: absolute;
  left: 0;
  top: 10rpx;
  min-width: 108rpx;
  height: 48rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.62);
  background: rgba(255, 255, 255, 0.76);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  box-shadow: 0 10rpx 22rpx rgba(37, 28, 12, 0.08);
}

.back-chip-icon {
  color: #5a3f2d;
  font-size: 20rpx;
  font-weight: 800;
  line-height: 1;
}

.back-chip-text {
  color: #5a3f2d;
  font-size: 18rpx;
  font-weight: 800;
}

.hero-kicker {
  color: #bf6927;
  font-size: 18rpx;
  font-weight: 800;
  letter-spacing: 5rpx;
  text-transform: uppercase;
  font-family: 'SFMono-Regular', 'JetBrains Mono', 'Consolas', monospace;
}

.hero-title {
  color: #18110d;
  font-size: 64rpx;
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: 1.5rpx;
  text-shadow: 0 8rpx 22rpx rgba(88, 43, 6, 0.08);
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.hero-subtitle {
  color: #775f4c;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1.58;
  max-width: 760rpx;
  font-family: 'Avenir Next', 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.brief-scroll {
  flex: 1;
}

.content-shell {
  padding: 6rpx 20rpx 36rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.issue-card {
  border-radius: 28rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.7);
  background:
    radial-gradient(circle at top right, rgba(255, 244, 223, 0.8), transparent 36%),
    linear-gradient(160deg, rgba(255, 252, 247, 0.98), rgba(244, 232, 215, 0.98));
  box-shadow: 0 16rpx 38rpx rgba(37, 28, 12, 0.08);
  padding: 28rpx 24rpx 22rpx;
}

.issue-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.issue-date {
  color: #7c6654;
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  font-family: 'SFMono-Regular', 'JetBrains Mono', 'Consolas', monospace;
}

.issue-count {
  color: #b67b4b;
  font-size: 16rpx;
  font-weight: 800;
}

.issue-lines {
  margin-top: 22rpx;
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.issue-line {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
}

.issue-line-index {
  min-width: 48rpx;
  color: #d0bca7;
  font-size: 34rpx;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: 1rpx;
  font-family: 'Avenir Next', 'Helvetica Neue', sans-serif;
}

.issue-line-index.active {
  color: #c16224;
}

.issue-line-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.issue-line-title {
  color: #6c716c;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.68;
  font-family: 'Avenir Next', 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.issue-line-title.active {
  color: #17110c;
  font-weight: 800;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.issue-line-summary {
  color: #9d8f80;
  font-size: 18rpx;
  line-height: 1.56;
}

.issue-card-foot {
  margin-top: 22rpx;
  padding-top: 16rpx;
  border-top: 2rpx solid rgba(120, 114, 104, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
}

.issue-foot-copy {
  flex: 1;
  color: #897565;
  font-size: 16rpx;
  line-height: 1.5;
}

.issue-foot-link {
  color: #6d3e1b;
  font-size: 18rpx;
  font-weight: 800;
}

.footer-copy {
  padding: 8rpx 12rpx 6rpx;
}

.footer-copy-text {
  color: #7d6958;
  font-size: 17rpx;
  line-height: 1.72;
}

@media screen and (min-width: 768px) {
  .content-shell {
    width: 100%;
    max-width: 980rpx;
    margin: 0 auto;
  }

  .hero-copy {
    max-width: 980rpx;
    margin: 0 auto;
  }
}
</style>
