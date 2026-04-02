<template>
  <view class="auth-page">
    <view class="auth-bg">
      <view class="glow glow-primary"></view>
      <view class="glow glow-secondary"></view>
    </view>

    <view class="auth-shell" :style="{ paddingTop: `${statusBarHeight + 16}px`, paddingBottom: `${safeAreaInsetsBottom + 24}px` }">
      <view v-if="showBack" class="top-action" @click="goBack">
        <text class="top-action-icon">‹</text>
      </view>

      <view class="brand-block">
        <text class="brand-title">灵境</text>
        <text class="brand-subtitle">AI 教育工作台</text>
        <text class="brand-caption">{{ modeCaption }}</text>
      </view>

      <view class="form-block">
        <view class="mode-pill">
          <text class="mode-pill-text">{{ mode === 'login' ? '账号登录' : '创建新账号' }}</text>
        </view>

        <input
          class="auth-input"
          v-model="form.username"
          maxlength="24"
          :placeholder="mode === 'login' ? '输入灵境号' : '设置灵境号'"
          placeholder-class="auth-placeholder"
        />

        <input
          v-if="mode === 'register'"
          class="auth-input"
          v-model="form.displayName"
          maxlength="24"
          placeholder="输入显示名称（选填）"
          placeholder-class="auth-placeholder"
        />

        <input
          class="auth-input"
          v-model="form.password"
          password
          maxlength="32"
          :placeholder="mode === 'login' ? '输入灵境密码' : '设置灵境密码'"
          placeholder-class="auth-placeholder"
        />

        <view class="submit-button" :class="{ disabled: submitting }" @click="handleSubmit">
          <text class="submit-button-text">{{ submitting ? '提交中...' : submitLabel }}</text>
        </view>

        <view class="mode-switch-row">
          <text class="mode-switch-copy">{{ mode === 'login' ? '还没有账号？' : '已经有账号？' }}</text>
          <text class="mode-switch-action" @click="toggleMode">{{ toggleLabel }}</text>
        </view>

        <view class="agreement-row" @click="toggleAgreement">
          <view class="agreement-checkbox" :class="{ checked: agreementChecked }"></view>
          <text class="agreement-text">已阅读并同意服务协议和灵境隐私保护指引</text>
        </view>

        <text class="helper-text">{{ providerCopy }}</text>
      </view>

      <view class="bottom-actions">
        <view class="action-item" @click="toggleMode">
          <view class="action-circle">
            <text class="action-circle-text">{{ mode === 'login' ? '+' : '↺' }}</text>
          </view>
          <text class="action-label">{{ toggleLabel }}</text>
        </view>

        <view class="action-item" @click="openMoreActions">
          <view class="action-circle">
            <text class="action-circle-text">···</text>
          </view>
          <text class="action-label">更多</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onBackPress, onLoad, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { getLayoutMetrics } from '@/utils/layout'
import { safeNavigateBack } from '@/utils/navigation'
import { setProfilePendingToast } from '@/utils/profile'

const HOME_ROUTE = '/pages/home/index'
const PROFILE_ROUTE = '/pages/profile/index'

const { statusBarHeight, safeAreaInsetsBottom } = getLayoutMetrics()

const userStore = useUserStore()
const mode = ref('login')
const submitting = ref(false)
const agreementChecked = ref(uni.getStorageSync('authAgreementAccepted') === '1')
const redirectUrl = ref(HOME_ROUTE)
const showBack = ref(false)
const lastBackPressAt = ref(0)
const form = ref({
  username: '',
  password: '',
  displayName: '',
})

const rememberedAccount = computed(() => String(uni.getStorageSync('lastLoginUsername') || '').trim())
const providerCopy = computed(() => {
  if (rememberedAccount.value && mode.value === 'login') {
    return `已识别上次登录账号：${rememberedAccount.value}`
  }
  return mode.value === 'login' ? '使用公司账号体系登录后进入应用。' : '注册完成后会自动登录并进入应用。'
})
const modeCaption = computed(() => (mode.value === 'login' ? '进入你的 AI 工作空间' : '注册后即可同步个人身份'))
const submitLabel = computed(() => (mode.value === 'login' ? '登录' : '完成注册'))
const toggleLabel = computed(() => (mode.value === 'login' ? '新用户注册' : '返回登录'))

const ensureAgreed = () => {
  if (agreementChecked.value) return true
  uni.showToast({ title: '请先勾选协议', icon: 'none' })
  return false
}

const redirectToTarget = () => {
  uni.reLaunch({ url: redirectUrl.value || HOME_ROUTE })
}

const tryAutoEnter = () => {
  if (userStore.isAuthenticated) {
    redirectToTarget()
  }
}

const hydrateLoginUsername = () => {
  if (mode.value === 'login' && !form.value.username && rememberedAccount.value) {
    form.value.username = rememberedAccount.value
  }
}

const toggleMode = () => {
  if (submitting.value) return
  mode.value = mode.value === 'login' ? 'register' : 'login'
  hydrateLoginUsername()
}

const toggleAgreement = () => {
  agreementChecked.value = !agreementChecked.value
  uni.setStorageSync('authAgreementAccepted', agreementChecked.value ? '1' : '0')
}

const goBack = () => {
  safeNavigateBack(redirectUrl.value || PROFILE_ROUTE)
}

const validateForm = () => {
  const username = form.value.username.trim()
  const password = form.value.password.trim()
  const displayName = form.value.displayName.trim()

  if (!username) {
    throw new Error('请输入用户名')
  }
  if (!password) {
    throw new Error('请输入密码')
  }
  if (mode.value === 'register' && password.length < 6) {
    throw new Error('注册密码至少需要 6 位')
  }

  return {
    username,
    password,
    display_name: displayName || username,
  }
}

const handleSubmit = async () => {
  if (submitting.value) return
  if (!ensureAgreed()) return

  try {
    const payload = validateForm()
    submitting.value = true

    if (mode.value === 'login') {
      await userStore.login({
        username: payload.username,
        password: payload.password,
      })
      setProfilePendingToast('登录成功')
    } else {
      await userStore.register(payload)
      setProfilePendingToast('注册并登录成功')
    }

    uni.setStorageSync('lastLoginUsername', payload.username)
    redirectToTarget()
  } catch (error) {
    uni.showToast({ title: error.message || '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

const openMoreActions = () => {
  const itemList =
    mode.value === 'login'
      ? ['切换到注册', '填入上次账号', '清空输入']
      : ['切换到登录', '清空输入']

  uni.showActionSheet({
    itemList,
    success: ({ tapIndex }) => {
      if (mode.value === 'login') {
        if (tapIndex === 0) {
          toggleMode()
          return
        }
        if (tapIndex === 1) {
          form.value.username = rememberedAccount.value
          return
        }
        if (tapIndex === 2) {
          form.value.username = ''
          form.value.password = ''
          return
        }
      } else {
        if (tapIndex === 0) {
          toggleMode()
          return
        }
        if (tapIndex === 1) {
          form.value.username = ''
          form.value.password = ''
          form.value.displayName = ''
        }
      }
    },
  })
}

onLoad((options = {}) => {
  mode.value = options.mode === 'register' ? 'register' : 'login'

  if (options.redirect) {
    try {
      redirectUrl.value = decodeURIComponent(options.redirect)
    } catch (error) {
      redirectUrl.value = PROFILE_ROUTE
    }
    showBack.value = true
  } else {
    redirectUrl.value = HOME_ROUTE
    showBack.value = false
  }

  hydrateLoginUsername()
})

onShow(() => {
  tryAutoEnter()
})

onBackPress((options = {}) => {
  if (options.from === 'navigateBack') {
    return false
  }

  if (showBack.value) {
    goBack()
    return true
  }

  if (mode.value === 'register') {
    mode.value = 'login'
    hydrateLoginUsername()
    return true
  }

  const now = Date.now()
  if (now - lastBackPressAt.value < 1500) {
    // #ifdef APP-PLUS
    plus.runtime.quit()
    // #endif
    return true
  }

  lastBackPressAt.value = now
  uni.showToast({ title: '再按一次退出应用', icon: 'none' })
  return true
})
</script>

<style lang="scss" scoped>
@import '../../theme.scss';

.auth-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: #08080b;
}

.auth-bg {
  position: absolute;
  inset: 0;
  background: #08080b;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(36rpx);
}

.glow-primary {
  width: 560rpx;
  height: 560rpx;
  left: 90rpx;
  top: 150rpx;
  background: radial-gradient(circle, rgba(193, 59, 255, 0.28) 0%, rgba(108, 43, 255, 0.18) 48%, rgba(8, 8, 11, 0) 74%);
}

.glow-secondary {
  width: 420rpx;
  height: 420rpx;
  right: -40rpx;
  top: 180rpx;
  background: radial-gradient(circle, rgba(74, 30, 255, 0.2) 0%, rgba(14, 19, 48, 0) 72%);
}

.auth-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding-left: 48rpx;
  padding-right: 48rpx;
  display: flex;
  flex-direction: column;
}

.top-action {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48rpx;
}

.top-action-icon {
  color: #f5f5f7;
  font-size: 52rpx;
  line-height: 1;
}

.brand-block {
  padding-top: 80rpx;
  align-items: center;
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 84rpx;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 4rpx;
  background: linear-gradient(180deg, #49d6ff 0%, #bb7cff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-subtitle {
  margin-top: 18rpx;
  color: rgba(245, 245, 247, 0.76);
  font-size: 26rpx;
  letter-spacing: 4rpx;
}

.brand-caption {
  margin-top: 12rpx;
  color: rgba(207, 207, 224, 0.68);
  font-size: 24rpx;
}

.form-block {
  margin-top: 138rpx;
}

.mode-pill {
  margin: 0 auto 26rpx;
  width: fit-content;
  padding: 0 24rpx;
  min-height: 48rpx;
  border-radius: 999rpx;
  background: rgba(38, 38, 43, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-pill-text {
  color: rgba(207, 207, 224, 0.82);
  font-size: 22rpx;
  font-weight: 600;
}

.auth-input {
  width: 100%;
  height: 82rpx;
  border-radius: 24rpx;
  background: rgba(38, 38, 43, 0.94);
  color: #f5f5f7;
  font-size: 28rpx;
  padding: 0 28rpx;
  box-sizing: border-box;
}

.auth-input + .auth-input {
  margin-top: 24rpx;
}

.auth-placeholder {
  color: #76767e;
  font-size: 26rpx;
}

.submit-button {
  margin-top: 34rpx;
  width: 100%;
  height: 72rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, #0b72c9 0%, #0958a3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 22rpx 44rpx rgba(11, 114, 201, 0.18);
}

.submit-button.disabled {
  opacity: 0.56;
}

.submit-button-text {
  color: #d3dfec;
  font-size: 32rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.mode-switch-row {
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.mode-switch-copy {
  color: rgba(207, 207, 224, 0.72);
  font-size: 24rpx;
}

.mode-switch-action {
  color: #49d6ff;
  font-size: 24rpx;
  font-weight: 700;
}

.agreement-row {
  margin-top: 24rpx;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.agreement-checkbox {
  width: 20rpx;
  height: 20rpx;
  min-width: 20rpx;
  margin-top: 6rpx;
  border-radius: 50%;
  border: 2rpx solid #4a4a55;
}

.agreement-checkbox.checked {
  background: #0b72c9;
  border-color: #0b72c9;
}

.agreement-text {
  color: #cfcfe0;
  font-size: 22rpx;
  line-height: 1.5;
}

.helper-text {
  display: block;
  margin-top: 20rpx;
  color: rgba(207, 207, 224, 0.6);
  font-size: 22rpx;
  text-align: center;
}

.bottom-actions {
  margin-top: auto;
  padding-top: 52rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 76rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.action-circle {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 2rpx solid #2a2a33;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 10, 13, 0.48);
}

.action-circle-text {
  color: #f2f2f5;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1;
}

.action-label {
  color: #f2f2f5;
  font-size: 20rpx;
  font-weight: 500;
}
</style>
