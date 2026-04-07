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

const shouldShowBackForRoute = (route) => {
  const normalized = String(route || '').trim()
  if (!normalized) return false
  return normalized !== HOME_ROUTE
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
    showBack.value = shouldShowBackForRoute(redirectUrl.value)
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
  background:
    radial-gradient(circle at top right, rgba(255, 226, 178, 0.42), transparent 34%),
    radial-gradient(circle at 18% 18%, rgba(214, 148, 78, 0.18), transparent 28%),
    linear-gradient(180deg, #fff9f1 0%, #f6eee2 46%, #efe6da 100%);
}

.auth-bg {
  position: absolute;
  inset: 0;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(24rpx);
}

.glow-primary {
  width: 560rpx;
  height: 560rpx;
  left: 70rpx;
  top: 110rpx;
  background: radial-gradient(circle, rgba(255, 216, 162, 0.54) 0%, rgba(223, 170, 110, 0.22) 48%, rgba(255, 249, 241, 0) 74%);
}

.glow-secondary {
  width: 420rpx;
  height: 420rpx;
  right: -36rpx;
  top: 150rpx;
  background: radial-gradient(circle, rgba(203, 135, 67, 0.22) 0%, rgba(255, 249, 241, 0) 72%);
}

.auth-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding-left: 40rpx;
  padding-right: 40rpx;
  display: flex;
  flex-direction: column;
}

.top-action {
  width: 64rpx;
  height: 64rpx;
  border-radius: 999rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.66);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 12rpx 26rpx rgba(67, 43, 16, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.top-action-icon {
  color: #5a3f2d;
  font-size: 36rpx;
  line-height: 1;
  font-weight: 800;
}

.brand-block {
  padding-top: 66rpx;
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.brand-title {
  font-size: 88rpx;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 6rpx;
  color: #18110d;
  text-shadow: 0 8rpx 22rpx rgba(88, 43, 6, 0.08);
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', Georgia, serif;
}

.brand-subtitle {
  margin-top: 18rpx;
  color: #8e7157;
  font-size: 26rpx;
  letter-spacing: 4rpx;
  font-weight: 700;
}

.brand-caption {
  margin-top: 14rpx;
  color: #775f4c;
  font-size: 24rpx;
  line-height: 1.6;
}

.form-block {
  margin-top: 92rpx;
  padding: 34rpx 28rpx 30rpx;
  border-radius: 34rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.7);
  background:
    radial-gradient(circle at top right, rgba(255, 244, 223, 0.82), transparent 36%),
    linear-gradient(160deg, rgba(255, 252, 247, 0.98), rgba(244, 232, 215, 0.98));
  box-shadow: 0 18rpx 42rpx rgba(37, 28, 12, 0.08);
  backdrop-filter: blur(10rpx);
}

.mode-pill {
  margin: 0 auto 30rpx;
  width: fit-content;
  padding: 0 24rpx;
  min-height: 52rpx;
  border-radius: 999rpx;
  border: 2rpx solid rgba(222, 188, 152, 0.55);
  background: rgba(255, 248, 240, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-pill-text {
  color: #a6652e;
  font-size: 22rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
}

.auth-input {
  width: 100%;
  height: 86rpx;
  border-radius: 24rpx;
  border: 2rpx solid rgba(225, 207, 184, 0.72);
  background: rgba(255, 255, 255, 0.78);
  color: #2b2118;
  font-size: 28rpx;
  padding: 0 28rpx;
  box-sizing: border-box;
}

.auth-input + .auth-input {
  margin-top: 22rpx;
}

.auth-placeholder {
  color: #b19782;
  font-size: 26rpx;
}

.submit-button {
  margin-top: 34rpx;
  width: 100%;
  height: 78rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #d88a3d 0%, #b8672d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 18rpx 34rpx rgba(190, 114, 42, 0.2);
}

.submit-button.disabled {
  opacity: 0.56;
}

.submit-button-text {
  color: #fffaf4;
  font-size: 30rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
}

.mode-switch-row {
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.mode-switch-copy {
  color: #8a7360;
  font-size: 24rpx;
}

.mode-switch-action {
  color: #c97832;
  font-size: 24rpx;
  font-weight: 800;
}

.agreement-row {
  margin-top: 24rpx;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.agreement-checkbox {
  width: 22rpx;
  height: 22rpx;
  min-width: 22rpx;
  margin-top: 6rpx;
  border-radius: 50%;
  border: 2rpx solid #d2b08d;
  background: rgba(255, 255, 255, 0.72);
}

.agreement-checkbox.checked {
  background: #c97832;
  border-color: #c97832;
}

.agreement-text {
  color: #6f5947;
  font-size: 22rpx;
  line-height: 1.6;
}

.helper-text {
  display: block;
  margin-top: 20rpx;
  color: #9b816d;
  font-size: 22rpx;
  text-align: center;
}

.bottom-actions {
  margin-top: auto;
  padding-top: 40rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 68rpx;
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
  border: 2rpx solid rgba(255, 255, 255, 0.68);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 12rpx 26rpx rgba(67, 43, 16, 0.08);
}

.action-circle-text {
  color: #5a3f2d;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1;
}

.action-label {
  color: #7a614f;
  font-size: 20rpx;
  font-weight: 600;
}
</style>
