<template>
  <view class="workshop-page">
    <view class="top-safe" :style="{ paddingTop: `${statusBarHeight}px` }"></view>

    <view class="page-header">
      <text class="header-action" @click="toggleSidebar">☰</text>
      <text class="header-title">AI 工坊</text>
      <view class="header-placeholder"></view>
    </view>

    <scroll-view class="chat-scroll" scroll-y :style="{ height: `${chatHeight}px` }">
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
                  <text class="loading-subtitle">正在调用模型、整理代码并准备在线预览</text>

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
                <view class="idea-item" v-for="(point, index) in highlights" :key="index">
                  <text class="idea-dot">•</text>
                  <text class="idea-text">{{ point }}</text>
                </view>
              </view>

              <view v-if="generatedResult && !isAssistantReply" class="result-card">
                <view class="result-toolbar">
                  <text class="result-tool" @click="openPreview">试玩</text>
                  <text class="result-tool" @click="openPreview">发布</text>
                  <text class="result-tool" @click="openPreview">全屏</text>
                </view>

                <view v-if="hasPreview" class="preview-shell preview-clickable" @click="openPreview">
                  <view class="preview-header">
                    <text class="preview-title">{{ generatedResult.title || '在线预览' }}</text>
                    <view class="preview-badge">
                      <text class="preview-badge-text">WEB</text>
                    </view>
                  </view>

                  <view class="preview-hero">
                    <text class="preview-hero-title">点击进入 WebView 试玩</text>
                    <text class="preview-hero-copy">{{ generatedResult.summary || '已生成可在线运行的页面预览。' }}</text>
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
            比如“做一个贪吃蛇小游戏”或“生成一个登录页”，我会把它变成可以继续迭代的代码结果。
          </text>
        </view>
      </view>
    </scroll-view>

    <view v-if="generatedResult && hasPreview && !isAssistantReply" class="floating-action" @click="openPreview">
      <text class="floating-action-text">↗</text>
    </view>

    <view class="input-area" :style="{ paddingBottom: `${safeAreaInsetsBottom + 16}px` }">
      <view class="input-shell">
        <view class="voice-badge">
          <text class="voice-badge-text">✦</text>
        </view>
        <input
          class="prompt-input"
          v-model="userInput"
          placeholder="输入消息..."
          placeholder-class="prompt-placeholder"
          confirm-type="send"
          maxlength="500"
          @confirm="handleGenerate"
        />
      </view>

      <view class="send-button" :class="{ disabled: loading }" @click="handleGenerate">
        <text class="send-button-text">➜</text>
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
import { computed, onUnmounted, ref } from 'vue'
import { onBackPress, onLoad, onShow } from '@dcloudio/uni-app'
import Sidebar from '@/components/Sidebar.vue'
import { generateCode, getWorkshopHistoryRemote, routeWorkshopInput, saveWorkshopHistoryRemote } from '@/services/api'
import { navigateByPath } from '@/utils/navigation'
import { getLayoutMetrics } from '@/utils/layout'
import { classifyWorkshopInput, WorkshopIntent } from '@/utils/workshop_intent'
import {
  getWorkshopConversation,
  getWorkshopHistory,
  saveWorkshopConversation,
} from '@/utils/workshop'

const systemInfo = uni.getSystemInfoSync()
const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics()

const sidebarVisible = ref(false)
const userInput = ref('')
const loading = ref(false)
const generatedResult = ref(null)
const lastPrompt = ref('')
const loadingPhase = ref(0)
const workshopHistory = ref([])
const currentConversationId = ref('')
let loadingTimer = null
const workshopSyncInFlight = ref(false)
const workshopSyncLastAt = ref(0)
const workshopSyncLastSignature = ref('')

const loadingPhases = [
  '正在理解需求',
  '正在生成页面结构',
  '正在整理运行代码',
  '正在准备在线预览'
]

const chatHeight = Math.max(systemInfo.windowHeight - statusBarHeight - 190 - safeAreaInsetsBottom, 380)
const hasPreview = computed(() => !!generatedResult.value?.previewUrl)
const loadingText = '正在生成页面并准备在线预览，请稍等片刻。'
const activeLoadingPhase = computed(() => loadingPhases[loadingPhase.value % loadingPhases.length])
const isAssistantReply = computed(() => generatedResult.value?.kind === 'assistant')
const assistantActions = computed(() => (generatedResult.value?.quickActions || []).filter((x) => x?.label && x?.path))

const aiTitle = computed(() => {
  if (loading.value) return '正在生成中'
  if (isAssistantReply.value) return '灵境助手'
  return '应用创建成功'
})

const aiBodyText = computed(() => {
  if (loading.value) return loadingText
  if (isAssistantReply.value) return generatedResult.value?.text || ''
  return introText.value
})

const introText = computed(() => {
  if (!lastPrompt.value) {
    return '我会先理解你的需求，再产出一版可以继续打磨的页面代码。'
  }
  return generatedResult.value?.summary || `围绕“${lastPrompt.value}”，我已经整理出页面结构和交互骨架。`
})

const highlights = computed(() => {
  if (isAssistantReply.value) return []
  if (loading.value) {
    return ['模型已开始生成应用结构', '结果完成后会自动切换到预览卡片', '如果预览可用，可以直接打开试玩']
  }
  if (hasPreview.value) {
    return ['已生成可访问的网页地址', '前端将通过 WebView 或浏览器承载运行', '后续可以继续做发布和分享流程']
  }
  return ['保留核心玩法和页面骨架', '先生成可继续修改的代码结果', '下一步可以接入 WebView 或沙盒预览']
})

const showHighlights = computed(() => loading.value || (!isAssistantReply.value && !!generatedResult.value))

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
    const a = Number(existing.createdAt || 0)
    const b = Number(item.createdAt || 0)
    if (b > a) byId.set(item.id, item)
  })
  return Array.from(byId.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

const historySignature = (list = []) => {
  try {
    return JSON.stringify(
      (Array.isArray(list) ? list : [])
        .map((x) => ({ id: x?.id || '', createdAt: Number(x?.createdAt || 0) }))
        .filter((x) => x.id)
        .slice(0, 60),
    )
  } catch (e) {
    return ''
  }
}

const syncWorkshopHistoryRemote = async ({ silent = true } = {}) => {
  const now = Date.now()
  if (workshopSyncInFlight.value) return
  // Throttle: avoid request storms on frequent onShow.
  if (now - workshopSyncLastAt.value < 12000) return

  const local = getWorkshopHistory()
  workshopHistory.value = local
  try {
    workshopSyncInFlight.value = true
    const res = await getWorkshopHistoryRemote()
    const remote = Array.isArray(res.list) ? res.list : []
    const merged = mergeWorkshopHistory(local, remote)
    workshopHistory.value = merged
    uni.setStorageSync('workshopHistory', merged)
    const mergedSig = historySignature(merged)
    const remoteSig = historySignature(remote)
    // Only push when merged differs from remote and we haven't pushed same payload.
    if (mergedSig && mergedSig !== remoteSig && mergedSig !== workshopSyncLastSignature.value) {
      try {
        await saveWorkshopHistoryRemote(merged)
        workshopSyncLastSignature.value = mergedSig
      } catch (e) {
        // ignore
      }
    }
    workshopSyncLastAt.value = now
  } catch (error) {
    if (!silent) {
      uni.showToast({ title: error.message || '云端历史同步失败', icon: 'none' })
    }
  } finally {
    workshopSyncInFlight.value = false
  }
}

const startLoadingAnimation = () => {
  if (loadingTimer) clearInterval(loadingTimer)
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
  if (!generatedResult.value?.previewUrl) return
  uni.navigateTo({
    url: `/pages/workshop/preview?url=${encodeURIComponent(generatedResult.value.previewUrl)}&title=${encodeURIComponent(generatedResult.value.title || '工坊预览')}`,
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
      text: `我可以带你去看 AI 资讯榜单。\n\n你也可以继续在工坊里输入“${examples[0]}”这类指令来生成小游戏/页面原型。`,
      quickActions: [
        { label: '去 AI 资讯页', path: '/pages/crawl/index' },
        { label: '去 AI 学堂', path: '/pages/school/input' },
      ],
    }
  }
  if (intent === 'school') {
    return {
      kind: 'assistant',
      text: `我可以带你去 AI 学堂生成白板课堂。\n\n如果你想在工坊生成小游戏/页面，请直接说：\n- ${examples[0]}\n- ${examples[1]}`,
      quickActions: [
        { label: '去 AI 学堂', path: '/pages/school/input' },
        { label: '去 AI 资讯页', path: '/pages/crawl/index' },
      ],
    }
  }
  return {
    kind: 'assistant',
    text: `我能做两件事：\n1) 在工坊帮你生成小游戏/页面原型\n2) 带你跳转到 AI 资讯 / AI 学堂\n\n如果你要生成，请这样说：\n- ${examples[0]}\n- ${examples[1]}\n- ${examples[2]}`,
    quickActions: [
      { label: '去 AI 资讯页', path: '/pages/crawl/index' },
      { label: '去 AI 学堂', path: '/pages/school/input' },
    ],
  }
}

const handleGenerate = async () => {
  const prompt = userInput.value.trim()
  if (!prompt || loading.value) {
    if (!prompt) uni.showToast({ title: '请输入你的需求', icon: 'none' })
    return
  }

  lastPrompt.value = prompt
  userInput.value = ''
  try {
    const routed = await routeWorkshopInput(prompt)
    if (!routed?.shouldGenerate) {
      generatedResult.value = {
        kind: 'assistant',
        text: routed?.replyText || buildAssistantReply({ intent: routed?.intent || 'help' }).text,
        quickActions: Array.isArray(routed?.quickActions) ? routed.quickActions : buildAssistantReply({ intent: routed?.intent || 'help' }).quickActions,
      }
      return
    }
    // Keep the original user wording in both the UI and generation request.
    lastPrompt.value = prompt
  } catch (e) {
    // If router fails, fall back to old behavior: require explicit keywords via local rules.
    // (Keep UX safe: do not generate on greetings.)
    const fallback = classifyWorkshopInput(prompt)
    if (fallback.intent !== WorkshopIntent.GenerateWorkshop) {
      generatedResult.value = buildAssistantReply({ intent: 'help' })
      return
    }
  }

  loading.value = true
  generatedResult.value = null
  startLoadingAnimation()

  try {
    const response = await generateCode(lastPrompt.value)
    generatedResult.value = response.result
    const savedConversation = saveWorkshopConversation({
      id: currentConversationId.value || `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
      prompt: lastPrompt.value,
      result: response.result,
      createdAt: Date.now(),
    })
    currentConversationId.value = savedConversation.id
    syncWorkshopHistory()
    // Mark dirty and allow next scheduled sync to push.
    workshopSyncLastAt.value = 0
  } catch (error) {
    uni.showToast({ title: error.message, icon: 'none' })
    userInput.value = prompt
  } finally {
    loading.value = false
    stopLoadingAnimation()
  }
}

onUnmounted(() => {
  stopLoadingAnimation()
})

onLoad((query) => {
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

.workshop-page { min-height: 100vh; background: #0a0a0a; display: flex; flex-direction: column; position: relative; }
.top-safe { padding-left: 24rpx; padding-right: 24rpx; }
.page-header { position: sticky; top: 0; z-index: 20; height: 68rpx; padding: 0 24rpx; display: flex; align-items: center; justify-content: space-between; background: #0a0a0a; }
.header-action, .header-placeholder { width: 44rpx; text-align: center; }
.header-action { color: $text-white; font-size: 34rpx; }
.header-title { color: $text-white; font-size: 34rpx; font-weight: 700; letter-spacing: 1rpx; }
.chat-scroll { flex: 1; }
.chat-content { padding: 12rpx 16rpx 0; display: flex; flex-direction: column; gap: 18rpx; }
.user-row { display: flex; flex-direction: column; align-items: flex-end; gap: 8rpx; }
.user-bubble { max-width: 78%; padding: 18rpx 24rpx; border-radius: 24rpx; background: #1a1a1a; }
.user-text { color: $text-white; font-size: 28rpx; line-height: 1.5; }
.message-time { color: #5f6368; font-size: 20rpx; }
.ai-row { display: flex; align-items: flex-start; gap: 12rpx; }
.ai-avatar { width: 52rpx; height: 52rpx; border-radius: 50%; background: #eab308; display: flex; align-items: center; justify-content: center; margin-top: 10rpx; flex-shrink: 0; }
.ai-avatar-text { color: #101010; font-size: 20rpx; font-weight: 700; }
.ai-column { flex: 1; display: flex; flex-direction: column; gap: 8rpx; }
.ai-bubble { border-radius: 28rpx; background: #fff9f0; border: 2rpx solid rgba(217,119,6,0.5); padding: 22rpx 22rpx 24rpx; display: flex; flex-direction: column; gap: 18rpx; }
.ai-title { color: #101010; font-size: 30rpx; font-weight: 700; }
.ai-text { color: #2d2d2d; font-size: 28rpx; line-height: 1.7; }
.loading-panel { border-radius: 22rpx; background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92)); padding: 24rpx; display: flex; flex-direction: column; gap: 22rpx; overflow: hidden; position: relative; }
.loading-orbit { height: 180rpx; position: relative; display: flex; align-items: center; justify-content: center; }
.orbit-ring { position: absolute; border-radius: 50%; border: 2rpx solid rgba(125, 211, 252, 0.22); }
.ring-one { width: 156rpx; height: 156rpx; animation: spin 5.8s linear infinite; }
.ring-two { width: 112rpx; height: 112rpx; border-color: rgba(196, 181, 253, 0.38); animation: spinReverse 4.2s linear infinite; }
.orbit-core { width: 74rpx; height: 74rpx; border-radius: 50%; background: linear-gradient(135deg, #38bdf8, #8b5cf6); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 32rpx rgba(56, 189, 248, 0.4); animation: pulseCore 1.8s ease-in-out infinite; }
.orbit-core-text { color: #fff; font-size: 24rpx; font-weight: 700; }
.orbit-dot { position: absolute; width: 16rpx; height: 16rpx; border-radius: 50%; background: #f8fafc; box-shadow: 0 0 16rpx rgba(255, 255, 255, 0.55); }
.dot-one { top: 10rpx; left: 50%; margin-left: -8rpx; animation: floatDot 1.8s ease-in-out infinite; }
.dot-two { right: 36rpx; bottom: 34rpx; animation: floatDot 1.8s ease-in-out 0.4s infinite; }
.dot-three { left: 36rpx; bottom: 34rpx; animation: floatDot 1.8s ease-in-out 0.8s infinite; }
.loading-meta { display: flex; flex-direction: column; gap: 14rpx; }
.loading-phase { color: #f8fafc; font-size: 28rpx; font-weight: 700; }
.loading-subtitle { color: #94a3b8; font-size: 22rpx; line-height: 1.6; }
.loading-steps { display: flex; flex-direction: column; gap: 10rpx; }
.loading-step { display: flex; align-items: center; gap: 12rpx; opacity: 0.45; transition: opacity 0.25s ease, transform 0.25s ease; }
.loading-step.active { opacity: 1; transform: translateX(4rpx); }
.loading-step-dot { width: 14rpx; height: 14rpx; border-radius: 50%; background: rgba(148, 163, 184, 0.4); }
.loading-step.active .loading-step-dot { background: #38bdf8; box-shadow: 0 0 16rpx rgba(56, 189, 248, 0.5); }
.loading-step-text { color: #e2e8f0; font-size: 22rpx; }
.loading-progress-track { height: 10rpx; border-radius: 999rpx; background: rgba(148, 163, 184, 0.18); overflow: hidden; }
.loading-progress-bar { width: 42%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #38bdf8, #8b5cf6); animation: progressFlow 1.9s ease-in-out infinite; }
.idea-card { border-radius: 20rpx; background: rgba(255,255,255,0.66); padding: 18rpx 18rpx 14rpx; display: flex; flex-direction: column; gap: 10rpx; }
.idea-title { color: #6b7280; font-size: 22rpx; font-weight: 600; }
.idea-item { display: flex; align-items: flex-start; gap: 10rpx; }
.idea-dot { color: #84cc16; font-size: 24rpx; line-height: 1.5; }
.idea-text { flex: 1; color: #475569; font-size: 24rpx; line-height: 1.6; }
.result-card { border-radius: 24rpx; background: #f4efe8; overflow: hidden; }
.result-toolbar { display: none; }
.result-tool { color: #4b5563; font-size: 24rpx; }
.preview-shell { margin: 0 14rpx 14rpx; border-radius: 20rpx; background: #111827; padding: 18rpx; display: flex; flex-direction: column; gap: 16rpx; }
.preview-clickable { border: 2rpx solid rgba(34,211,238,0.35); }
.preview-header { display: flex; align-items: center; justify-content: space-between; }
.preview-title { color: $text-white; font-size: 28rpx; font-weight: 700; }
.preview-badge { min-width: 72rpx; height: 40rpx; padding: 0 14rpx; border-radius: 999rpx; background: rgba(34,211,238,0.16); display: flex; align-items: center; justify-content: center; }
.preview-badge-text { color: #22d3ee; font-size: 20rpx; text-transform: uppercase; }
.preview-hero { min-height: 280rpx; border-radius: 18rpx; background: linear-gradient(135deg, #0f172a, #111827 55%, #0ea5e9); padding: 24rpx; display: flex; flex-direction: column; justify-content: space-between; }
.preview-hero-title { color: $text-white; font-size: 32rpx; font-weight: 700; margin-bottom: 12rpx; }
.preview-hero-copy { color: #cbd5e1; font-size: 24rpx; line-height: 1.7; }
.preview-cta { margin-top: 20rpx; width: fit-content; padding: 12rpx 22rpx; border-radius: 999rpx; background: #7c3aed; }
.preview-cta-text { color: $text-white; font-size: 22rpx; font-weight: 700; }
.preview-code-scroll { max-height: 360rpx; }
.preview-code { color: #cbd5e1; font-size: 22rpx; line-height: 1.7; white-space: pre-wrap; word-break: break-all; }
.empty-state { margin-top: 60rpx; border-radius: 28rpx; background: #121212; border: 2rpx dashed rgba(255,255,255,0.08); padding: 36rpx 28rpx; }
.empty-title { display: block; color: $text-white; font-size: 32rpx; font-weight: 700; margin-bottom: 14rpx; }
.empty-copy { color: $text-muted; font-size: 26rpx; line-height: 1.7; }
.floating-action { display: none; }
.floating-action-text { color: $text-white; font-size: 34rpx; }
.input-area { padding: 12rpx 24rpx 0; display: flex; align-items: center; gap: 16rpx; }
.input-shell { flex: 1; height: 88rpx; border-radius: 999rpx; background: #1c1c1e; border: 2rpx solid #06b6d4; padding: 0 16rpx 0 10rpx; display: flex; align-items: center; gap: 12rpx; }
.voice-badge { width: 48rpx; height: 48rpx; border-radius: 16rpx; background: #faf6f0; display: flex; align-items: center; justify-content: center; }
.voice-badge-text { color: #c77d2f; font-size: 20rpx; }
.prompt-input { flex: 1; color: $text-white; font-size: 28rpx; }
.prompt-placeholder { color: #999999; font-size: 28rpx; }
.send-button { width: 88rpx; height: 88rpx; border-radius: 50%; background: #8a2be2; display: flex; align-items: center; justify-content: center; box-shadow: 0 16rpx 28rpx rgba(138,43,226,0.22); }
.send-button.disabled { opacity: 0.6; }
.send-button-text { color: $text-white; font-size: 30rpx; transform: translateX(2rpx); }

.assist-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 18rpx;
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spinReverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes pulseCore {
  0%, 100% { transform: scale(1); box-shadow: 0 0 32rpx rgba(56, 189, 248, 0.4); }
  50% { transform: scale(1.08); box-shadow: 0 0 44rpx rgba(139, 92, 246, 0.48); }
}

@keyframes floatDot {
  0%, 100% { transform: translateY(0); opacity: 0.7; }
  50% { transform: translateY(-8rpx); opacity: 1; }
}

@keyframes progressFlow {
  0% { transform: translateX(-90%); }
  50% { transform: translateX(70%); }
  100% { transform: translateX(180%); }
}
</style>
