<template>
  <view class="school-page">
    <web-view v-if="openmaicUrl" class="school-webview" :src="openmaicUrl"></web-view>

    <view v-else class="empty-state">
      <text class="empty-title">AI 学堂暂时不可用</text>
      <text class="empty-copy">
        当前没有可用的 OpenMAIC 地址，请先检查服务器和前端访问地址配置。
      </text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onBackPress, onLoad, onNavigationBarButtonTap } from '@dcloudio/uni-app'
import { getOpenmaicBaseUrl } from '@/services/request'

const openmaicUrl = ref('')

const resolveOpenmaicUrl = () => {
  try {
    const url = new URL(getOpenmaicBaseUrl())
    url.pathname = '/'
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/$/, '')
  } catch (error) {
    return 'http://8.135.4.46:3000'
  }
}

const goBack = () => {
  uni.reLaunch({ url: '/pages/home/index?openSidebar=1' })
}

onLoad(() => {
  openmaicUrl.value = resolveOpenmaicUrl()
})

onNavigationBarButtonTap(() => {
  goBack()
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

.school-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(255, 229, 192, 0.3), transparent 34%),
    linear-gradient(180deg, $paper-bg 0%, $paper-bg-soft 52%, $paper-bg-deep 100%);
}

.school-webview {
  min-height: 100vh;
}

.empty-state {
  min-height: 100vh;
  padding: 48rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background:
    radial-gradient(circle at top right, rgba(255, 235, 203, 0.72), transparent 36%),
    linear-gradient(160deg, rgba(255, 252, 247, 0.96), rgba(243, 234, 221, 0.96));
}

.empty-title {
  color: $ink-strong;
  font-size: 36rpx;
  font-weight: 900;
  margin-bottom: 14rpx;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.empty-copy {
  color: $ink-body;
  font-size: 24rpx;
  line-height: 1.7;
}
</style>
