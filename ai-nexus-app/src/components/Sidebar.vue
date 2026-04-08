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
      <view class="sidebar-header" :style="{ paddingTop: `${statusBarHeight + 10}px` }">
        <view class="brand-badge">
          <text class="brand-badge-text">LJ</text>
        </view>
        <view class="brand-copy">
          <text class="brand-title">灵境</text>
          <text class="brand-subtitle">AI 教育工作台</text>
        </view>
      </view>

      <scroll-view class="sidebar-scroll" scroll-y show-scrollbar>
        <view class="quick-action" @click="startNewConversation">
          <text class="quick-action-kicker">START FRESH</text>
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
            <view class="menu-copy">
              <text class="menu-label">{{ item.name }}</text>
              <text class="menu-meta">{{ item.meta }}</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>
        </view>

        <view class="history-block">
          <view class="history-heading">
            <text class="history-title">工坊记录</text>
            <text class="history-window">30 天内</text>
          </view>

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

          <text v-else class="history-empty">还没有更多对话记录</text>
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
import { getLatestNewsBriefIssue } from '@/data/news-brief'
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

const getLatestNewsBriefPath = () =>
  `/pages/news-brief/issue?id=${encodeURIComponent(getLatestNewsBriefIssue().id)}`

const menuItems = [
  { id: 'school', name: 'AI学堂', meta: '外部课堂 WebView', path: '/pages/school/input' },
  { id: 'crawl', name: 'AI观察哨', meta: '实时新闻榜单', path: '/pages/crawl/index' },
  { id: 'workshop', name: 'AI工坊', meta: '新建创作任务', path: '/pages/home/index' },
  { id: 'newsBrief', name: 'AI趣闻萃取', meta: '每日三条速览', path: getLatestNewsBriefPath() },
]

menuItems[0].meta = '\u5916\u90e8\u8bfe\u5802'

const recentHistory = computed(() => {
  const source = Array.isArray(props.workshopHistory) ? props.workshopHistory : []
  return source.slice(0, 8)
})

const profileName = computed(() => {
  if (!userStore.isAuthenticated) return '个人信息'
  return (
    userStore.userInfo?.nickname ||
    userStore.userInfo?.displayName ||
    userStore.userInfo?.username ||
    '个人信息'
  )
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
@import '../theme.scss';

.sidebar-wrapper {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.sidebar-mask {
  position: absolute;
  inset: 0;
  background: rgba(42, 27, 13, 0.34);
  transition: opacity 0.22s ease;
}

.sidebar-mask.closing {
  opacity: 0;
}

.sidebar-panel {
  position: absolute;
  inset: 0 auto 0 0;
  width: 496rpx;
  max-width: 92vw;
  height: 100%;
  background:
    radial-gradient(circle at top right, rgba(255, 229, 192, 0.5), transparent 34%),
    linear-gradient(180deg, #fff8ef 0%, #f4ece0 50%, #ede2d4 100%);
  display: flex;
  flex-direction: column;
  animation: slide-in 0.22s ease;
  transition: transform 0.22s ease;
  will-change: transform;
  overflow: hidden;
  box-shadow: 18rpx 0 48rpx rgba(62, 35, 8, 0.12);
}

.sidebar-panel.closing {
  transform: translateX(-100%);
}

.sidebar-header {
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-bottom: 16rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.brand-badge {
  width: 62rpx;
  height: 62rpx;
  border-radius: 22rpx;
  background: #17110c;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 28rpx rgba(23, 17, 12, 0.14);
}

.brand-badge-text {
  color: $ink-inverse;
  font-size: 22rpx;
  font-weight: 800;
  letter-spacing: 1rpx;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.brand-title {
  color: $ink-strong;
  font-size: 40rpx;
  font-weight: 900;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.brand-subtitle {
  color: $ink-soft;
  font-size: 20rpx;
  letter-spacing: 2rpx;
}

.sidebar-scroll {
  flex: 1;
  min-height: 0;
  padding: 8rpx 22rpx 20rpx;
  box-sizing: border-box;
}

.quick-action {
  border-radius: 28rpx;
  padding: 20rpx 22rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 2rpx solid rgba(107, 62, 31, 0.08);
  box-shadow: $shadow-card;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.quick-action-kicker {
  color: $accent-brand;
  font-size: 18rpx;
  font-weight: 800;
  letter-spacing: 3rpx;
  font-family: 'SFMono-Regular', 'JetBrains Mono', monospace;
}

.quick-action-text {
  color: $ink-strong;
  font-size: 30rpx;
  font-weight: 800;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.menu-group {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.menu-item {
  min-height: 104rpx;
  padding: 18rpx 20rpx;
  border-radius: 26rpx;
  border: 2rpx solid rgba(107, 62, 31, 0.08);
  background: rgba(255, 255, 255, 0.68);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.menu-item.active {
  background:
    radial-gradient(circle at top right, rgba(255, 237, 209, 0.92), transparent 36%),
    linear-gradient(160deg, rgba(255, 252, 247, 0.98), rgba(244, 233, 217, 0.98));
  box-shadow: $shadow-card;
}

.menu-copy {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.menu-label {
  color: $ink-strong;
  font-size: 30rpx;
  font-weight: 800;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.menu-meta {
  color: $ink-soft;
  font-size: 20rpx;
}

.menu-arrow {
  color: $accent-brand-deep;
  font-size: 34rpx;
  font-weight: 700;
}

.history-block {
  margin-top: 20rpx;
  padding-top: 18rpx;
  border-top: 2rpx solid rgba(121, 104, 88, 0.12);
}

.history-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12rpx;
}

.history-title {
  color: $ink-strong;
  font-size: 24rpx;
  font-weight: 800;
}

.history-window {
  color: $ink-faint;
  font-size: 18rpx;
  letter-spacing: 2rpx;
  font-family: 'SFMono-Regular', 'JetBrains Mono', monospace;
}

.history-item {
  margin-top: 12rpx;
  padding: 16rpx 18rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.52);
}

.history-item-text {
  color: $ink-body;
  font-size: 24rpx;
  line-height: 1.6;
}

.history-empty {
  display: block;
  margin-top: 20rpx;
  color: $ink-faint;
  font-size: 22rpx;
  text-align: center;
}

.profile-anchor {
  flex-shrink: 0;
  padding-left: 22rpx;
  padding-right: 22rpx;
  padding-top: 16rpx;
  background: rgba(255, 255, 255, 0.55);
  border-top: 2rpx solid rgba(121, 104, 88, 0.12);
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.profile-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: linear-gradient(160deg, #23160d, #6b3e1f);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar-text {
  color: $ink-inverse;
  font-size: 22rpx;
  font-weight: 800;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.profile-name {
  color: $ink-strong;
  font-size: 26rpx;
  font-weight: 700;
}

.profile-subtitle {
  color: $ink-soft;
  font-size: 20rpx;
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
