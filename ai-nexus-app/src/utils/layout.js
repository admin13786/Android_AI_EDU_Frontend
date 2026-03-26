export const getLayoutMetrics = () => {
  const systemInfo = uni.getSystemInfoSync()

  return {
    statusBarHeight: systemInfo.statusBarHeight || 0,
    safeAreaInsetsBottom: systemInfo.safeAreaInsets?.bottom ?? 0,
  }
}
