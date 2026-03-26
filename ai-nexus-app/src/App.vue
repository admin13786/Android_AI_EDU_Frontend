<script>
import { setUnauthorizedHandler } from '@/services/request'
import { useUserStore } from '@/stores/user'

export default {
  onLaunch() {
    setUnauthorizedHandler(() => {
      useUserStore().logout()
    })
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
