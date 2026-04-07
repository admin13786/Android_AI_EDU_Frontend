<template>
  <view class="preview-page">
    <view class="top-safe" :style="{ paddingTop: `${statusBarHeight}px` }"></view>

    <view class="page-header">
      <text class="header-action" @click="goBack">‹</text>
      <text class="header-title">{{ pageTitle }}</text>
      <text class="header-action" @click="copyLink">⧉</text>
    </view>

    <view v-if="previewUrl" class="webview-wrap">
      <web-view :src="previewUrl"></web-view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-title">暂无可预览页面</text>
      <text class="empty-copy">
        当前结果没有返回可访问的预览地址，请先检查 Workshop 服务和 OSS 配置。
      </text>
    </view>

    <view v-if="previewUrl" class="fallback-bar" :style="{ paddingBottom: `${safeAreaInsetsBottom + 18}px` }">
      <text class="fallback-copy">内嵌预览优先；如打不开可用浏览器兜底</text>
      <view class="fallback-button" @click="openExternal">
        <text class="fallback-button-text">浏览器打开</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onBackPress, onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getLayoutMetrics } from '@/utils/layout'
import { safeNavigateBack } from '@/utils/navigation'

const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics()
const previewUrl = ref('')
const pageTitle = ref('工坊预览')

const goBack = () => {
  safeNavigateBack('/pages/home/index?openSidebar=1')
}

const isHttpUrl = (url) => /^https?:\/\/.+/i.test(url || '')

const copyLink = () => {
  if (!previewUrl.value) return
  if (!isHttpUrl(previewUrl.value)) {
    uni.showToast({ title: '预览地址不合法', icon: 'none' })
    return
  }
  uni.setClipboardData({ data: previewUrl.value })
}

const openExternal = () => {
  if (!previewUrl.value) return
  if (!isHttpUrl(previewUrl.value)) {
    uni.showToast({ title: '预览地址不合法', icon: 'none' })
    return
  }
  uni.showModal({
    title: '提示',
    content: '将使用系统浏览器打开预览链接，是否继续？',
    success: (res) => {
      if (!res.confirm) return
      // #ifdef APP-PLUS
      plus.runtime.openURL(previewUrl.value)
      // #endif
      // #ifdef H5
      window.open(previewUrl.value, '_blank')
      // #endif
    },
  })
}

onLoad((query) => {
  let url = ''
  let title = '工坊预览'
  try {
    url = decodeURIComponent(query.url || '')
    title = decodeURIComponent(query.title || '工坊预览')
  } catch (e) {
    url = ''
    title = '工坊预览'
  }
  pageTitle.value = title
  if (url && !isHttpUrl(url)) {
    uni.showToast({ title: '预览地址不合法', icon: 'none' })
    previewUrl.value = ''
    return
  }
  previewUrl.value = url
})

onBackPress((options = {}) => {
  if (options.from === 'navigateBack') {
    return false
  }

  goBack()
  return true
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';

.preview-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(255, 228, 184, 0.42), transparent 35%),
    linear-gradient(180deg, #fff9f1 0%, #f6eee2 46%, #efe6da 100%);
  display: flex;
  flex-direction: column;
}

.top-safe,
.page-header {
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title,
.header-action {
  color: #5a3f2d;
}

.page-header {
  height: 72rpx;
  background: rgba(255, 248, 240, 0.82);
  backdrop-filter: blur(18rpx);
  box-shadow: 0 12rpx 28rpx rgba(73, 49, 24, 0.06);
}

.header-title {
  font-size: 32rpx;
  font-weight: 900;
  color: #1a120d;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.header-action {
  width: 52rpx;
  height: 52rpx;
  text-align: center;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.74);
  border: 2rpx solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 10rpx 22rpx rgba(37, 28, 12, 0.08);
}

.webview-wrap {
  flex: 1;
  margin: 12rpx 20rpx 0;
  border-radius: 28rpx 28rpx 0 0;
  overflow: hidden;
  box-shadow: 0 18rpx 38rpx rgba(73, 49, 24, 0.08);
  background: rgba(255, 255, 255, 0.58);
}

.empty-state {
  flex: 1;
  margin: 24rpx 20rpx 0;
  padding: 48rpx;
  border-radius: 28rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.72);
  background:
    radial-gradient(circle at top right, rgba(255, 244, 223, 0.82), transparent 36%),
    linear-gradient(160deg, rgba(255, 252, 247, 0.98), rgba(244, 232, 215, 0.98));
  box-shadow: 0 16rpx 38rpx rgba(37, 28, 12, 0.08);
}

.empty-title {
  display: block;
  color: #1a120d;
  font-size: 34rpx;
  font-weight: 900;
  margin-bottom: 12rpx;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.empty-copy {
  color: #7b6656;
  font-size: 26rpx;
  line-height: 1.7;
}

.fallback-bar {
  padding: 18rpx 24rpx;
  background: rgba(255, 248, 240, 0.92);
  border-top: 1rpx solid rgba(138, 108, 78, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  box-shadow: 0 -8rpx 24rpx rgba(73, 49, 24, 0.04);
}

.fallback-copy {
  flex: 1;
  color: #8d7767;
  font-size: 22rpx;
  line-height: 1.5;
}

.fallback-button {
  min-width: 180rpx;
  height: 68rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #c97832, #915020);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 24rpx rgba(145, 80, 32, 0.18);
}

.fallback-button-text {
  color: #fffaf5;
  font-size: 24rpx;
  font-weight: 700;
}
</style>
