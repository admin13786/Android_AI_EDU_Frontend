<template>
  <view class="empty-state">
    <text class="empty-icon">{{ icon }}</text>
    <text class="empty-title">{{ title }}</text>
    <text v-if="description" class="empty-desc">{{ description }}</text>
  </view>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: '📭',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped>
@import '../theme.scss';

.empty-state {
  margin: 0 auto;
  padding: 72rpx 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-radius: 28rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.72);
  background:
    radial-gradient(circle at top right, rgba(255, 244, 223, 0.82), transparent 36%),
    linear-gradient(160deg, rgba(255, 252, 247, 0.98), rgba(244, 232, 215, 0.98));
  box-shadow: 0 16rpx 38rpx rgba(37, 28, 12, 0.08);
}

.empty-icon {
  font-size: 72rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 34rpx;
  font-weight: 900;
  color: #1a120d;
  margin-bottom: 12rpx;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.empty-desc {
  font-size: 24rpx;
  color: #7b6656;
  line-height: 1.72;
}
</style>
