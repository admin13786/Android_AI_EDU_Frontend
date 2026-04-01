<template>
  <view class="edit-page">
    <view class="top-safe" :style="{ paddingTop: `${statusBarHeight}px` }"></view>

    <view class="page-header">
      <text class="header-action" @click="goBack">←</text>
      <text class="header-title">设置昵称</text>
      <text class="header-action done" @click="handleSave">完成</text>
    </view>

    <view class="form-area">
      <input
        class="text-input"
        v-model="nickname"
        maxlength="20"
        placeholder="请输入昵称"
        placeholder-class="text-placeholder"
      />
    </view>
  </view>
</template>

<script setup>
import { onBackPress, onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { updateUserInfo } from '@/services/api'
import { useUserStore } from '@/stores/user'
import { getLayoutMetrics } from '@/utils/layout'
import { getLocalProfile, saveLocalProfile, setProfilePendingToast } from '@/utils/profile'
import { safeNavigateBack } from '@/utils/navigation'

const { statusBarHeight } = getLayoutMetrics()
const userStore = useUserStore()
const nickname = ref('')

const goBack = () => {
  safeNavigateBack('/pages/profile/index')
}

const handleSave = async () => {
  const value = nickname.value.trim()
  if (!value) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  try {
    await updateUserInfo({ nickname: value })
    userStore.setUserInfo({
      ...(userStore.userInfo || {}),
      nickname: value,
    })
    saveLocalProfile({ nickname: value })
    setProfilePendingToast('昵称修改成功')
    safeNavigateBack('/pages/profile/index')
  } catch (error) {
    uni.showToast({ title: error.message, icon: 'none' })
  }
}

onLoad(() => {
  nickname.value = userStore.userInfo?.nickname || getLocalProfile().nickname
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

.edit-page { min-height: 100vh; background: #0f0f0f; }
.top-safe { padding-left: 16rpx; padding-right: 16rpx; }
.page-header { padding: 0 16rpx; display: flex; align-items: center; justify-content: space-between; }
.header-title, .header-action { color: $text-white; }
.page-header { height: 56rpx; }
.header-title { font-size: 30rpx; font-weight: 700; }
.header-action { min-width: 40rpx; text-align: center; font-size: 24rpx; }
.header-action.done { color: #22d3ee; }
.form-area { padding: 24rpx 16rpx; }
.text-input { min-height: 92rpx; border-radius: 24rpx; background: #1a1a1a; color: $text-white; font-size: 28rpx; padding: 0 24rpx; }
.text-placeholder { color: #6b7280; }
</style>
