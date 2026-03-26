<template>
  <view class="loading-container">
    <view class="spinner" :style="{ borderTopColor: accentColor }"></view>
    <text class="loading-text">{{ title }}</text>
    <text v-if="description" class="loading-tip">{{ description }}</text>
  </view>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '加载中...',
  },
  description: {
    type: String,
    default: '',
  },
  accentColor: {
    type: String,
    default: '#A78BFA',
  },
})
</script>

<style lang="scss" scoped>
@import '../theme.scss';

.loading-container {
  text-align: center;
}

.spinner {
  width: 120rpx;
  height: 120rpx;
  border: 8rpx solid $border-card;
  border-radius: 50%;
  margin: 0 auto 48rpx;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  display: block;
  font-size: 32rpx;
  color: $text-white;
  margin-bottom: 16rpx;
}

.loading-tip {
  display: block;
  font-size: 26rpx;
  color: $text-muted;
}
</style>
