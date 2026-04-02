<template>
  <view class="workshop-page">
    <view class="header-shell" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="page-header">
        <text class="header-action" @click="toggleSidebar">≡</text>
        <text class="header-title">AI工坊</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <scroll-view
      class="chat-scroll"
      scroll-y
      :show-scrollbar="false"
      :style="{
        top: `${headerShellHeight}px`,
        bottom: `${chatBottomOffset}px`,
      }"
    >
      <view class="chat-content">
        <view v-if="lastPrompt" class="user-row">
          <view class="user-bubble">
            <text class="user-text">{{ lastPrompt }}</text>
          </view>
          <text class="message-time">刚刚</text>
        </view>

        <view v-if="generatedResult || loading" class="ai-row">
          <view class="ai-avatar">
            <text class="ai-avatar-text">AI</text>
          </view>

          <view class="ai-column">
            <view class="ai-bubble">
              <text class="ai-title">{{ aiTitle }}</text>
              <text class="ai-text">{{ aiBodyText }}</text>

              <view v-if="loading" class="loading-panel">
                <view class="loading-orbit">
                  <view class="orbit-ring ring-one"></view>
                  <view class="orbit-ring ring-two"></view>
                  <view class="orbit-core">
                    <text class="orbit-core-text">AI</text>
                  </view>
                  <view class="orbit-dot dot-one"></view>
                  <view class="orbit-dot dot-two"></view>
                  <view class="orbit-dot dot-three"></view>
                </view>

                <view class="loading-meta">
                  <text class="loading-phase">{{ activeLoadingPhase }}</text>
                  <text class="loading-subtitle">正在调用模型并整理可预览的移动端结果</text>

                  <view class="loading-steps">
                    <view
                      v-for="(step, index) in loadingPhases"
                      :key="step"
                      class="loading-step"
                      :class="{ active: index === loadingPhase }"
                    >
                      <view class="loading-step-dot"></view>
                      <text class="loading-step-text">{{ step }}</text>
                    </view>
                  </view>
                </view>

                <view class="loading-progress-track">
                  <view class="loading-progress-bar"></view>
                </view>
              </view>

              <view v-if="showHighlights" class="idea-card">
                <text class="idea-title">这次生成重点</text>
                <view v-for="(point, index) in highlights" :key="index" class="idea-item">
                  <text class="idea-dot">•</text>
                  <text class="idea-text">{{ point }}</text>
                </view>
              </view>

              <view v-if="generatedResult && !isAssistantReply" class="result-card">
                <view v-if="hasPreview" class="preview-shell preview-clickable" @click="openPreview">
                  <view class="preview-header">
                    <text class="preview-title">{{ generatedResult.title || '在线预览' }}</text>
                    <view class="preview-badge">
                      <text class="preview-badge-text">WEB</text>
                    </view>
                  </view>

                  <view class="preview-hero">
                    <text class="preview-hero-title">点击进入 WebView 试玩</text>
                    <text class="preview-hero-copy">
                      {{ generatedResult.summary || '已生成可在线运行的页面，点击即可打开。' }}
                    </text>
                    <view class="preview-cta">
                      <text class="preview-cta-text">立即打开</text>
                    </view>
                  </view>
                </view>

                <view v-else class="preview-shell">
                  <view class="preview-header">
                    <text class="preview-title">{{ generatedResult.title || '生成结果' }}</text>
                    <view class="preview-badge">
                      <text class="preview-badge-text">{{ generatedResult.language || 'html' }}</text>
                    </view>
                  </view>

                  <scroll-view class="preview-code-scroll" scroll-y>
                    <text class="preview-code">{{ generatedResult.code }}</text>
                  </scroll-view>
                </view>
              </view>

              <view v-if="isAssistantReply && assistantActions.length" class="assist-actions">
                <view
                  v-for="action in assistantActions"
                  :key="action.path"
                  class="assist-action"
                  @click="runAssistantAction(action)"
                >
                  <text class="assist-action-text">{{ action.label }}</text>
                </view>
              </view>
            </view>

            <text class="message-time">刚刚</text>
          </view>
        </view>

        <view v-else class="empty-state">
          <text class="empty-title">描述你想做的应用</text>
          <text class="empty-copy">
            比如“做一个贪吃蛇小游戏”或“生成一个登录页”，我会先整理需求，再给出适合移动端的结果。
          </text>
        </view>
      </view>
    </scroll-view>

    <view
      class="input-dock"
      :style="{
        bottom: `${keyboardLiftOffset}px`,
        paddingBottom: `${inputSafeBottom}px`,
      }"
    >
      <view class="input-area">
        <view class="input-shell">
          <input
            v-model="userInput"
            class="prompt-input"
            placeholder="输入你的需求..."
            placeholder-class="prompt-placeholder"
            confirm-type="send"
            maxlength="500"
            :adjust-position="false"
            :cursor-spacing="24"
            @confirm="handleGenerate"
          />
        </view>

        <view class="send-button" :class="{ disabled: loading }" @click="handleGenerate">
          <text class="send-button-text">发送</text>
        </view>
      </view>
    </view>

    <Sidebar
      :visible="sidebarVisible"
      active-section="workshop"
      :workshop-history="workshopHistory"
      @close="closeSidebar"
      @navigate="handleNavigate"
    />
  </view>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onBackPress, onLoad, onShow } from '@dcloudio/uni-app'
import Sidebar from '@/components/Sidebar.vue'
import { generateCode } from '@/services/api'
import { navigateByPath } from '@/utils/navigation'
import { getLayoutMetrics } from '@/utils/layout'
import { classifyWorkshopInput, WorkshopIntent } from '@/utils/workshop_intent'
import { appendDebugLog, DEBUG_LOG_FILE_HINT } from '@/utils/debug-log'
import {
  getWorkshopConversation,
  getWorkshopHistory,
  saveWorkshopConversation,
  setWorkshopHistory,
} from '@/utils/workshop'

const systemInfo = uni.getSystemInfoSync()
const isAndroidApp = systemInfo.platform === 'android'

const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics()
const headerBarHeight = uni.upx2px(72)
const headerShellHeight = statusBarHeight + headerBarHeight
const inputHeight = uni.upx2px(88)
const inputVerticalPadding = uni.upx2px(12)
const inputBaseHeight = inputHeight + inputVerticalPadding * 2

const sidebarVisible = ref(false)
const userInput = ref('')
const loading = ref(false)
const generatedResult = ref(null)
const lastPrompt = ref('')
const loadingPhase = ref(0)
const workshopHistory = ref([])
const currentConversationId = ref('')
const keyboardHeight = ref(0)
const workshopSyncInFlight = ref(false)
const workshopSyncLastAt = ref(0)
const workshopSyncLastSignature = ref('')

let loadingTimer = null
let keyboardHeightHandler = null

const loadingPhases = ['正在理解需求', '正在生成页面结构', '正在整理运行代码', '正在准备在线预览']
const loadingText = '正在生成页面并准备在线预览，请稍等片刻。'

const keyboardLiftOffset = computed(() => {
  if (isAndroidApp) return 0
  return Math.max(Number(keyboardHeight.value || 0), 0)
})

const inputSafeBottom = computed(() => {
  if (keyboardLiftOffset.value > 0) return 12
  return safeAreaInsetsBottom + 16
})

const inputDockHeight = computed(() => inputBaseHeight + inputSafeBottom.value)
const chatBottomOffset = computed(() => inputDockHeight.value + keyboardLiftOffset.value)

const hasPreview = computed(() => !!(generatedResult.value?.previewUrl || generatedResult.value?.url))
const activeLoadingPhase = computed(() => loadingPhases[loadingPhase.value % loadingPhases.length])
const isAssistantReply = computed(() => generatedResult.value?.kind === 'assistant')
const assistantActions = computed(() =>
  (generatedResult.value?.quickActions || []).filter((item) => item?.label && item?.path),
)

const aiTitle = computed(() => {
  if (loading.value) return '正在生成中'
  if (isAssistantReply.value) return '灵境助手'
  return '应用创建成功'
})

const introText = computed(() => {
  if (!lastPrompt.value) {
    return '我会先理解你的需求，再产出一版适合继续打磨的移动端结果。'
  }

  return (
    generatedResult.value?.summary || `围绕“${lastPrompt.value}”，我已经整理出页面结构和交互骨架。`
  )
})

const aiBodyText = computed(() => {
  if (loading.value) return loadingText
  if (isAssistantReply.value) return generatedResult.value?.text || ''
  return introText.value
})

const highlights = computed(() => {
  if (isAssistantReply.value) return []

  if (loading.value) {
    return ['模型已开始生成页面结果', '完成后会自动显示预览卡片', '如果预览可用，可以直接点击试玩']
  }

  if (hasPreview.value) {
    return ['已生成可访问的网页地址', '前端会通过 WebView 承载结果', '后续可以继续迭代玩法和界面']
  }

  return ['保留核心玩法和页面结构', '先输出可继续修改的代码结果', '下一步可以接入 WebView 或沙盒预览']
})

const showHighlights = computed(() => loading.value || (!isAssistantReply.value && !!generatedResult.value))

const coerceText = (value, fallback = '') => {
  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized || fallback
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    const normalized = value.map((item) => coerceText(item)).filter(Boolean).join(' ')
    return normalized || fallback
  }

  if (value && typeof value === 'object') {
    for (const key of ['summary', 'message', 'detail', 'error', 'text', 'title']) {
      const normalized = coerceText(value[key], '')
      if (normalized) return normalized
    }

    try {
      const serialized = JSON.stringify(value)
      return serialized === '{}' ? fallback : serialized
    } catch (error) {
      return fallback
    }
  }

  return fallback
}

const getErrorMessage = (error, fallback = '生成失败，请稍后重试') => {
  const message = coerceText(error?.message || error?.detail || error?.error, '')
  return message || fallback
}

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}

const closeSidebar = () => {
  sidebarVisible.value = false
}

const handleNavigate = (path) => {
  navigateByPath(path)
}

const clearConversation = () => {
  currentConversationId.value = ''
  lastPrompt.value = ''
  generatedResult.value = null
  userInput.value = ''
}

const syncWorkshopHistory = () => {
  workshopHistory.value = getWorkshopHistory()
}

const loadConversation = (chatId) => {
  const conversation = getWorkshopConversation(chatId)
  if (!conversation) {
    clearConversation()
    return
  }

  currentConversationId.value = conversation.id
  lastPrompt.value = conversation.prompt || ''
  generatedResult.value = conversation.result || null
}

const mergeWorkshopHistory = (local = [], remote = []) => {
  const byId = new Map()

  ;[...remote, ...local].forEach((item) => {
    if (!item || !item.id) return

    const existing = byId.get(item.id)
    if (!existing) {
      byId.set(item.id, item)
      return
    }

    const currentTime = Number(existing.createdAt || 0)
    const nextTime = Number(item.createdAt || 0)
    if (nextTime > currentTime) {
      byId.set(item.id, item)
    }
  })

  return Array.from(byId.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

const historySignature = (list = []) => {
  try {
    return JSON.stringify(
      (Array.isArray(list) ? list : [])
        .map((item) => ({ id: item?.id || '', createdAt: Number(item?.createdAt || 0) }))
        .filter((item) => item.id)
        .slice(0, 60),
    )
  } catch (error) {
    return ''
  }
}

const getWorkshopHistoryRemote = async () => ({ list: [] })
const saveWorkshopHistoryRemote = async () => ({ success: true })

const syncWorkshopHistoryRemote = async ({ silent = true } = {}) => {
  const now = Date.now()
  if (workshopSyncInFlight.value) return
  if (now - workshopSyncLastAt.value < 12000) return

  const local = getWorkshopHistory()
  workshopHistory.value = local

  try {
    workshopSyncInFlight.value = true
    const response = await getWorkshopHistoryRemote()
    const remote = Array.isArray(response.list) ? response.list : []
    const merged = mergeWorkshopHistory(local, remote)

    appendDebugLog('workshop', 'history_sync', {
      localCount: local.length,
      remoteCount: remote.length,
      mergedCount: merged.length,
    })

    workshopHistory.value = merged
    setWorkshopHistory(merged)

    const mergedSignature = historySignature(merged)
    const remoteSignature = historySignature(remote)

    if (
      mergedSignature &&
      mergedSignature !== remoteSignature &&
      mergedSignature !== workshopSyncLastSignature.value
    ) {
      try {
        await saveWorkshopHistoryRemote(merged)
        workshopSyncLastSignature.value = mergedSignature
      } catch (error) {
        // ignore remote sync failure and keep local history
      }
    }

    workshopSyncLastAt.value = now
  } catch (error) {
    appendDebugLog('workshop', 'history_sync_failed', {
      error: getErrorMessage(error, '云端历史同步失败'),
    })

    if (!silent) {
      uni.showToast({
        title: getErrorMessage(error, '云端历史同步失败'),
        icon: 'none',
      })
    }
  } finally {
    workshopSyncInFlight.value = false
  }
}

const startLoadingAnimation = () => {
  if (loadingTimer) {
    clearInterval(loadingTimer)
  }

  loadingPhase.value = 0
  loadingTimer = setInterval(() => {
    loadingPhase.value = (loadingPhase.value + 1) % loadingPhases.length
  }, 1200)
}

const stopLoadingAnimation = () => {
  if (!loadingTimer) return
  clearInterval(loadingTimer)
  loadingTimer = null
}

const openPreview = () => {
  const previewUrl = generatedResult.value?.previewUrl || generatedResult.value?.url
  if (!previewUrl) {
    appendDebugLog('workshop', 'open_preview_skipped', {
      reason: 'missing preview url',
      result: generatedResult.value || '',
    })
    return
  }

  appendDebugLog('workshop', 'open_preview', {
    title: generatedResult.value?.title || '',
    previewUrl,
  })

  uni.navigateTo({
    url: `/pages/workshop/preview?url=${encodeURIComponent(previewUrl)}&title=${encodeURIComponent(
      generatedResult.value?.title || '工坊预览',
    )}`,
  })
}

const runAssistantAction = (action) => {
  if (!action?.path) return
  navigateByPath(action.path)
}

const buildAssistantReply = ({ intent }) => {
  const examples = ['做一个贪吃蛇小游戏', '生成一个登录页', '做一个记账小程序页面']

  if (intent === 'news') {
    return {
      kind: 'assistant',
      text: `我可以带你去看 AI 资讯榜单。\n\n你也可以继续在工坊里输入“${examples[0]}”这类指令来生成小游戏或页面原型。`,
      quickActions: [
        { label: '去 AI 观察哨', path: '/pages/crawl/index' },
        { label: '去 AI 学堂', path: '/pages/school/input' },
      ],
    }
  }

  if (intent === 'school') {
    return {
      kind: 'assistant',
      text: `我可以带你去 AI 学堂。\n\n如果你想在工坊生成小游戏或页面，请直接这样说：\n- ${examples[0]}\n- ${examples[1]}`,
      quickActions: [
        { label: '去 AI 学堂', path: '/pages/school/input' },
        { label: '去 AI 观察哨', path: '/pages/crawl/index' },
      ],
    }
  }

  return {
    kind: 'assistant',
    text: `我能做两件事：\n1. 在工坊帮你生成小游戏或页面原型\n2. 带你跳转到 AI 观察哨 / AI 学堂\n\n如果你要生成，请这样说：\n- ${examples[0]}\n- ${examples[1]}\n- ${examples[2]}`,
    quickActions: [
      { label: '去 AI 观察哨', path: '/pages/crawl/index' },
      { label: '去 AI 学堂', path: '/pages/school/input' },
    ],
  }
}

const normalizeWorkshopResult = (response, prompt) => {
  const raw = response?.result && typeof response.result === 'object' ? response.result : response || {}
  const previewUrl = raw.previewUrl || raw.url || response?.url || response?.previewUrl || ''
  const code = coerceText(raw.code || raw.html || response?.html, '')
  const summary =
    coerceText(raw.summary || raw.message || response?.summary || response?.message, '') ||
    `已根据“${prompt}”生成结果，可以直接打开预览。`
  const title = coerceText(raw.title || response?.title || prompt, '工坊预览')

  const normalizedResult = {
    ...raw,
    title,
    summary,
    code,
    url: previewUrl,
    previewUrl,
    language: raw.language || 'html',
  }

  appendDebugLog('workshop', 'normalize_result', {
    prompt,
    previewUrl,
    title,
    hasCode: !!code,
    summary,
    raw: response,
  })

  return normalizedResult
}

const handleGenerate = async () => {
  const prompt = userInput.value.trim()
  if (!prompt || loading.value) {
    if (!prompt) {
      uni.showToast({ title: '请输入你的需求', icon: 'none' })
    }
    return
  }

  appendDebugLog('workshop', 'generate_submit', {
    prompt,
    logFile: DEBUG_LOG_FILE_HINT,
  })

  lastPrompt.value = prompt
  userInput.value = ''

  const localIntent = classifyWorkshopInput(prompt)
  if (localIntent.intent !== WorkshopIntent.GenerateWorkshop) {
    generatedResult.value = buildAssistantReply({ intent: localIntent.intent || 'help' })
    appendDebugLog('workshop', 'route_classified_as_help', localIntent)
    return
  }

  loading.value = true
  generatedResult.value = null
  startLoadingAnimation()

  try {
    const response = await generateCode(prompt)
    appendDebugLog('workshop', 'generate_response', response || {})

    const nextResult = normalizeWorkshopResult(response, prompt)
    generatedResult.value = nextResult

    const savedConversation = saveWorkshopConversation({
      id: currentConversationId.value || `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
      prompt,
      result: nextResult,
      createdAt: Date.now(),
    })

    currentConversationId.value = savedConversation.id
    syncWorkshopHistory()
    workshopSyncLastAt.value = 0
  } catch (error) {
    appendDebugLog('workshop', 'generate_failed', {
      prompt,
      error: getErrorMessage(error),
    })
    uni.showToast({ title: getErrorMessage(error), icon: 'none' })
    userInput.value = prompt
  } finally {
    loading.value = false
    stopLoadingAnimation()
  }
}

const registerKeyboardListener = () => {
  if (typeof uni.onKeyboardHeightChange !== 'function') return

  keyboardHeightHandler = (event = {}) => {
    keyboardHeight.value = Math.max(Number(event.height || 0), 0)
  }

  uni.onKeyboardHeightChange(keyboardHeightHandler)
}

const unregisterKeyboardListener = () => {
  if (!keyboardHeightHandler) return

  if (typeof uni.offKeyboardHeightChange === 'function') {
    uni.offKeyboardHeightChange(keyboardHeightHandler)
  }

  keyboardHeightHandler = null
}

onMounted(() => {
  registerKeyboardListener()
})

onUnmounted(() => {
  stopLoadingAnimation()
  unregisterKeyboardListener()
})

onLoad((query) => {
  syncWorkshopHistory()
  syncWorkshopHistoryRemote({ silent: true })
  sidebarVisible.value = query.openSidebar === '1'

  if (query.reset === '1') {
    clearConversation()
    return
  }

  if (query.chatId) {
    loadConversation(decodeURIComponent(query.chatId))
  }
})

onShow(() => {
  syncWorkshopHistory()
  syncWorkshopHistoryRemote({ silent: true })
})

let lastBackPressAt = 0

onBackPress(() => {
  if (sidebarVisible.value) {
    closeSidebar()
    return true
  }

  const now = Date.now()
  if (now - lastBackPressAt < 1500) {
    // #ifdef APP-PLUS
    plus.runtime.quit()
    // #endif
    return true
  }

  lastBackPressAt = now
  uni.showToast({ title: '再按一次退出应用', icon: 'none' })
  return true
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';

.workshop-page {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: #0a0a0a;
}

.header-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  background: rgba(10, 10, 10, 0.96);
  backdrop-filter: blur(14rpx);
}

.page-header {
  height: 72rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-action,
.header-placeholder {
  width: 52rpx;
  text-align: center;
  flex-shrink: 0;
}

.header-action {
  color: $text-white;
  font-size: 38rpx;
  line-height: 1;
}

.header-title {
  color: $text-white;
  font-size: 34rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.chat-scroll {
  position: fixed;
  left: 0;
  right: 0;
}

.chat-content {
  padding: 16rpx 16rpx 24rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.user-row {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.user-bubble {
  max-width: 78%;
  padding: 18rpx 24rpx;
  border-radius: 24rpx;
  background: #1a1a1a;
}

.user-text {
  color: $text-white;
  font-size: 28rpx;
  line-height: 1.55;
}

.message-time {
  color: #5f6368;
  font-size: 20rpx;
}

.ai-row {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.ai-avatar {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: #eab308;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10rpx;
  flex-shrink: 0;
}

.ai-avatar-text {
  color: #101010;
  font-size: 20rpx;
  font-weight: 700;
}

.ai-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.ai-bubble {
  border-radius: 28rpx;
  background: #fff9f0;
  border: 2rpx solid rgba(217, 119, 6, 0.5);
  padding: 22rpx 22rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.ai-title {
  color: #101010;
  font-size: 30rpx;
  font-weight: 700;
}

.ai-text {
  color: #2d2d2d;
  font-size: 28rpx;
  line-height: 1.75;
  white-space: pre-wrap;
}

.loading-panel {
  position: relative;
  overflow: hidden;
  border-radius: 22rpx;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92));
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.loading-orbit {
  position: relative;
  height: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orbit-ring {
  position: absolute;
  border-radius: 50%;
  border: 2rpx solid rgba(125, 211, 252, 0.22);
}

.ring-one {
  width: 156rpx;
  height: 156rpx;
  animation: spin 5.8s linear infinite;
}

.ring-two {
  width: 112rpx;
  height: 112rpx;
  border-color: rgba(196, 181, 253, 0.38);
  animation: spin-reverse 4.2s linear infinite;
}

.orbit-core {
  width: 74rpx;
  height: 74rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 32rpx rgba(56, 189, 248, 0.4);
  animation: pulse-core 1.8s ease-in-out infinite;
}

.orbit-core-text {
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.orbit-dot {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #f8fafc;
  box-shadow: 0 0 16rpx rgba(255, 255, 255, 0.55);
}

.dot-one {
  top: 10rpx;
  left: 50%;
  margin-left: -8rpx;
  animation: float-dot 1.8s ease-in-out infinite;
}

.dot-two {
  right: 36rpx;
  bottom: 34rpx;
  animation: float-dot 1.8s ease-in-out 0.4s infinite;
}

.dot-three {
  left: 36rpx;
  bottom: 34rpx;
  animation: float-dot 1.8s ease-in-out 0.8s infinite;
}

.loading-meta {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.loading-phase {
  color: #f8fafc;
  font-size: 28rpx;
  font-weight: 700;
}

.loading-subtitle {
  color: #94a3b8;
  font-size: 22rpx;
  line-height: 1.6;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 12rpx;
  opacity: 0.45;
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.loading-step.active {
  opacity: 1;
  transform: translateX(4rpx);
}

.loading-step-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.4);
}

.loading-step.active .loading-step-dot {
  background: #38bdf8;
  box-shadow: 0 0 16rpx rgba(56, 189, 248, 0.5);
}

.loading-step-text {
  color: #e2e8f0;
  font-size: 22rpx;
}

.loading-progress-track {
  height: 10rpx;
  border-radius: 999rpx;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;
}

.loading-progress-bar {
  width: 42%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #38bdf8, #8b5cf6);
  animation: progress-flow 1.9s ease-in-out infinite;
}

.idea-card {
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.66);
  padding: 18rpx 18rpx 14rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.idea-title {
  color: #6b7280;
  font-size: 22rpx;
  font-weight: 600;
}

.idea-item {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
}

.idea-dot {
  color: #84cc16;
  font-size: 24rpx;
  line-height: 1.5;
}

.idea-text {
  flex: 1;
  color: #475569;
  font-size: 24rpx;
  line-height: 1.6;
}

.result-card {
  border-radius: 24rpx;
  background: #f4efe8;
  overflow: hidden;
}

.preview-shell {
  margin: 0 14rpx 14rpx;
  border-radius: 20rpx;
  background: #111827;
  padding: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.preview-clickable {
  border: 2rpx solid rgba(34, 211, 238, 0.35);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.preview-title {
  flex: 1;
  min-width: 0;
  color: $text-white;
  font-size: 28rpx;
  font-weight: 700;
}

.preview-badge {
  min-width: 72rpx;
  height: 40rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: rgba(34, 211, 238, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.preview-badge-text {
  color: #22d3ee;
  font-size: 20rpx;
  text-transform: uppercase;
}

.preview-hero {
  min-height: 280rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #0f172a, #111827 55%, #0ea5e9);
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18rpx;
}

.preview-hero-title {
  color: $text-white;
  font-size: 32rpx;
  font-weight: 700;
}

.preview-hero-copy {
  color: #cbd5e1;
  font-size: 24rpx;
  line-height: 1.7;
}

.preview-cta {
  width: fit-content;
  padding: 12rpx 22rpx;
  border-radius: 999rpx;
  background: #7c3aed;
}

.preview-cta-text {
  color: $text-white;
  font-size: 22rpx;
  font-weight: 700;
}

.preview-code-scroll {
  max-height: 360rpx;
}

.preview-code {
  color: #cbd5e1;
  font-size: 22rpx;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
}

.assist-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.assist-action {
  padding: 12rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(124, 58, 237, 0.12);
  border: 2rpx solid rgba(124, 58, 237, 0.22);
}

.assist-action-text {
  color: #7c3aed;
  font-size: 24rpx;
  font-weight: 700;
}

.empty-state {
  margin-top: 56rpx;
  border-radius: 28rpx;
  background: #121212;
  border: 2rpx dashed rgba(255, 255, 255, 0.08);
  padding: 36rpx 28rpx;
}

.empty-title {
  display: block;
  margin-bottom: 14rpx;
  color: $text-white;
  font-size: 32rpx;
  font-weight: 700;
}

.empty-copy {
  color: $text-muted;
  font-size: 26rpx;
  line-height: 1.7;
}

.input-dock {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 45;
  background: linear-gradient(180deg, rgba(10, 10, 10, 0), rgba(10, 10, 10, 0.92) 24%, rgba(10, 10, 10, 1) 100%);
}

.input-area {
  padding: 12rpx 24rpx 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.input-shell {
  flex: 1;
  height: 88rpx;
  border-radius: 999rpx;
  background: #1c1c1e;
  border: 2rpx solid #06b6d4;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
}

.prompt-input {
  flex: 1;
  min-width: 0;
  color: $text-white;
  font-size: 28rpx;
}

.prompt-placeholder {
  color: #999;
  font-size: 28rpx;
}

.send-button {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #8a2be2;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 28rpx rgba(138, 43, 226, 0.22);
  flex-shrink: 0;
}

.send-button.disabled {
  opacity: 0.6;
}

.send-button-text {
  color: $text-white;
  font-size: 24rpx;
  font-weight: 700;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes spin-reverse {
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0deg);
  }
}

@keyframes pulse-core {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 32rpx rgba(56, 189, 248, 0.4);
  }

  50% {
    transform: scale(1.08);
    box-shadow: 0 0 44rpx rgba(139, 92, 246, 0.48);
  }
}

@keyframes float-dot {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }

  50% {
    transform: translateY(-8rpx);
    opacity: 1;
  }
}

@keyframes progress-flow {
  0% {
    transform: translateX(-90%);
  }

  50% {
    transform: translateX(70%);
  }

  100% {
    transform: translateX(180%);
  }
}
</style>
