const ROOT_PAGES = new Set([
  '/pages/home/index',
  '/pages/crawl/index',
  '/pages/school/input',
  '/pages/profile/index'
])

export const navigateByPath = (path) => {
  if (!path) return

  const [basePath] = path.split('?')

  if (ROOT_PAGES.has(basePath)) {
    uni.reLaunch({ url: path })
    return
  }

  uni.navigateTo({ url: path })
}

export const safeNavigateBack = (fallbackUrl = '/pages/home/index?openSidebar=1') => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
    return
  }
  uni.reLaunch({ url: fallbackUrl })
}
