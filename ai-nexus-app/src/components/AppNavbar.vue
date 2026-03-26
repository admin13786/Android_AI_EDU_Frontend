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
  background: $bg-card;
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

.title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: 700;
  color: $text-white;
}

.icon {
  font-size: 44rpx;
  color: $text-white;
}
</style>
