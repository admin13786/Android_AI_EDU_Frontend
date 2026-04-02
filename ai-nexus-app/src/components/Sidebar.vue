<template>
  <view v-if="rendered" class="sidebar-wrapper">
    <view class="sidebar-mask" :class="{ closing: isClosing }" @click="requestClose"></view>

    <view
      class="sidebar-panel"
      :class="{ closing: isClosing }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
    >
      <view class="sidebar-header" :style="{ paddingTop: `${statusBarHeight + 6}px` }">
        <view class="brand-row">
          <text class="brand-title">灵境</text>
          <text class="brand-close" @click="requestClose">›</text>
        </view>
      </view>

      <scroll-view class="sidebar-scroll" scroll-y show-scrollbar>
        <view class="quick-action" @click="startNewConversation">
          <text class="quick-action-text">开启新对话</text>
        </view>

        <view class="menu-group">
          <view
            v-for="item in menuItems"
            :key="item.id"
            class="menu-item"
            :class="{ active: item.id === activeSection }"
            @click="handleMenuClick(item)"
          >
            <text class="menu-label">{{ item.name }}</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>

        <view class="history-block">
          <view class="history-divider"></view>
          <text class="history-window">30天内</text>

          <template v-if="recentHistory.length">
            <view
              v-for="item in recentHistory"
              :key="item.id"
              class="history-item"
              @click="openHistory(item.id)"
            >
              <text class="history-item-text">{{ item.prompt || '未命名对话' }}</text>
            </view>
          </template>

          <text v-else class="history-empty">没有更多内容啦</text>
        </view>
      </scroll-view>

      <view class="profile-anchor" :style="{ paddingBottom: `${safeAreaInsetsBottom + 16}px` }" @click="goToProfile">
        <view class="profile-avatar">
          <text class="profile-avatar-text">{{ avatarInitial }}</text>
        </view>
        <view class="profile-meta">
          <text class="profile-name">{{ profileName }}</text>
          <text class="profile-subtitle">{{ profileSubtitle }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { getLayoutMetrics } from '@/utils/layout'

const props = defineProps({
  visible: Boolean,
  activeSection: {
    type: String,
    default: 'workshop',
  },
  workshopHistory: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'navigate'])

const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics()
const userStore = useUserStore()

const ANIMATION_MS = 220
const rendered = ref(props.visible)
const isClosing = ref(false)
let closeTimer = null

watch(
  () => props.visible,
  (nextVisible) => {
    if (nextVisible) {
      rendered.value = true
      isClosing.value = false
      if (closeTimer) clearTimeout(closeTimer)
      closeTimer = null
      return
    }

    if (!rendered.value) return

    isClosing.value = true
    if (closeTimer) clearTimeout(closeTimer)
    closeTimer = setTimeout(() => {
      rendered.value = false
      isClosing.value = false
      closeTimer = null
    }, ANIMATION_MS)
  },
  { immediate: true }
)

const menuItems = [
  { id: 'school', name: 'AI学堂', path: '/pages/school/input' },
  { id: 'crawl', name: 'AI观察哨', path: '/pages/crawl/index' },
  { id: 'workshop', name: 'AI工坊', path: '/pages/home/index' },
]

const recentHistory = computed(() => {
  const source = Array.isArray(props.workshopHistory) ? props.workshopHistory : []
  return source.slice(0, 8)
})

const profileName = computed(() => {
  if (!userStore.isAuthenticated) return '个人信息'
  return userStore.userInfo?.nickname || userStore.userInfo?.displayName || userStore.userInfo?.username || '个人信息'
})

const profileSubtitle = computed(() => {
  if (!userStore.isAuthenticated) return '查看资料与设置'
  return userStore.userInfo?.username || '查看资料与设置'
})

const avatarInitial = computed(() => {
  const source = profileName.value || '灵'
  return String(source).trim().slice(0, 1) || '灵'
})

const handleMenuClick = (item) => {
  if (item.id === props.activeSection) {
    emit('close')
    return
  }

  emit('navigate', item.path)
  emit('close')
}

const startNewConversation = () => {
  emit('navigate', '/pages/home/index?reset=1')
  emit('close')
}

const openHistory = (id) => {
  emit('navigate', `/pages/home/index?chatId=${encodeURIComponent(id)}`)
  emit('close')
}

const goToProfile = () => {
  emit('navigate', '/pages/profile/index')
  emit('close')
}

const requestClose = () => {
  if (isClosing.value) return
  isClosing.value = true
  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = setTimeout(() => {
    emit('close')
    closeTimer = null
  }, ANIMATION_MS)
}

let touchStartX = 0
let touchStartY = 0
let touchLastX = 0
let touchLastY = 0
let touchTracking = false

const onTouchStart = (event) => {
  const touch = event?.touches?.[0]
  if (!touch) return
  touchTracking = true
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  touchLastX = touch.clientX
  touchLastY = touch.clientY
}

const onTouchMove = (event) => {
  if (!touchTracking) return
  const touch = event?.touches?.[0]
  if (!touch) return
  touchLastX = touch.clientX
  touchLastY = touch.clientY
}

const onTouchEnd = () => {
  if (!touchTracking) return
  touchTracking = false

  const dx = touchLastX - touchStartX
  const dy = touchLastY - touchStartY

  if (dx < -70 && Math.abs(dx) > Math.abs(dy) * 1.2) {
    requestClose()
  }
}

onUnmounted(() => {
  if (closeTimer) clearTimeout(closeTimer)
})
</script>

<style lang="scss" scoped>
.sidebar-wrapper {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.sidebar-mask {
  position: absolute;
  inset: 0;
  background: rgba(17, 17, 24, 0.72);
  transition: opacity 0.22s ease;
}

.sidebar-mask.closing {
  opacity: 0;
}

.sidebar-panel {
  position: absolute;
  inset: 0 auto 0 0;
  width: 360rpx;
  max-width: 86vw;
  height: 100%;
  background: #0b0b0d;
  display: flex;
  flex-direction: column;
  animation: slide-in 0.22s ease;
  transition: transform 0.22s ease;
  will-change: transform;
  overflow: hidden;
}

.sidebar-panel.closing {
  transform: translateX(-100%);
}

.sidebar-header {
  padding-left: 16rpx;
  padding-right: 16rpx;
}

.brand-row {
  height: 42rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-title {
  color: #f5f5f7;
  font-size: 38rpx;
  font-weight: 700;
}

.brand-close {
  color: #a7a7b3;
  font-size: 30rpx;
  line-height: 1;
}

.sidebar-scroll {
  flex: 1;
  min-height: 0;
  padding: 22rpx 16rpx 20rpx;
  box-sizing: border-box;
}

.sidebar-scroll ::-webkit-scrollbar {
  width: 6rpx;
}

.sidebar-scroll ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.28);
  border-radius: 999rpx;
}

.quick-action {
  width: 100%;
  height: 56rpx;
  border-radius: 20rpx;
  background: #17171c;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-action-text {
  color: #f5f5f7;
  font-size: 26rpx;
  font-weight: 600;
}

.menu-group {
  margin-top: 18rpx;
}

.menu-item {
  min-height: 54rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-item + .menu-item {
  margin-top: 8rpx;
}

.menu-label {
  color: #f5f5f7;
  font-size: 30rpx;
  font-weight: 600;
}

.menu-item.active .menu-label,
.menu-item.active .menu-arrow {
  color: #ffffff;
}

.menu-arrow {
  color: #a7a7b3;
  font-size: 30rpx;
}

.history-block {
  margin-top: 18rpx;
}

.history-divider {
  width: 100%;
  height: 2rpx;
  background: #272730;
}

.history-window {
  display: block;
  margin-top: 18rpx;
  color: #a7a7b3;
  font-size: 22rpx;
  font-weight: 500;
}

.history-item {
  margin-top: 14rpx;
}

.history-item-text {
  color: #f5f5f7;
  font-size: 28rpx;
  line-height: 1.55;
}

.history-empty {
  display: block;
  margin-top: 22rpx;
  color: #a7a7b3;
  font-size: 24rpx;
  text-align: center;
}

.profile-anchor {
  flex-shrink: 0;
  padding-left: 16rpx;
  padding-right: 16rpx;
  padding-top: 16rpx;
  background: #111115;
  border-top: 2rpx solid #272730;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.profile-avatar {
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #6a39ff 0%, #11b7ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar-text {
  color: #f5f5f7;
  font-size: 20rpx;
  font-weight: 700;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.profile-name {
  color: #f5f5f7;
  font-size: 26rpx;
  font-weight: 600;
}

.profile-subtitle {
  color: #8d8d98;
  font-size: 22rpx;
}

@keyframes slide-in {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0);
  }
}
</style>
