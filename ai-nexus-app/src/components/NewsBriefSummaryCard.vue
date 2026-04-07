<template>
  <view class="summary-card" :class="[`tone-${toneIndex}`]" @click="$emit('open-brief')">
    <view class="summary-topline">
      <text class="summary-index">{{ formatIndex(cardNumber) }}</text>
      <text class="summary-tag">{{ item.source || 'AI 热讯' }}</text>
    </view>

    <view class="summary-copy">
      <text class="summary-headline">{{ item.headline }}</text>
      <text v-if="item.warning" class="summary-warning">{{ item.warning }}</text>
    </view>

    <view class="summary-footer">
      <view class="brief-pill" @click.stop="$emit('open-brief')">
        <text class="brief-pill-text">AI简报</text>
      </view>

      <view v-if="item.articleUrl" class="origin-link" @click.stop="$emit('open-link')">
        <text class="origin-link-text">原文</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const formatIndex = (value) => String(value || 1).padStart(2, '0')

defineProps({
  item: {
    type: Object,
    required: true,
  },
  cardNumber: {
    type: Number,
    default: 1,
  },
  toneIndex: {
    type: Number,
    default: 1,
  },
})

defineEmits(['open-brief', 'open-link'])
</script>

<style lang="scss" scoped>
.summary-card {
  position: relative;
  overflow: hidden;
  border-radius: 34rpx;
  padding: 28rpx 24rpx 24rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.74);
  background:
    radial-gradient(circle at top right, rgba(255, 244, 224, 0.86), transparent 36%),
    linear-gradient(160deg, rgba(255, 253, 249, 0.98), rgba(244, 233, 217, 0.98));
  box-shadow: 0 16rpx 38rpx rgba(62, 35, 8, 0.08);
}

.summary-card::after {
  content: '';
  position: absolute;
  right: -48rpx;
  top: -52rpx;
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: rgba(255, 247, 233, 0.46);
}

.summary-card.tone-1 {
  background:
    radial-gradient(circle at top right, rgba(255, 244, 224, 0.86), transparent 36%),
    linear-gradient(160deg, rgba(255, 253, 249, 0.98), rgba(244, 233, 217, 0.98));
}

.summary-card.tone-2 {
  background:
    radial-gradient(circle at top right, rgba(255, 244, 224, 0.86), transparent 36%),
    linear-gradient(160deg, rgba(255, 253, 249, 0.98), rgba(244, 233, 217, 0.98));
}

.summary-card.tone-3 {
  background:
    radial-gradient(circle at top right, rgba(255, 244, 224, 0.86), transparent 36%),
    linear-gradient(160deg, rgba(255, 253, 249, 0.98), rgba(244, 233, 217, 0.98));
}

.summary-topline {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
}

.summary-index {
  color: #18120c;
  font-size: 42rpx;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 1rpx;
  font-family: 'Avenir Next', 'Helvetica Neue', sans-serif;
}

.summary-tag {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(110, 77, 47, 0.08);
  color: #6a472c;
  font-size: 18rpx;
  font-weight: 700;
  letter-spacing: 1.8rpx;
  text-transform: uppercase;
  font-family: 'SFMono-Regular', 'JetBrains Mono', 'Consolas', monospace;
}

.summary-copy {
  position: relative;
  z-index: 1;
  margin-top: 22rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.summary-headline {
  color: #131313;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 1.4;
  letter-spacing: 0.6rpx;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.summary-warning {
  color: rgba(82, 62, 41, 0.72);
  font-size: 22rpx;
  line-height: 1.7;
  font-weight: 700;
  font-family: 'Avenir Next', 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.summary-footer {
  position: relative;
  z-index: 1;
  margin-top: 26rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.brief-pill,
.origin-link {
  min-height: 52rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.brief-pill {
  background: #17110c;
  box-shadow: 0 8rpx 20rpx rgba(23, 17, 12, 0.16);
}

.brief-pill-text {
  color: #fff5e9;
  font-size: 18rpx;
  font-weight: 800;
  letter-spacing: 1rpx;
}

.origin-link {
  background: rgba(255, 255, 255, 0.78);
  border: 2rpx solid rgba(72, 47, 23, 0.06);
}

.origin-link-text {
  color: #6d4a2f;
  font-size: 18rpx;
  font-weight: 800;
}
</style>
