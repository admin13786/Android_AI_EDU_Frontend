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
.school-page {
  min-height: 100vh;
  background: #ffffff;
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
  background: #ffffff;
}

.empty-title {
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 14rpx;
}

.empty-copy {
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.7;
}
</style>
