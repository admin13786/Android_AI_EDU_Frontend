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
    default: '#C97832',
  },
})
</script>

<style lang="scss" scoped>
@import '../theme.scss';

.loading-container {
  text-align: center;
  margin: 0 auto;
  padding: 60rpx 36rpx;
  border-radius: 28rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.72);
  background:
    radial-gradient(circle at top right, rgba(255, 244, 223, 0.82), transparent 36%),
    linear-gradient(160deg, rgba(255, 252, 247, 0.98), rgba(244, 232, 215, 0.98));
  box-shadow: 0 16rpx 38rpx rgba(37, 28, 12, 0.08);
}

.spinner {
  width: 120rpx;
  height: 120rpx;
  border: 8rpx solid rgba(193, 98, 36, 0.12);
  border-radius: 50%;
  margin: 0 auto 40rpx;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  display: block;
  font-size: 34rpx;
  font-weight: 900;
  color: #1a120d;
  margin-bottom: 16rpx;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.loading-tip {
  display: block;
  font-size: 26rpx;
  color: #7b6656;
  line-height: 1.68;
}
</style>
