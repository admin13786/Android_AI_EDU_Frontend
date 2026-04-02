<script>
import { setUnauthorizedHandler } from '@/services/request'
import { useUserStore } from '@/stores/user'
import { AUTH_ROUTE, normalizeRoute, redirectToAuth, routeRequiresAuth } from '@/utils/auth'

export default {
  onLaunch() {
    setUnauthorizedHandler(() => {
      useUserStore().logout()
      const pages = getCurrentPages?.() || []
      const currentRoute = pages.length ? `/${pages[pages.length - 1].route}` : ''
      if (normalizeRoute(currentRoute) !== AUTH_ROUTE) {
        redirectToAuth(currentRoute)
      }
    })
  },

  onShow() {
    const userStore = useUserStore()
    const pages = getCurrentPages?.() || []
    const currentRoute = pages.length ? `/${pages[pages.length - 1].route}` : ''
    if (!routeRequiresAuth(currentRoute)) return
    if (userStore.isAuthenticated) return
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
