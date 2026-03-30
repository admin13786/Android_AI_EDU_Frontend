export const WorkshopIntent = {
  GenerateWorkshop: 'generate_workshop',
  News: 'news',
  School: 'school',
  Help: 'help',
}

const GENERATE_KEYWORDS = [
  '生成',
  '制作',
  '开发',
  '写一个',
  '做一个',
  '做个',
  '页面',
  '网页',
  '网站',
  '小程序',
  '小游戏',
  '应用',
  'app',
  'h5',
  'html',
  'ui',
  '登录页',
  '贪吃蛇',
]

const NEWS_KEYWORDS = [
  '资讯',
  '新闻',
  '热点',
  '榜单',
  'crawl',
]

const SCHOOL_KEYWORDS = [
  '学堂',
  '课堂',
  '课程',
  '教学',
  '学习',
  'school',
  'openmaic',
]

const containsAnyKeyword = (text, keywords) => keywords.some((keyword) => text.includes(keyword))

export const classifyWorkshopInput = (input = '') => {
  const normalized = String(input).trim().toLowerCase()

  if (!normalized) {
    return { intent: WorkshopIntent.Help }
  }

  if (containsAnyKeyword(normalized, GENERATE_KEYWORDS)) {
    return { intent: WorkshopIntent.GenerateWorkshop }
  }

  if (containsAnyKeyword(normalized, NEWS_KEYWORDS)) {
    return { intent: WorkshopIntent.News }
  }

  if (containsAnyKeyword(normalized, SCHOOL_KEYWORDS)) {
    return { intent: WorkshopIntent.School }
  }

  return { intent: WorkshopIntent.Help }
}
