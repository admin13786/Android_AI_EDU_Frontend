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
import { onLoad } from '@dcloudio/uni-app'
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
</script>

<style lang="scss" scoped>
@import '../../theme.scss';

.preview-page {
  min-height: 100vh;
  background: #0a0a0a;
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
  color: $text-white;
}

.page-header {
  height: 72rpx;
}

.header-title {
  font-size: 30rpx;
  font-weight: 700;
}

.header-action {
  width: 44rpx;
  text-align: center;
  font-size: 30rpx;
}

.webview-wrap {
  flex: 1;
}

.empty-state {
  flex: 1;
  padding: 48rpx;
}

.empty-title {
  display: block;
  color: $text-white;
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.empty-copy {
  color: $text-muted;
  font-size: 26rpx;
  line-height: 1.7;
}

.fallback-bar {
  padding: 18rpx 24rpx;
  background: rgba(10, 10, 10, 0.92);
  border-top: 1rpx solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.fallback-copy {
  flex: 1;
  color: $text-muted;
  font-size: 22rpx;
  line-height: 1.5;
}

.fallback-button {
  min-width: 180rpx;
  height: 68rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fallback-button-text {
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
}
</style>
