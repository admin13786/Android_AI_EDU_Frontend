<template>
  <view class="edit-page">
    <view class="top-bar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="page-header">
        <view class="header-side header-back" @click="goBack">
          <text class="header-back-icon">←</text>
        </view>
        <text class="header-title">自我介绍</text>
        <view class="header-side header-action-done" @click="handleSave">
          <text class="header-action-text">保存</text>
        </view>
      </view>
    </view>

    <view class="form-area" :style="formAreaStyle">
      <textarea
        class="text-area"
        v-model="bio"
        maxlength="50"
        placeholder="请输入不多于 50 字的自我介绍"
        placeholder-class="text-placeholder"
      />
      <text class="count-text">{{ bio.length }}/50</text>
    </view>
  </view>
</template>

<script setup>
import { onBackPress, onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getLayoutMetrics } from '@/utils/layout'
import { getLocalProfile, saveLocalProfile, setProfilePendingToast } from '@/utils/profile'
import { safeNavigateBack } from '@/utils/navigation'

const { statusBarHeight } = getLayoutMetrics()
const topBarOffset = `${statusBarHeight + uni.upx2px(124)}px`
const formAreaStyle = {
  paddingTop: `calc(${topBarOffset} + 24rpx)`,
}

const bio = ref('')

const goBack = () => {
  safeNavigateBack('/pages/profile/index')
}

const handleSave = () => {
  saveLocalProfile({ bio: bio.value.trim() })
  setProfilePendingToast('自我介绍修改成功')
  safeNavigateBack('/pages/profile/index')
}

onLoad(() => {
  bio.value = getLocalProfile().bio
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

.edit-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(255, 226, 178, 0.42), transparent 34%),
    linear-gradient(180deg, #fff9f1 0%, #f6eee2 46%, #efe6da 100%);
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-bottom: 18rpx;
  background: rgba(255, 249, 241, 0.82);
  border-bottom: 1rpx solid rgba(194, 161, 124, 0.18);
  box-shadow: 0 16rpx 32rpx rgba(67, 43, 16, 0.08);
  backdrop-filter: blur(14rpx);
  z-index: 30;
}

.page-header {
  min-height: 96rpx;
  padding-top: 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.header-side {
  width: 84rpx;
  min-width: 84rpx;
  height: 72rpx;
}

.header-back,
.header-action-done {
  padding: 0;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.header-back {
  background: rgba(255, 255, 255, 0.76);
  border: 2rpx solid rgba(255, 255, 255, 0.68);
  box-shadow: 0 10rpx 24rpx rgba(67, 43, 16, 0.08);
}

.header-action-done {
  background: linear-gradient(135deg, #d88a3d 0%, #b8672d 100%);
  box-shadow: 0 16rpx 30rpx rgba(190, 114, 42, 0.18);
}

.header-back-icon {
  color: #5a3f2d;
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1;
}

.header-action-text {
  color: #fffaf4;
  font-size: 26rpx;
  font-weight: 800;
}

.header-title {
  flex: 1;
  text-align: center;
  color: #18110d;
  font-size: 42rpx;
  font-weight: 900;
  letter-spacing: 1rpx;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.form-area {
  padding-left: 20rpx;
  padding-right: 20rpx;
}

.text-area {
  width: 100%;
  min-height: 300rpx;
  border-radius: 28rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.7);
  background:
    radial-gradient(circle at top right, rgba(255, 244, 223, 0.82), transparent 36%),
    linear-gradient(160deg, rgba(255, 252, 247, 0.98), rgba(244, 232, 215, 0.98));
  box-shadow: 0 18rpx 42rpx rgba(37, 28, 12, 0.08);
  color: #2b2118;
  font-size: 30rpx;
  line-height: 1.6;
  padding: 28rpx;
  box-sizing: border-box;
}

.text-placeholder {
  color: #b19782;
  font-size: 26rpx;
}

.count-text {
  display: block;
  color: #9b816d;
  font-size: 24rpx;
  text-align: right;
  margin-top: 14rpx;
}
</style>
