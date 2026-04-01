import request, { getNewsBaseUrl } from './request'

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

// WorkShop - generation
export const generateCode = (prompt) =>
  request({
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

// User
export const getUserInfo = () =>
  request({ url: '/api/user/info' })

export const updateUserInfo = (data) =>
  request({ url: '/api/user/info', method: 'PUT', data })

export const updateApiBaseUrl = (baseUrl) =>
  request({ url: '/api/user/settings', method: 'PUT', data: { apiBaseUrl: baseUrl } })
