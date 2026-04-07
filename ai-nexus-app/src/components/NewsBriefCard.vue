<template>
  <view class="brief-card">
    <view class="card-head-row">
      <text class="card-index">{{ formatIndex(cardNumber) }}</text>
      <text class="card-headline">{{ item.headline }}</text>
    </view>

    <text class="card-warning">{{ item.warning }}</text>

    <view class="card-content">
      <view class="content-divider"></view>

      <text
        v-for="(paragraph, index) in item.expandedBody"
        :key="`${item.id}-${index}`"
        class="content-paragraph"
      >
        {{ paragraph }}
      </text>
    </view>

    <view class="card-footer">
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
})

defineEmits(['open-link'])
</script>

<style lang="scss" scoped>
@import '../theme.scss';

.brief-card {
  border-radius: 30rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.72);
  background:
    radial-gradient(circle at top right, rgba(255, 244, 223, 0.78), transparent 34%),
    linear-gradient(160deg, #fffdf8 0%, #f7ecdd 100%);
  box-shadow: 0 16rpx 42rpx rgba(55, 31, 8, 0.1);
  padding: 28rpx 24rpx 24rpx;
  color: #171717;
}

.card-head-row {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
}

.card-index {
  min-width: 54rpx;
  color: #c16224;
  font-size: 42rpx;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 1rpx;
  font-family: 'Avenir Next', 'Helvetica Neue', sans-serif;
}

.card-headline {
  flex: 1;
  color: #17110c;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 1.42;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.card-warning {
  display: block;
  margin-top: 14rpx;
  color: #6b5745;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1.72;
  font-family: 'Avenir Next', 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.card-content {
  margin-top: 20rpx;
}

.content-divider {
  width: 100%;
  height: 2rpx;
  background: linear-gradient(90deg, rgba(193, 98, 36, 0.4), rgba(120, 114, 104, 0.08));
  margin-bottom: 20rpx;
}

.content-paragraph {
  display: block;
  color: #2a221c;
  font-size: 22rpx;
  line-height: 1.88;
  margin-top: 16rpx;
  font-family: 'Avenir Next', 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.content-paragraph:first-child {
  margin-top: 0;
}

.card-footer {
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
}

.origin-link {
  min-width: 92rpx;
  height: 48rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 2rpx solid rgba(17, 17, 17, 0.06);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.origin-link-text {
  color: #6b4d34;
  font-size: 18rpx;
  font-weight: 800;
}
</style>
