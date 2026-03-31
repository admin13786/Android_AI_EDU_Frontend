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
      <scroll-view class="sidebar-inner" scroll-y>
        <view class="quick-action" @click="startNewConversation">
          <text class="quick-action-icon">+</text>
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
            <view class="menu-item-left">
              <text class="menu-icon">{{ item.icon }}</text>
              <text class="menu-label">{{ item.name }}</text>
            </view>
            <text class="menu-arrow">{{ item.id === activeSection ? '•' : '›' }}</text>
          </view>

          <view v-if="showWorkshopHistory" class="history-block">
            <view class="history-divider"></view>

            <view class="history-group">
              <text class="history-title">AI工坊历史对话</text>

              <view
                v-for="item in workshopHistory"
                :key="item.id"
                class="history-item"
                @click="openHistory(item.id)"
              >
                <text class="history-item-text">{{ item.prompt || '未命名对话' }}</text>
              </view>

              <text v-if="!workshopHistory.length" class="history-empty">还没有历史记录</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="profile-anchor" @click="goToProfile">
        <image class="profile-avatar" src="/static/avatar.svg" mode="aspectFill"></image>
        <view class="profile-meta">
          <text class="profile-title">个人中心</text>
          <text class="profile-subtitle">查看资料与设置</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'

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
  { id: 'school', name: 'AI学堂', icon: '学', path: '/pages/school/input' },
  { id: 'crawl', name: 'AI观察哨', icon: '讯', path: '/pages/crawl/index' },
  { id: 'workshop', name: 'AI工坊', icon: '工', path: '/pages/home/index' },
]

const showWorkshopHistory = computed(
  () => props.activeSection === 'workshop' || props.workshopHistory.length > 0
)

const handleMenuClick = (item) => {
  if (item.id === 'workshop' && props.activeSection === 'workshop') {
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
  background: rgba(0, 0, 0, 0.5);
  transition: opacity 0.22s ease;
}

.sidebar-mask.closing {
  opacity: 0;
}

.sidebar-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 402rpx;
  max-width: 82vw;
  height: 100%;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  animation: slide-in 0.22s ease;
  transition: transform 0.22s ease;
  will-change: transform;
  overflow: hidden;
}

.sidebar-panel.closing {
  transform: translateX(-100%);
}

.sidebar-inner {
  flex: 1;
  min-height: 0;
  padding-top: 84rpx;
  padding-bottom: 24rpx;
}

.quick-action {
  margin: 0 24rpx 16rpx;
  height: 84rpx;
  border-radius: 18rpx;
  background: #27272a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.quick-action-icon,
.quick-action-text {
  color: $text-white;
}

.quick-action-icon {
  font-size: 28rpx;
  font-weight: 700;
}

.quick-action-text {
  font-size: 26rpx;
  font-weight: 500;
}

.menu-group {
  padding: 0 24rpx;
}

.menu-item {
  min-height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14rpx 0;
}

.menu-item.active .menu-label,
.menu-item.active .menu-arrow {
  color: #c4b5fd;
}

.menu-item-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.menu-icon {
  width: 30rpx;
  text-align: center;
  color: $text-white;
  font-size: 24rpx;
}

.menu-label {
  color: $text-white;
  font-size: 28rpx;
  font-weight: 500;
}

.menu-arrow {
  color: #a1a1aa;
  font-size: 24rpx;
}

.history-block {
  margin-top: 6rpx;
}

.history-divider {
  height: 2rpx;
  margin: 8rpx 0 14rpx;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.04));
}

.history-group {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.history-title {
  color: $text-white;
  font-size: 24rpx;
  font-weight: 700;
}

.history-item {
  padding: 12rpx 0;
}

.history-item-text {
  color: $text-white;
  font-size: 24rpx;
  line-height: 1.5;
}

.history-empty {
  color: #71717a;
  font-size: 22rpx;
  text-align: center;
  margin-top: 8rpx;
}

.profile-anchor {
  flex-shrink: 0;
  padding: 18rpx 20rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  border-top: 2rpx solid rgba(255, 255, 255, 0.08);
  background: #0a0a0a;
}

.profile-avatar {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.profile-title {
  color: $text-white;
  font-size: 26rpx;
  font-weight: 600;
}

.profile-subtitle {
  color: #71717a;
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
