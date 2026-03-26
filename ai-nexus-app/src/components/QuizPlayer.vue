<template>
  <scroll-view class="quiz-player" scroll-y>
    <view class="quiz-inner">

      <!-- ====== Score Panel (result mode) ====== -->
      <view v-if="showResult" class="score-panel">
        <view class="score-row">
          <view class="score-info">
            <text class="score-title">测验得分</text>
            <text class="score-detail">共 {{ questions.length }} 题 · 满分 {{ maxScore }} 分</text>
          </view>
          <text class="score-value">{{ totalScore }}</text>
        </view>
        <view class="score-track">
          <view
            class="score-fill"
            :style="{ width: progressPercent + '%' }"
          />
        </view>
      </view>

      <!-- ====== Question Cards ====== -->
      <view
        v-for="(q, idx) in questions"
        :key="q.id"
        class="q-card"
      >
        <!-- header -->
        <view class="q-header">
          <view class="q-header-left">
            <text class="q-num">{{ idx + 1 }}</text>
            <view class="q-badge" :class="`badge-${q.type}`">
              <text class="q-badge-text">{{ typeLabel(q.type) }}</text>
            </view>
          </view>
          <text v-if="q.points" class="q-pts">{{ q.points }} 分</text>
        </view>

        <!-- question body -->
        <text class="q-body">{{ q.question }}</text>

        <!-- options (single / multiple) -->
        <view v-if="q.type !== 'short_answer'" class="opt-list">
          <view
            v-for="opt in q.options"
            :key="opt.value"
            class="opt-item"
            :class="optionClasses(q, opt)"
            @tap="tapOption(q, opt)"
          >
            <view
              class="opt-indicator"
              :class="q.type === 'single' ? 'is-radio' : 'is-checkbox'"
            >
              <view v-if="isChosen(q.id, opt.value)" class="indicator-fill" />
            </view>
            <text class="opt-text">{{ opt.value }}. {{ opt.label }}</text>
            <text
              v-if="showResult && isCorrectAnswer(q.id, opt.value)"
              class="result-icon icon-correct"
            >✓</text>
            <text
              v-if="showResult && isWrongPick(q.id, opt.value)"
              class="result-icon icon-wrong"
            >✗</text>
          </view>
        </view>

        <!-- short answer -->
        <view v-if="q.type === 'short_answer'" class="sa-area">
          <textarea
            class="sa-input"
            :class="{ 'sa-locked': showResult }"
            :value="textOf(q.id)"
            placeholder="请输入你的答案…"
            placeholder-style="color:#64748b;font-size:26rpx"
            :disabled="showResult"
            auto-height
            @input="onTextInput($event, q.id)"
          />
          <view v-if="showResult && correctAnswers[q.id]" class="sa-ref">
            <text class="sa-ref-label">参考答案</text>
            <text class="sa-ref-content">{{ (correctAnswers[q.id] || []).join('') }}</text>
          </view>
        </view>

        <!-- analysis (result mode) -->
        <view v-if="showResult && q.analysis" class="q-analysis">
          <view class="analysis-divider" />
          <view class="analysis-head">
            <text class="analysis-tag">解析</text>
          </view>
          <text class="analysis-text">{{ q.analysis }}</text>
        </view>
      </view>

      <!-- ====== Footer ====== -->
      <view class="quiz-foot">
        <view
          class="submit-btn"
          :class="{ 'is-result': showResult }"
          @tap="handleSubmit"
        >
          <text class="submit-btn-text">{{ showResult ? '完成测验' : '提交答案' }}</text>
        </view>
        <text v-if="!showResult" class="foot-hint">
          已答 {{ answeredCount }} / {{ questions.length }} 题
        </text>
      </view>

    </view>
  </scroll-view>
</template>

<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    required: true
  },
  showResult: {
    type: Boolean,
    default: false
  },
  correctAnswers: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'complete'])

// ── State ──────────────────────────────────────────
const userAnswers = reactive({}) // { questionId: ["A"] | ["B","C"] | ["text"] }

// ── Helpers ────────────────────────────────────────
const TYPE_LABELS = { single: '单选', multiple: '多选', short_answer: '简答' }
const typeLabel = (type) => TYPE_LABELS[type] || type

const isChosen = (qId, value) => (userAnswers[qId] || []).includes(value)
const textOf = (qId) => (userAnswers[qId] || [''])[0] || ''

const isCorrectAnswer = (qId, value) =>
  (props.correctAnswers[qId] || []).includes(value)

const isWrongPick = (qId, value) =>
  isChosen(qId, value) && !isCorrectAnswer(qId, value)

const optionClasses = (q, opt) => {
  const chosen = isChosen(q.id, opt.value)
  if (!props.showResult) return { selected: chosen }
  const correct = isCorrectAnswer(q.id, opt.value)
  return {
    selected: chosen,
    'res-correct': chosen && correct,
    'res-wrong': chosen && !correct,
    'res-missed': !chosen && correct
  }
}

// ── Computed ───────────────────────────────────────
const maxScore = computed(() =>
  props.questions.reduce((s, q) => s + (q.points || 0), 0)
)

const totalScore = computed(() => {
  if (!props.showResult) return 0
  return props.questions.reduce((sum, q) => {
    const ca = props.correctAnswers[q.id] || []
    const ua = userAnswers[q.id] || []
    if (q.type === 'short_answer') {
      return sum + (ca[0] && ua[0] === ca[0] ? (q.points || 0) : 0)
    }
    if (!ca.length) return sum
    const match = ca.length === ua.length && ca.every(v => ua.includes(v))
    return sum + (match ? (q.points || 0) : 0)
  }, 0)
})

const progressPercent = computed(() =>
  maxScore.value ? Math.round((totalScore.value / maxScore.value) * 100) : 0
)

const answeredCount = computed(() =>
  Object.keys(userAnswers).filter(k => {
    const v = userAnswers[k]
    return v && v.length > 0 && (typeof v[0] !== 'string' || v[0].trim() !== '')
  }).length
)

// ── Interactions ───────────────────────────────────
const tapOption = (q, opt) => {
  if (props.showResult) return
  if (q.type === 'single') {
    userAnswers[q.id] = [opt.value]
  } else if (q.type === 'multiple') {
    const arr = userAnswers[q.id] || []
    userAnswers[q.id] = arr.includes(opt.value)
      ? arr.filter(v => v !== opt.value)
      : [...arr, opt.value]
  }
}

const onTextInput = (e, qId) => {
  userAnswers[qId] = [e.detail.value]
}

const handleSubmit = () => {
  if (props.showResult) {
    emit('complete')
    return
  }
  const answers = {}
  props.questions.forEach(q => {
    answers[q.id] = userAnswers[q.id] || []
  })
  emit('submit', { answers, score: null })
}
</script>

<style lang="scss" scoped>
.quiz-player {
  width: 100%;
  height: 100%;
}

.quiz-inner {
  padding: 24rpx;
  padding-bottom: 60rpx;
}

/* ── Score Panel ───────────────────────────────── */
.score-panel {
  background: #18181b;
  border: 2rpx solid #7c3aed;
  border-radius: 24rpx;
  padding: 28rpx 32rpx 24rpx;
  margin-bottom: 32rpx;
}

.score-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.score-info {
  display: flex;
  flex-direction: column;
}

.score-title {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 600;
}

.score-detail {
  font-size: 22rpx;
  color: #94a3b8;
  margin-top: 6rpx;
}

.score-value {
  font-size: 60rpx;
  font-weight: 700;
  color: #7c3aed;
  line-height: 1;
}

.score-track {
  height: 8rpx;
  background: #27272a;
  border-radius: 999rpx;
  margin-top: 22rpx;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #7c3aed, #22d3ee);
  transition: width 500ms ease;
}

/* ── Question Card ─────────────────────────────── */
.q-card {
  background: #18181b;
  border: 2rpx solid #27272a;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.q-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.q-header-left {
  display: flex;
  align-items: center;
}

.q-num {
  font-size: 34rpx;
  font-weight: 700;
  color: #ffffff;
  margin-right: 16rpx;
}

.q-badge {
  padding: 4rpx 18rpx;
  border-radius: 999rpx;

  &.badge-single {
    background: rgba(124, 58, 237, 0.15);

    .q-badge-text {
      color: #a78bfa;
    }
  }

  &.badge-multiple {
    background: rgba(34, 211, 238, 0.15);

    .q-badge-text {
      color: #22d3ee;
    }
  }

  &.badge-short_answer {
    background: rgba(245, 158, 11, 0.15);

    .q-badge-text {
      color: #f59e0b;
    }
  }
}

.q-badge-text {
  font-size: 22rpx;
  font-weight: 500;
}

.q-pts {
  font-size: 22rpx;
  color: #94a3b8;
}

.q-body {
  font-size: 28rpx;
  color: #e2e8f0;
  line-height: 1.65;
  margin-bottom: 24rpx;
  word-break: break-word;
}

/* ── Options ───────────────────────────────────── */
.opt-list {
  display: flex;
  flex-direction: column;
}

.opt-item {
  display: flex;
  align-items: center;
  padding: 22rpx 24rpx;
  border: 2rpx solid #27272a;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  transition: border-color 200ms ease, background-color 200ms ease;

  &:last-child {
    margin-bottom: 0;
  }

  &.selected {
    border-color: #7c3aed;
    background: rgba(124, 58, 237, 0.08);

    .opt-indicator {
      border-color: #7c3aed;
    }
  }

  &.res-correct {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.1);

    .opt-indicator {
      border-color: #22c55e;
    }

    .indicator-fill {
      background: #22c55e;
    }
  }

  &.res-wrong {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);

    .opt-indicator {
      border-color: #ef4444;
    }

    .indicator-fill {
      background: #ef4444;
    }
  }

  &.res-missed {
    border-color: #22c55e;
    border-left-width: 6rpx;
  }
}

.opt-indicator {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #64748b;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 200ms ease;

  &.is-radio {
    border-radius: 999rpx;

    .indicator-fill {
      width: 18rpx;
      height: 18rpx;
      border-radius: 999rpx;
      background: #7c3aed;
    }
  }

  &.is-checkbox {
    border-radius: 8rpx;

    .indicator-fill {
      width: 20rpx;
      height: 20rpx;
      border-radius: 4rpx;
      background: #7c3aed;
    }
  }
}

.opt-text {
  flex: 1;
  font-size: 26rpx;
  color: #e2e8f0;
  line-height: 1.5;
}

.result-icon {
  font-size: 28rpx;
  font-weight: 700;
  margin-left: 12rpx;

  &.icon-correct {
    color: #22c55e;
  }

  &.icon-wrong {
    color: #ef4444;
  }
}

/* ── Short Answer ──────────────────────────────── */
.sa-area {
  display: flex;
  flex-direction: column;
}

.sa-input {
  width: 100%;
  min-height: 160rpx;
  background: #0a0a0a;
  border: 2rpx solid #27272a;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  font-size: 26rpx;
  color: #e2e8f0;
  line-height: 1.6;
  box-sizing: border-box;

  &.sa-locked {
    opacity: 0.7;
    color: #94a3b8;
  }
}

.sa-ref {
  margin-top: 16rpx;
  padding: 16rpx 20rpx;
  background: rgba(34, 197, 94, 0.08);
  border: 2rpx solid rgba(34, 197, 94, 0.2);
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
}

.sa-ref-label {
  font-size: 22rpx;
  color: #22c55e;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.sa-ref-content {
  font-size: 26rpx;
  color: #e2e8f0;
  line-height: 1.5;
}

/* ── Analysis ──────────────────────────────────── */
.q-analysis {
  margin-top: 20rpx;
}

.analysis-divider {
  height: 2rpx;
  background: #27272a;
  margin-bottom: 20rpx;
}

.analysis-head {
  margin-bottom: 12rpx;
}

.analysis-tag {
  font-size: 22rpx;
  color: #22d3ee;
  font-weight: 600;
  padding: 4rpx 16rpx;
  background: rgba(34, 211, 238, 0.12);
  border-radius: 999rpx;
}

.analysis-text {
  font-size: 26rpx;
  color: #94a3b8;
  line-height: 1.7;
  word-break: break-word;
}

/* ── Footer ────────────────────────────────────── */
.quiz-foot {
  margin-top: 16rpx;
  padding-bottom: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);

  &.is-result {
    background: linear-gradient(135deg, #22d3ee, #0891b2);
  }
}

.submit-btn-text {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.foot-hint {
  font-size: 22rpx;
  color: #64748b;
  margin-top: 16rpx;
}
</style>
