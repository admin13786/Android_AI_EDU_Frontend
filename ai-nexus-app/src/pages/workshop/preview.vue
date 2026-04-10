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
import { normalizeWorkshopPreviewUrl } from '@/services/api'

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
    url = normalizeWorkshopPreviewUrl(decodeURIComponent(query.url || ''))
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
    radial-gradient(circle at top right, rgba(255, 229, 192, 0.32), transparent 34%),
    linear-gradient(180deg, $paper-bg 0%, $paper-bg-soft 52%, $paper-bg-deep 100%);
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
  color: $ink-strong;
}

.page-header {
  height: 72rpx;
  background: rgba(255, 249, 241, 0.92);
  border-bottom: 2rpx solid rgba(107, 62, 31, 0.08);
  box-shadow: 0 16rpx 34rpx rgba(62, 35, 8, 0.08);
  backdrop-filter: blur(12rpx);
}

.header-title {
  font-size: 32rpx;
  font-weight: 900;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.header-action {
  width: 74rpx;
  height: 52rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.78);
  border: 2rpx solid rgba(107, 62, 31, 0.1);
  text-align: center;
  font-size: 30rpx;
  line-height: 52rpx;
  box-shadow: $shadow-soft;
}

.webview-wrap {
  flex: 1;
}

.empty-state {
  flex: 1;
  margin: 28rpx 22rpx 0;
  padding: 48rpx 34rpx;
  border-radius: 32rpx;
  background:
    radial-gradient(circle at top right, rgba(255, 235, 203, 0.76), transparent 36%),
    linear-gradient(160deg, rgba(255, 252, 247, 0.96), rgba(243, 234, 221, 0.96));
  border: 2rpx dashed rgba(107, 62, 31, 0.16);
  box-shadow: $shadow-card;
}

.empty-title {
  display: block;
  color: $ink-strong;
  font-size: 34rpx;
  font-weight: 900;
  margin-bottom: 12rpx;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.empty-copy {
  color: $ink-body;
  font-size: 26rpx;
  line-height: 1.7;
}

.fallback-bar {
  padding: 18rpx 24rpx;
  background: rgba(255, 249, 241, 0.94);
  border-top: 2rpx solid rgba(107, 62, 31, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  box-shadow: 0 -12rpx 28rpx rgba(62, 35, 8, 0.06);
}

.fallback-copy {
  flex: 1;
  color: $ink-soft;
  font-size: 22rpx;
  line-height: 1.5;
}

.fallback-button {
  min-width: 180rpx;
  height: 68rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: linear-gradient(145deg, #c26229, #8e4b22);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14rpx 28rpx rgba(117, 63, 29, 0.16);
}

.fallback-button-text {
  color: #fff8ef;
  font-size: 24rpx;
  font-weight: 700;
}
</style>
