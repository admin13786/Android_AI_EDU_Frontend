<template>
  <view class="school-web-page">
    <web-view v-if="openmaicUrl" :src="openmaicUrl"></web-view>

    <view v-else class="empty-state">
      <text class="empty-title">AI学堂暂时不可用</text>
      <text class="empty-copy">当前没有可用的 OpenMAIC 地址，请先检查服务器和前端访问地址配置。</text>
      <view class="empty-button" @click="goBack">
        <text class="empty-button-text">返回 AI工坊</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onBackPress, onLoad } from '@dcloudio/uni-app'
import { safeNavigateBack } from '@/utils/navigation'
import { getBaseUrl } from '@/services/request'

const openmaicUrl = ref('')
const DEFAULT_OPENMAIC_URL = 'http://121.89.87.255:10200'

const resolveOpenmaicUrl = () => {
  try {
    const apiBaseUrl = getBaseUrl()
    const url = new URL(apiBaseUrl)
    url.port = '10200'
    url.pathname = '/'
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/$/, '')
  } catch (error) {
    return DEFAULT_OPENMAIC_URL
  }
}

const goBack = () => {
  safeNavigateBack('/pages/home/index')
}

onLoad(() => {
  openmaicUrl.value = resolveOpenmaicUrl()
})

onBackPress(() => {
  goBack()
  return true
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';

.school-web-page {
  min-height: 100vh;
  background: #ffffff;
}

.empty-state {
  min-height: 100vh;
  padding: 80rpx 48rpx;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
}

.empty-title {
  color: $text-white;
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 16rpx;
}

.empty-copy {
  color: $text-muted;
  font-size: 26rpx;
  line-height: 1.7;
}

.empty-button {
  margin-top: 32rpx;
  width: 220rpx;
  height: 72rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-button-text {
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
}
</style>
