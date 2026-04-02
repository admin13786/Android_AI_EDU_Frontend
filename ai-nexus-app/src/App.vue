<script>
import { setUnauthorizedHandler } from '@/services/request'
import { useUserStore } from '@/stores/user'
import {
  AUTH_ROUTE,
  hasStoredSessionToken,
  normalizeRoute,
  redirectToAuth,
  routeRequiresAuth,
} from '@/utils/auth'

const resolveCurrentRoute = () => {
  const pages = getCurrentPages?.() || []
  return pages.length ? `/${pages[pages.length - 1].route}` : ''
}

const ensureAuthState = () => {
  const userStore = useUserStore()
  if (userStore.restoreSession()) return true
  return hasStoredSessionToken()
}

export default {
  onLaunch() {
    setUnauthorizedHandler(() => {
      useUserStore().logout()
      const currentRoute = resolveCurrentRoute()
      if (normalizeRoute(currentRoute) !== AUTH_ROUTE) {
        redirectToAuth(currentRoute)
      }
    })

    if (!ensureAuthState()) {
      setTimeout(() => {
        const currentRoute = resolveCurrentRoute()
        if (normalizeRoute(currentRoute) !== AUTH_ROUTE) {
          redirectToAuth(currentRoute || '/pages/home/index')
        }
      }, 0)
    }
  },

  onShow() {
    const currentRoute = resolveCurrentRoute()
    const hasAuth = ensureAuthState()
    if (!currentRoute) {
      if (!hasAuth) {
        redirectToAuth('/pages/home/index')
      }
      return
    }
    if (!routeRequiresAuth(currentRoute)) return
    if (hasAuth) return
    redirectToAuth(currentRoute)
  },
}
</script>

<style lang="scss">
@import './theme.scss';

page {
  background-color: $bg-deep;
  color: $text-white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
