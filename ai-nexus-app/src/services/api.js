import request, { getBaseUrl, getNewsBaseUrl } from './request'

const NEWS_BOARD_BY_TYPE = {
  business: 'main',
  personal: 'sub',
}

const normalizeNewsItem = (item = {}, index = 0) => {
  const score = item.viewsNum || item.total_score || item.score || '0'
  const source = item.source || item.tag || 'AI资讯'
  const summary =
    item.summary ||
    item.brief ||
    item.description ||
    `${source} 热榜内容，点击查看原文详情。`

  return {
    id: item.newsId || item.id || `news-${index}`,
    title: item.title || '未命名资讯',
    summary,
    url: item.url || '',
    source,
    score,
    coverUrl: item.coverUrl || item.cover_url || '',
    raw: item,
  }
}

// Crawl - news
export const getNewsList = async (type = 'business') => {
  const board = NEWS_BOARD_BY_TYPE[type] || NEWS_BOARD_BY_TYPE.business
  const response = await request({
    baseUrl: getNewsBaseUrl(),
    url: `/api/ranks/${board}/weibo`,
    timeout: 180000,
  })

  return {
    ...response,
    list: Array.isArray(response?.list) ? response.list.map((item, index) => normalizeNewsItem(item, index)) : [],
  }
}

// Auth - company crawl service
export const loginSession = (data) =>
  request({
    baseUrl: getNewsBaseUrl(),
    url: '/api/auth/sessions',
    method: 'POST',
    data,
    timeout: 180000,
    skipUnauthorizedRedirect: true,
  })

export const registerSession = (data) =>
  request({
    baseUrl: getNewsBaseUrl(),
    url: '/api/auth/register',
    method: 'POST',
    data,
    timeout: 180000,
    skipUnauthorizedRedirect: true,
  })

export const logoutCurrentSession = () =>
  request({
    baseUrl: getNewsBaseUrl(),
    url: '/api/auth/sessions/current',
    method: 'DELETE',
    timeout: 180000,
    withAuth: true,
    skipUnauthorizedRedirect: true,
  })

// WorkShop - generation
const WORKSHOP_SYSTEM_PROMPT =
  '你是一个移动端 H5 游戏生成助手。请根据用户需求生成适配安卓手机 WebView 的小游戏，必须优先支持触屏操作和竖屏布局，交互清晰，按钮和触控区域足够大，界面简洁，可直接运行。若用户描述的是游戏，则默认补全为支持触屏控制、移动端适配、包含基础开始/重开与结果反馈。'

export const generateCode = (prompt) =>
  request({
    baseUrl: getBaseUrl(),
    url: '/api/workshop/generate',
    method: 'POST',
    data: { prompt },
    timeout: 600000,
  })

export const routeWorkshopInput = (text) =>
  request({
    url: '/api/workshop/router',
    method: 'POST',
    data: { text },
    timeout: 180000,
  })

export const getWorkshopHistoryRemote = () =>
  request({ url: '/api/workshop/history', timeout: 180000 })

export const saveWorkshopHistoryRemote = (list) =>
  request({ url: '/api/workshop/history', method: 'PUT', data: { list }, timeout: 180000 })
