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
