<template>
  <view
    class="navbar"
    :style="{
      paddingTop: `${statusBarHeight}px`,
      height: `${statusBarHeight + 44}px`,
    }"
  >
    <view class="nav-side">
      <view v-if="leftIcon" class="icon-btn" @click="$emit('left-click')">
        <text class="icon">{{ leftIcon }}</text>
      </view>
      <view v-else class="icon-placeholder"></view>
    </view>

    <text class="title">{{ title }}</text>

    <view class="nav-side nav-side-right">
      <view v-if="rightIcon" class="icon-btn" @click="$emit('right-click')">
        <text class="icon">{{ rightIcon }}</text>
      </view>
      <view v-else class="icon-placeholder"></view>
    </view>
  </view>
</template>

<script setup>
import { getLayoutMetrics } from '@/utils/layout'

defineProps({
  title: {
    type: String,
    required: true,
  },
  leftIcon: {
    type: String,
    default: '',
  },
  rightIcon: {
    type: String,
    default: '',
  },
})

defineEmits(['left-click', 'right-click'])

const { statusBarHeight } = getLayoutMetrics()
</script>

<style lang="scss" scoped>
@import '../theme.scss';

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding-left: 20rpx;
  padding-right: 20rpx;
  background: rgba(255, 248, 240, 0.84);
  backdrop-filter: blur(18rpx);
  box-shadow: 0 12rpx 28rpx rgba(73, 49, 24, 0.06);
}

.nav-side {
  width: 96rpx;
  display: flex;
  align-items: center;
}

.nav-side-right {
  justify-content: flex-end;
}

.icon-btn,
.icon-placeholder {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn {
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.74);
  border: 2rpx solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 10rpx 22rpx rgba(37, 28, 12, 0.08);
}

.title {
  flex: 1;
  text-align: center;
  font-size: 38rpx;
  font-weight: 900;
  color: #18110d;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.icon {
  font-size: 40rpx;
  color: #5a3f2d;
  font-weight: 800;
}
</style>
