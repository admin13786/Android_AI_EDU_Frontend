<template>
  <view class="classroom-page">
    <view class="top-safe" :style="{ paddingTop: `${statusBarHeight}px` }"></view>

    <view class="page-header">
      <text class="header-icon" @click="goBack">←</text>
      <text class="header-title">{{ classroom?.topic || '课程主题' }}</text>
      <text class="header-icon">⋯</text>
    </view>

    <view class="control-bar">
      <text class="control-label" @click="toggleVolume">{{ volumeOn ? '音量开' : '音量关' }}</text>
      <view class="speed-pill" @click="cycleSpeed">
        <text class="speed-text">{{ playSpeed }}x</text>
      </view>
      <text class="control-label" @click="prevLesson">上一节</text>
      <view class="play-button" :class="{ disabled: playDisabled }" @click="togglePlay">
        <text class="play-icon">{{ playButtonText }}</text>
      </view>
      <text class="control-label" @click="nextLesson">下一节</text>
    </view>

    <view class="media-area" v-if="isGenerating">
      <view class="video-placeholder">
        <view class="generation-orbit" aria-hidden="true">
          <view class="orbit-ring"></view>
          <view class="orbit-ring orbit-ring-inner"></view>
          <view class="orbit-core"></view>
          <view class="orbit-dot orbit-dot-a"></view>
          <view class="orbit-dot orbit-dot-b"></view>
          <view class="orbit-dot orbit-dot-c"></view>
        </view>
        <text class="video-placeholder-title">课堂生成中…</text>
        <text class="video-placeholder-copy">课堂引擎正在生成白板课件、讲解脚本和互动内容，请稍等片刻。</text>
      </view>
    </view>

    <view class="media-area" v-else-if="sceneHasWhiteboard">
      <view class="scene-card">
        <WhiteboardPlayer
          :whiteboard="currentOutline?.whiteboard"
          :active-element-id="activeElementId"
        />
      </view>
    </view>

    <view class="media-area quiz-area" v-else-if="sceneIsQuiz">
      <QuizPlayer
        :key="currentOutline?.id"
        :questions="quizQuestions"
        :show-result="quizShowResult"
        :submitting="quizSubmitting"
        :results="quizResults"
        :score="quizScore"
        :max-score="quizMaxScore"
        @submit="handleQuizSubmit"
      />
    </view>

    <view class="status-card" v-if="quizLastSummary">
      <text class="status-card-title">上次测验结果</text>
      <text class="status-card-copy">{{ quizLastSummary }}</text>
    </view>

    <view class="media-area" v-else-if="currentVideoUrl">
      <video
        class="lesson-video"
        :src="currentVideoUrl"
        :autoplay="isPlaying"
        :muted="!volumeOn"
        :show-mute-btn="true"
        :controls="true"
        :play-strategy="3"
        object-fit="contain"
        @error="handleVideoError"
      />
    </view>

    <view class="media-area" v-else>
      <view class="video-placeholder" :class="{ failed: generationFailed }">
        <text class="video-placeholder-title">{{ fallbackMediaTitle }}</text>
        <text class="video-placeholder-copy">{{ fallbackMediaCopy }}</text>
      </view>
    </view>

    <view class="status-card failed" v-if="generationFailed">
      <text class="status-card-title">已切换到课堂文本模式</text>
      <text class="status-card-copy">{{ generationError }}</text>
    </view>

    <view class="status-card" v-if="audioPreparing">
      <text class="status-card-title">语音准备中</text>
      <text class="status-card-copy">正在为当前白板内容生成讲解语音，首次进入这一页会稍慢一些。</text>
    </view>

    <view class="status-card" v-else-if="audioError">
      <text class="status-card-title">语音提示</text>
      <text class="status-card-copy">{{ audioError }}</text>
    </view>

    <view class="status-card" v-if="currentSubtitle">
      <text class="status-card-title">当前讲解</text>
      <text class="status-card-copy">{{ currentSubtitle }}</text>
    </view>

    <view class="status-card" v-if="videoError">
      <text class="status-card-title">视频提示</text>
      <text class="status-card-copy">{{ videoError }}</text>
    </view>

    <view class="slide-area">
      <view class="slide-card">
        <view class="slide-header">
          <text class="slide-card-title">{{ currentOutline?.title || '课程知识点' }}</text>
          <text class="scene-type-tag">{{ sceneTypeLabel }}</text>
        </view>

        <view class="bullet-list">
          <view v-for="(item, index) in outlineBullets" :key="`${currentStep}-${index}`" class="bullet-item">
            <text class="bullet-dot">•</text>
            <text class="bullet-text">{{ item }}</text>
          </view>
        </view>
      </view>
    </view>

    <scroll-view
      class="chat-area"
      scroll-y
      scroll-with-animation
      :scroll-into-view="chatScrollIntoView"
      :style="{ height: `${chatHeight}px` }"
    >
      <view
        v-for="(msg, index) in chatMessages"
        :id="`msg-${msgKey(msg, index)}`"
        :key="msgKey(msg, index)"
        class="message-row"
        :class="msg.role"
      >
        <view class="message-avatar" :class="msg.role">
          <text class="avatar-text">{{ roleShortName(msg.role, msg.name) }}</text>
        </view>

        <view class="message-card">
          <text class="message-name">{{ msg.name }}</text>
          <text class="message-content">{{ msg.content }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar" :style="{ paddingBottom: `${safeAreaInsetsBottom + 16}px` }">
      <view class="avatars-row">
        <view class="role-chip teacher"></view>
        <view class="role-chip assistant"></view>
        <view class="role-chip student"></view>
        <view class="role-chip observer"></view>
      </view>

      <view class="input-bar">
        <input
          class="chat-input"
          v-model="chatInput"
          placeholder="输入你的想法..."
          placeholder-class="chat-input-placeholder"
          confirm-type="send"
          @confirm="sendMessage"
        />
        <view class="send-button" :class="{ disabled: sending }" @click="sendMessage">
          <text class="send-icon">➤</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import WhiteboardPlayer from '@/components/WhiteboardPlayer.vue'
import QuizPlayer from '@/components/QuizPlayer.vue'
import {
  getClassroomDetail,
  prepareClassroomSceneAudio,
  scoreClassroomQuiz,
  sendClassroomMessage,
  updateClassroomProgress,
} from '@/services/api'
import { getBaseUrl } from '@/services/request'
import { getLayoutMetrics } from '@/utils/layout'
import { safeNavigateBack } from '@/utils/navigation'

const systemInfo = uni.getSystemInfoSync()
const { safeAreaInsetsBottom, statusBarHeight } = getLayoutMetrics()
const audioContext = uni.createInnerAudioContext()
audioContext.autoplay = false
audioContext.loop = false

const speedOptions = ['1.0', '1.25', '1.5']

const isPlaying = ref(false)
const volumeOn = ref(true)
const playSpeed = ref('1.0')
const chatInput = ref('')
const chatMessages = ref([])
const chatScrollIntoView = ref('')
const classroom = ref(null)
const currentStep = ref(0)
const sending = ref(false)
const videoError = ref('')
const failureNoticeShown = ref(false)
const loadingClassroom = ref(false)
const audioPreparing = ref(false)
const audioError = ref('')
const activeElementId = ref('')
const activeSubtitle = ref('')
const currentSegmentIndex = ref(-1)
const quizShowResult = ref(false)
const quizResults = ref({})
const quizScore = ref(0)
const quizMaxScore = ref(0)
const quizLast = ref(null)
const quizSubmitting = ref(false)
let classroomId = ''
let refreshTimer = null
let refreshAttempts = 0
const MAX_REFRESH_ATTEMPTS = 60

const chatHeight = Math.max(
  systemInfo.windowHeight - statusBarHeight - 620 - safeAreaInsetsBottom,
  220,
)

const currentOutline = computed(() => classroom.value?.outline?.[currentStep.value] || null)
const generationStatus = computed(() => classroom.value?.generation?.status || '')
const generationFailed = computed(() => generationStatus.value === 'failed')
const generationError = computed(() => classroom.value?.generation?.error || '课堂引擎当前不可用，请稍后重试。')
const isGenerating = computed(() => ['queued', 'running'].includes(generationStatus.value))
const currentVideoUrl = computed(() => currentOutline.value?.video?.url || '')
const currentAudioSegments = computed(() => currentOutline.value?.audio?.segments || [])
const sceneHasWhiteboard = computed(() =>
  currentOutline.value?.sceneType === 'slide' && (currentOutline.value?.whiteboard?.elements?.length || 0) > 0,
)
const sceneIsQuiz = computed(() =>
  currentOutline.value?.sceneType === 'quiz' && (currentOutline.value?.questions?.length || 0) > 0,
)
const sceneIsInteractive = computed(() => currentOutline.value?.sceneType === 'interactive')
const quizQuestions = computed(() => currentOutline.value?.questions || [])
const quizLastSummary = computed(() => {
  const ql = quizLast.value
  const sid = currentOutline.value?.id
  if (!ql || !sid) return ''
  if (ql.sceneId !== sid) return ''
  const score = Number(ql.score || 0)
  const maxScore = Number(ql.maxScore || 0)
  const ts = ql.submittedAt ? `，${String(ql.submittedAt).slice(0, 19).replace('T', ' ')}` : ''
  if (!maxScore || maxScore <= 0) return `得分 ${score}${ts}`
  return `得分 ${score}/${maxScore}${ts}`
})
const sceneAudioReady = computed(() =>
  currentAudioSegments.value.length > 0 && currentAudioSegments.value.every((segment) => !!segment.url),
)
const currentSubtitle = computed(() => activeSubtitle.value || '')
const playDisabled = computed(() => {
  if (isGenerating.value) return true
  if (audioPreparing.value) return true
  if (sceneIsQuiz.value) return true
  if (sceneIsInteractive.value) return true
  if (sceneHasWhiteboard.value) return false
  if (currentVideoUrl.value) return false
  return true
})
const playButtonText = computed(() => {
  if (audioPreparing.value) return '准备…'
  return isPlaying.value ? '暂停' : '播放'
})
const sceneTypeLabel = computed(() => {
  const sceneType = currentOutline.value?.sceneType || 'slide'
  if (sceneType === 'interactive') return '互动'
  if (sceneType === 'quiz') return '测验'
  return '白板课'
})
const fallbackMediaTitle = computed(() => {
  if (generationFailed.value) return '课堂已回退到文本模式'
  return currentOutline.value?.sceneType === 'interactive' ? '互动场景待升级' : '课堂内容预览'
})
const fallbackMediaCopy = computed(() => {
  if (generationFailed.value) return generationError.value
  if (currentOutline.value?.sceneType === 'interactive') {
    return '这一类场景后续会升级成原生互动播放器，当前先保留概要内容。'
  }
  if (currentOutline.value?.sceneType === 'quiz') {
    return '当前测验题目暂不可用，先浏览课堂概要内容。'
  }
  return currentOutline.value?.summary || '当前页没有可播放的白板内容。'
})

const outlineBullets = computed(() => {
  const bullets = currentOutline.value?.bullets || []
  if (bullets.length) return bullets

  const summary = currentOutline.value?.summary?.trim()
  if (summary) {
    return [
      summary,
      `围绕“${currentOutline.value.title}”建立完整理解`,
      '结合对话提问，边学边消化',
    ]
  }

  return [
    '拆解核心概念并形成知识结构',
    '结合案例理解每一步的作用',
    '在互动提问里完成巩固',
  ]
})

const roleShortName = (role, name) => {
  if (role === 'teacher') return '师'
  if (role === 'assistant') return '助'
  if (role === 'student') return '生'
  if (role === 'user') return '我'
  return (name || '?').slice(0, 1)
}

const msgKey = (msg, index) => {
  const id = msg?.id
  if (id != null && id !== '') return `id-${id}`
  const role = msg?.role || 'unknown'
  const name = msg?.name || ''
  return `idx-${index}-${role}-${name}`
}

const scrollChatToBottom = async () => {
  await nextTick()
  const lastIndex = (chatMessages.value || []).length - 1
  if (lastIndex < 0) return
  const lastMsg = chatMessages.value[lastIndex]
  chatScrollIntoView.value = `msg-${msgKey(lastMsg, lastIndex)}`
}

const applyClassroom = (nextClassroom) => {
  classroom.value = nextClassroom
  chatMessages.value = nextClassroom?.messages || []
  currentStep.value = nextClassroom?.currentStep || 0
  quizLast.value = nextClassroom?.quizLast || null
  scrollChatToBottom()
}

const resolveMediaUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${getBaseUrl()}${url}`
}

const stopPlayback = ({ clearState = true } = {}) => {
  isPlaying.value = false
  try {
    audioContext.stop()
  } catch (error) {
    // Ignore stale audio stop failures.
  }

  if (clearState) {
    currentSegmentIndex.value = -1
    activeElementId.value = ''
    activeSubtitle.value = ''
  }
}

const updateAudioRuntimeConfig = () => {
  audioContext.volume = volumeOn.value ? 1 : 0
  audioContext.playbackRate = Number(playSpeed.value) || 1
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitAudioCanplay = async ({ timeoutMs = 4000 } = {}) => {
  // Some Android WebView runtimes need a short canplay window after src assignment.
  await Promise.race([
    new Promise((resolve) => {
      try {
        if (typeof audioContext.onCanPlay === 'function') {
          audioContext.onCanPlay(() => resolve(true))
        } else if (typeof audioContext.onCanplay === 'function') {
          audioContext.onCanplay(() => resolve(true))
        } else {
          resolve(false)
        }
      } catch (e) {
        resolve(false)
      }
    }),
    sleep(timeoutMs).then(() => false),
  ])
}

const safeAudioPlay = async ({ retryOnce = true } = {}) => {
  try {
    updateAudioRuntimeConfig()
    audioContext.play()
    return true
  } catch (error) {
    if (!retryOnce) return false
    try {
      audioContext.stop()
    } catch (e) {
      // ignore
    }
    await sleep(180)
    try {
      updateAudioRuntimeConfig()
      audioContext.play()
      return true
    } catch (e) {
      return false
    }
  }
}

const handleVideoError = () => {
  videoError.value = '视频加载失败，请检查网络或稍后重试'
}

const clearRefreshTimer = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

const resetRefreshAttempts = () => {
  refreshAttempts = 0
}

const scheduleRefresh = (id, delay = 3000) => {
  clearRefreshTimer()
  refreshAttempts++
  if (refreshAttempts > MAX_REFRESH_ATTEMPTS) {
    resetRefreshAttempts()
    uni.showToast({ title: '生成超时，请手动刷新', icon: 'none' })
    return
  }
  refreshTimer = setTimeout(() => {
    loadClassroom(id, { silent: true })
  }, delay)
}

const persistCurrentStep = async () => {
  if (!classroomId) return
  try {
    await updateClassroomProgress(classroomId, { currentStep: currentStep.value })
  } catch (error) {
    // Keep navigation responsive even if persistence fails.
  }
}

const playSegmentAt = async (segmentIndex = 0) => {
  const segment = currentAudioSegments.value[segmentIndex]
  if (!segment) {
    stopPlayback()
    return
  }

  if (!segment.url) {
    audioError.value = '当前页语音尚未准备完成，请稍后重试。'
    stopPlayback({ clearState: false })
    return
  }

  currentSegmentIndex.value = segmentIndex
  activeElementId.value = segment.relatedElementId || ''
  activeSubtitle.value = segment.text || ''
  audioError.value = ''
  audioContext.src = resolveMediaUrl(segment.url)
  await waitAudioCanplay()
  const ok = await safeAudioPlay()
  isPlaying.value = ok
  if (!ok) {
    audioError.value = '语音播放失败，请检查网络或稍后重试。'
  }
}

const ensureCurrentSceneAudio = async ({ autoplay = false, silent = false } = {}) => {
  const scene = currentOutline.value
  if (!scene || scene.sceneType !== 'slide' || !(scene.whiteboard?.elements?.length || 0)) {
    return false
  }
  if (sceneAudioReady.value) {
    if (autoplay) await playSegmentAt(0)
    return true
  }
  if (audioPreparing.value) return false

  audioPreparing.value = true
  audioError.value = ''
  try {
    const response = await prepareClassroomSceneAudio(classroomId, scene.id)
    if (response.classroom) {
      applyClassroom(response.classroom)
    }
    if (autoplay && currentOutline.value?.id === scene.id) {
      await playSegmentAt(0)
    }
    return !!(response.scene?.audio?.segments || []).every((segment) => !!segment.url)
  } catch (error) {
    audioError.value = error.message || '语音生成失败，请稍后重试。'
    if (!silent) {
      uni.showToast({ title: audioError.value, icon: 'none' })
    }
    return false
  } finally {
    audioPreparing.value = false
  }
}

const cycleSpeed = () => {
  const currentIndex = speedOptions.indexOf(playSpeed.value)
  playSpeed.value = speedOptions[(currentIndex + 1) % speedOptions.length]
  updateAudioRuntimeConfig()
}

const toggleVolume = () => {
  volumeOn.value = !volumeOn.value
}

const handleQuizSubmit = async ({ answers }) => {
  if (quizSubmitting.value) return
  const sid = currentOutline.value?.id
  if (!classroomId || !sid) {
    uni.showToast({ title: '测验数据不完整', icon: 'none' })
    return
  }
  try {
    quizSubmitting.value = true
    uni.showLoading({ title: '批改中…', mask: true })
    const res = await scoreClassroomQuiz(classroomId, { sceneId: sid, answers })
    quizResults.value = res.results || {}
    quizScore.value = Number(res.score || 0)
    quizMaxScore.value = Number(res.maxScore || 0)
    quizShowResult.value = true
    if (res.saved === false) {
      uni.showToast({ title: '已评分但保存失败，稍后再试', icon: 'none' })
    }
    // Refresh classroom so quizLast is persisted and viewable after restart.
    try {
      await loadClassroom(classroomId, { silent: true })
    } catch (e) {
      // ignore
    }
  } catch (error) {
    uni.showToast({ title: error.message || '评分失败', icon: 'none' })
  } finally {
    uni.hideLoading()
    quizSubmitting.value = false
  }
}

const goBack = () => {
  safeNavigateBack('/pages/school/input')
}

const togglePlay = async () => {
  if (isGenerating.value) {
    uni.showToast({ title: '课堂生成中，稍后可播放', icon: 'none' })
    return
  }
  if (audioPreparing.value) {
    uni.showToast({ title: '语音准备中…', icon: 'none' })
    return
  }

  if (isPlaying.value) {
    audioContext.pause()
    isPlaying.value = false
    return
  }

  if (sceneHasWhiteboard.value) {
    if (!sceneAudioReady.value) {
      const prepared = await ensureCurrentSceneAudio({ autoplay: false })
      if (!prepared) {
        uni.showToast({ title: audioError.value || '语音尚未准备好', icon: 'none' })
        return
      }
    }
    if (!currentAudioSegments.value.length) {
      uni.showToast({ title: '当前页没有讲解语音', icon: 'none' })
      return
    }

    if (currentSegmentIndex.value >= 0 && currentSegmentIndex.value < currentAudioSegments.value.length) {
      const ok = await safeAudioPlay()
      isPlaying.value = ok
      if (!ok) {
        audioError.value = '语音播放失败，请检查网络或稍后重试。'
        uni.showToast({ title: audioError.value, icon: 'none' })
      }
      return
    }
    await playSegmentAt(0)
  } else if (currentVideoUrl.value) {
    uni.showToast({ title: '视频播放请直接操作播放器', icon: 'none' })
  } else if (sceneIsQuiz.value) {
    uni.showToast({ title: '测验场景无需播放', icon: 'none' })
    return
  } else if (sceneIsInteractive.value) {
    uni.showToast({ title: '互动场景暂不支持播放', icon: 'none' })
    return
  } else if (sceneHasWhiteboard.value && currentAudioSegments.value.length === 0) {
    uni.showToast({ title: '当前页没有讲解语音', icon: 'none' })
    return
  } else {
    uni.showToast({ title: '当前页无可播放内容', icon: 'none' })
    return
  }
}

const changeLesson = async (direction) => {
  if (!classroom.value?.outline?.length) return
  const wasPlaying = isPlaying.value
  stopPlayback()
  currentStep.value = Math.min(
    Math.max(currentStep.value + direction, 0),
    classroom.value.outline.length - 1,
  )
  await persistCurrentStep()

  if (currentOutline.value?.sceneType === 'slide') {
    await ensureCurrentSceneAudio({ autoplay: wasPlaying, silent: true })
  }
}

const prevLesson = async () => {
  await changeLesson(-1)
}

const nextLesson = async () => {
  await changeLesson(1)
}

const sendMessage = async () => {
  if (!chatInput.value.trim() || sending.value || !classroomId) return

  const message = chatInput.value.trim()
  chatInput.value = ''
  sending.value = true

  try {
    const response = await sendClassroomMessage(classroomId, {
      message,
      currentStep: currentStep.value,
    })
    chatMessages.value.push(...(response.messages || []))
    if (typeof response.currentStep === 'number') {
      currentStep.value = response.currentStep
    }
    scrollChatToBottom()
  } catch (error) {
    uni.showToast({ title: error.message, icon: 'none' })
    chatInput.value = message
  } finally {
    sending.value = false
  }
}

const loadClassroom = async (id, { silent = false } = {}) => {
  if (!id || loadingClassroom.value) return
  loadingClassroom.value = true
  try {
    const response = await getClassroomDetail(id)
    applyClassroom(response.classroom)

    if (response.classroom?.source === 'openmaic' && ['queued', 'running'].includes(response.classroom?.generation?.status)) {
      scheduleRefresh(id)
    } else {
      clearRefreshTimer()
      resetRefreshAttempts()
    }

    if (response.classroom?.generation?.status === 'failed' && !failureNoticeShown.value) {
      failureNoticeShown.value = true
      uni.showToast({ title: '课堂生成失败，已切换文本模式', icon: 'none' })
    }

    if (currentOutline.value?.sceneType === 'slide') {
      ensureCurrentSceneAudio({ silent: true })
    }
  } catch (error) {
    if (!silent) {
      uni.showToast({ title: error.message, icon: 'none' })
    }
    if (classroom.value?.source === 'openmaic' && isGenerating.value) {
      scheduleRefresh(id, 5000)
    }
  } finally {
    loadingClassroom.value = false
  }
}

watch(volumeOn, () => {
  updateAudioRuntimeConfig()
})

watch(playSpeed, () => {
  updateAudioRuntimeConfig()
})

watch(
  () => currentOutline.value?.id,
  (nextId, prevId) => {
    if (!nextId || nextId === prevId) return
    stopPlayback()
    quizShowResult.value = false
    quizResults.value = {}
    quizScore.value = 0
    quizMaxScore.value = 0
    if (currentOutline.value?.sceneType === 'slide') {
      ensureCurrentSceneAudio({ silent: true })
    }
  },
)

audioContext.onEnded(() => {
  if (!isPlaying.value) return
  playSegmentAt(currentSegmentIndex.value + 1)
})

audioContext.onError((error) => {
  isPlaying.value = false
  audioError.value = error?.errMsg || '语音播放失败，请稍后重试。'
})

onLoad((query) => {
  if (!query.id) {
    uni.showToast({ title: '缺少课堂 ID', icon: 'none' })
    safeNavigateBack('/pages/school/input')
    return
  }
  classroomId = query.id
  loadClassroom(query.id)
})

onShow(() => {
  if (classroomId) {
    loadClassroom(classroomId, { silent: true })
  }
})

onHide(() => {
  // Stop polling when page is hidden (avoid request storms in background).
  clearRefreshTimer()
})

onUnmounted(() => {
  clearRefreshTimer()
  resetRefreshAttempts()
  stopPlayback()
  audioContext.destroy()
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';

.classroom-page {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
}

.top-safe {
  padding-left: 24rpx;
  padding-right: 24rpx;
}

.page-header {
  padding: 12rpx 24rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  color: $text-white;
  font-size: 30rpx;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
}

.header-icon {
  width: 44rpx;
  text-align: center;
  color: $text-white;
  font-size: 32rpx;
}

.control-bar {
  padding: 18rpx 24rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
}

.control-label {
  color: #a1a1aa;
  font-size: 24rpx;
  font-weight: 600;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  background: #18181b;
  border: 2rpx solid #27272a;
}

.media-area {
  padding: 14rpx 24rpx 0;
}

.quiz-area {
  max-height: 580rpx;
}

.scene-card,
.lesson-video,
.video-placeholder {
  width: 100%;
  border-radius: 24rpx;
  overflow: hidden;
}

.lesson-video,
.video-placeholder {
  height: 360rpx;
}

.lesson-video {
  background: #0b0b0d;
  border: 2rpx solid #27272a;
}

.scene-card {
  padding: 18rpx;
  background: #18181b;
  border: 2rpx solid rgba(124, 58, 237, 0.22);
}

.video-placeholder {
  background: #18181b;
  border: 2rpx dashed rgba(124, 58, 237, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 0 24rpx;
}

.video-placeholder.failed {
  border-style: solid;
  border-color: rgba(239, 68, 68, 0.45);
}

.video-placeholder-title {
  color: $text-white;
  font-size: 30rpx;
  font-weight: 700;
}

.video-placeholder-copy {
  color: #a1a1aa;
  font-size: 24rpx;
  text-align: center;
  line-height: 1.6;
}

.generation-orbit {
  position: relative;
  width: 140rpx;
  height: 140rpx;
  margin-bottom: 8rpx;
}

.orbit-ring,
.orbit-ring-inner {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2rpx solid rgba(124, 58, 237, 0.28);
  animation: pulseRing 1.8s ease-in-out infinite;
}

.orbit-ring-inner {
  inset: 18rpx;
  border-color: rgba(34, 211, 238, 0.38);
  animation-duration: 1.3s;
}

.orbit-core {
  position: absolute;
  inset: 44rpx;
  border-radius: 50%;
  background: radial-gradient(circle, #22d3ee 0%, #7c3aed 72%);
  box-shadow: 0 0 24rpx rgba(124, 58, 237, 0.35);
  animation: coreGlow 1.6s ease-in-out infinite;
}

.orbit-dot {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #c4b5fd;
  top: 62rpx;
  left: 62rpx;
}

.orbit-dot-a { animation: orbitA 2.2s linear infinite; }
.orbit-dot-b { animation: orbitB 1.6s linear infinite; background: #22d3ee; }
.orbit-dot-c { animation: orbitC 2.8s linear infinite; background: #f9a8d4; }

.status-card {
  margin: 14rpx 24rpx 0;
  border-radius: 24rpx;
  background: #18181b;
  border: 2rpx solid #27272a;
  padding: 20rpx 22rpx;
}

.status-card.failed {
  border-color: rgba(245, 158, 11, 0.35);
}

.status-card-title {
  display: block;
  color: $text-white;
  font-size: 26rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.status-card-copy {
  color: #a1a1aa;
  font-size: 24rpx;
  line-height: 1.6;
}

.slide-area {
  padding: 14rpx 24rpx 0;
}

.slide-card {
  border-radius: 24rpx;
  padding: 24rpx;
  background: #18181b;
  border: 2rpx solid #27272a;
}

.slide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 18rpx;
}

.slide-card-title {
  flex: 1;
  color: $text-white;
  font-size: 30rpx;
  font-weight: 700;
}

.scene-type-tag {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.18);
  color: #ddd6fe;
  font-size: 22rpx;
  font-weight: 600;
}

.bullet-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.bullet-item {
  display: flex;
  gap: 14rpx;
  align-items: flex-start;
}

.bullet-dot {
  color: $accent-cyan;
  font-size: 26rpx;
  line-height: 1.4;
}

.bullet-text {
  flex: 1;
  color: #e4e4e7;
  font-size: 26rpx;
  line-height: 1.7;
}

.chat-area {
  margin-top: 14rpx;
  padding: 0 24rpx;
}

.message-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 18rpx;
}

.message-row.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #27272a;
  flex-shrink: 0;
}

.message-avatar.teacher { background: rgba(139, 92, 246, 0.24); }
.message-avatar.assistant { background: rgba(34, 211, 238, 0.24); }
.message-avatar.student { background: rgba(249, 168, 212, 0.24); }
.message-avatar.user { background: rgba(245, 158, 11, 0.24); }

.avatar-text {
  color: $text-white;
  font-size: 26rpx;
  font-weight: 700;
}

.message-card {
  max-width: 78%;
  border-radius: 22rpx;
  background: #18181b;
  border: 2rpx solid #27272a;
  padding: 18rpx 20rpx;
}

.message-row.user .message-card {
  background: rgba(139, 92, 246, 0.16);
}

.message-name {
  display: block;
  color: #a1a1aa;
  font-size: 22rpx;
  margin-bottom: 8rpx;
}

.message-content {
  color: #f4f4f5;
  font-size: 26rpx;
  line-height: 1.65;
}

.bottom-bar {
  margin-top: auto;
  padding: 10rpx 24rpx 0;
  background: linear-gradient(180deg, rgba(10, 10, 10, 0) 0%, rgba(10, 10, 10, 0.94) 28%, #0a0a0a 100%);
}

.avatars-row {
  display: flex;
  gap: 10rpx;
  padding-bottom: 14rpx;
}

.role-chip {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
}

.role-chip.teacher { background: $accent-purple; }
.role-chip.assistant { background: $accent-cyan; }
.role-chip.student { background: $accent-pink; }
.role-chip.observer { background: $accent-orange; }

.input-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  border-radius: 999px;
  padding: 14rpx 16rpx 14rpx 24rpx;
  background: #18181b;
  border: 2rpx solid #27272a;
}

.chat-input {
  flex: 1;
  color: $text-white;
  font-size: 26rpx;
}

.chat-input-placeholder {
  color: #71717a;
}

.send-button {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #22d3ee);
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button.disabled {
  opacity: 0.45;
  pointer-events: none;
}

.send-icon,
.play-icon {
  color: $text-white;
  font-size: 28rpx;
  font-weight: 700;
}

.play-button {
  width: 82rpx;
  height: 82rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 36rpx rgba(124, 58, 237, 0.32);
}

.play-button.disabled {
  opacity: 0.45;
  pointer-events: none;
}

.speed-pill {
  min-width: 92rpx;
  padding: 10rpx 18rpx;
  border-radius: 999px;
  background: #18181b;
  border: 2rpx solid #27272a;
  text-align: center;
}

.speed-text {
  color: $text-white;
  font-size: 22rpx;
  font-weight: 600;
}

@keyframes pulseRing {
  0%, 100% { transform: scale(0.96); opacity: 0.45; }
  50% { transform: scale(1.03); opacity: 1; }
}

@keyframes coreGlow {
  0%, 100% { transform: scale(0.92); opacity: 0.86; }
  50% { transform: scale(1.08); opacity: 1; }
}

@keyframes orbitA {
  from { transform: rotate(0deg) translateX(56rpx) rotate(0deg); }
  to { transform: rotate(360deg) translateX(56rpx) rotate(-360deg); }
}

@keyframes orbitB {
  from { transform: rotate(120deg) translateX(38rpx) rotate(-120deg); }
  to { transform: rotate(480deg) translateX(38rpx) rotate(-480deg); }
}

@keyframes orbitC {
  from { transform: rotate(240deg) translateX(56rpx) rotate(-240deg); }
  to { transform: rotate(600deg) translateX(56rpx) rotate(-600deg); }
}
</style>
