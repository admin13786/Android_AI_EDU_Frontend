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
  { id: 'newsBrief', name: 'AI趣闻萃取', path: '/pages/news-brief/index' },
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
  if (item.id === 'workshop') {
    startNewConversation()
    return
  }

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
  background: rgba(96, 68, 44, 0.18);
  transition: opacity 0.22s ease;
}

.sidebar-mask.closing {
  opacity: 0;
}

.sidebar-panel {
  position: absolute;
  inset: 0 auto 0 0;
  width: 440rpx;
  max-width: 90vw;
  height: 100%;
  background:
    radial-gradient(circle at top right, rgba(255, 232, 195, 0.38), transparent 36%),
    linear-gradient(180deg, #fff9f1 0%, #f6eee2 46%, #efe6da 100%);
  display: flex;
  flex-direction: column;
  animation: slide-in 0.22s ease;
  transition: transform 0.22s ease;
  will-change: transform;
  overflow: hidden;
  box-shadow: 20rpx 0 40rpx rgba(73, 49, 24, 0.12);
}

.sidebar-panel.closing {
  transform: translateX(-100%);
}

.sidebar-header {
  padding-left: 18rpx;
  padding-right: 18rpx;
}

.brand-row {
  height: 56rpx;
  display: flex;
  align-items: center;
}

.brand-title {
  color: #1a120d;
  font-size: 42rpx;
  font-weight: 900;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.sidebar-scroll {
  flex: 1;
  min-height: 0;
  padding: 22rpx 18rpx 20rpx;
  box-sizing: border-box;
}

.sidebar-scroll ::-webkit-scrollbar {
  width: 6rpx;
}

.sidebar-scroll ::-webkit-scrollbar-thumb {
  background: rgba(138, 108, 78, 0.28);
  border-radius: 999rpx;
}

.quick-action {
  width: 100%;
  min-height: 72rpx;
  border-radius: 22rpx;
  background: linear-gradient(135deg, #c97832, #915020);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 28rpx rgba(145, 80, 32, 0.16);
}

.quick-action-text {
  color: #fffaf5;
  font-size: 26rpx;
  font-weight: 700;
}

.menu-group {
  margin-top: 20rpx;
  padding: 10rpx 0;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.38);
  border: 2rpx solid rgba(255, 255, 255, 0.54);
}

.menu-item {
  min-height: 60rpx;
  padding: 0 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 18rpx;
}

.menu-item + .menu-item {
  margin-top: 6rpx;
}

.menu-label {
  color: #4f392b;
  font-size: 30rpx;
  font-weight: 700;
}

.menu-item.active {
  background: rgba(193, 98, 36, 0.12);
}

.menu-item.active .menu-label,
.menu-item.active .menu-arrow {
  color: #9b5726;
}

.menu-arrow {
  color: #9d8a79;
  font-size: 30rpx;
}

.history-block {
  margin-top: 22rpx;
}

.history-divider {
  width: 100%;
  height: 2rpx;
  background: rgba(120, 114, 104, 0.12);
}

.history-window {
  display: block;
  margin-top: 18rpx;
  color: #9a7e66;
  font-size: 22rpx;
  font-weight: 700;
}

.history-item {
  margin-top: 14rpx;
  padding: 14rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.42);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
}

.history-item-text {
  color: #5b4637;
  font-size: 28rpx;
  line-height: 1.55;
}

.history-empty {
  display: block;
  margin-top: 22rpx;
  color: #9d8a79;
  font-size: 24rpx;
  text-align: center;
}

.profile-anchor {
  flex-shrink: 0;
  padding-left: 18rpx;
  padding-right: 18rpx;
  padding-top: 16rpx;
  background: rgba(255, 250, 244, 0.88);
  border-top: 2rpx solid rgba(120, 114, 104, 0.12);
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.profile-avatar {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, #fff3da 0%, #d89553 36%, #9a5a29 72%, #6b391a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 24rpx rgba(104, 59, 25, 0.16);
}

.profile-avatar-text {
  color: #fffaf5;
  font-size: 20rpx;
  font-weight: 800;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.profile-name {
  color: #2b1d14;
  font-size: 26rpx;
  font-weight: 700;
}

.profile-subtitle {
  color: #8f7661;
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
