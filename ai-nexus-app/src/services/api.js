import { getStoredUserInfo } from '@/utils/auth'
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

export const getNewsBrief = (newsId) =>
  request({
    baseUrl: getNewsBaseUrl(),
    url: '/api/news/brief',
    method: 'POST',
    data: { news_id: Number(newsId) },
    timeout: 180000,
  })

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

const WORKSHOP_STREAM_ENDPOINT = '/agent-do/generate-preview/stream'
const WORKSHOP_HISTORY_ENDPOINT = '/api/workshop-history/conversations'

const createWorkshopConversationId = () => `mobile-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`

const getCurrentWorkshopUsername = () => {
  const userInfo = getStoredUserInfo()
  return String(userInfo?.username || userInfo?.id || '').trim() || 'workshop_guest'
}

const toAbsoluteWorkshopUrl = (url) => {
  const baseUrl = String(getBaseUrl() || '').replace(/\/+$/, '')
  if (!baseUrl || !url) return url
  return `${baseUrl}${String(url).startsWith('/') ? url : `/${url}`}`
}

export const normalizeWorkshopPreviewUrl = (url) => {
  if (!url || typeof url !== 'string') return ''

  const normalized = url.trim()
  if (!normalized) return ''

  const rewritePath = (pathname, search = '', hash = '') =>
    toAbsoluteWorkshopUrl(`${pathname}${search}${hash}`)

  try {
    const parsed = new URL(normalized, getBaseUrl() || 'http://localhost')
    if (parsed.pathname.startsWith('/api/workshop/agent-do/preview/')) {
      return rewritePath(parsed.pathname.replace(/^\/api\/workshop/, ''), parsed.search, parsed.hash)
    }
    if (parsed.pathname.startsWith('/agent-do/preview/')) {
      return rewritePath(parsed.pathname, parsed.search, parsed.hash)
    }
    return parsed.toString()
  } catch (error) {
    if (normalized.startsWith('/api/workshop/agent-do/preview/')) {
      return toAbsoluteWorkshopUrl(normalized.replace(/^\/api\/workshop/, ''))
    }
    if (normalized.startsWith('/agent-do/preview/')) {
      return toAbsoluteWorkshopUrl(normalized)
    }
    return normalized
  }
}

const pickWorkshopText = (value, fallback = '') => {
  if (typeof value === 'string') {
    const normalizedText = value.trim()
    return normalizedText || fallback
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    const joined = value.map((item) => pickWorkshopText(item)).filter(Boolean).join(' ')
    return joined || fallback
  }

  if (value && typeof value === 'object') {
    for (const key of ['summary', 'message', 'detail', 'error', 'text', 'title', 'content']) {
      const normalizedText = pickWorkshopText(value[key], '')
      if (normalizedText) return normalizedText
    }
  }

  return fallback
}

const extractMessageText = (message = {}) =>
  pickWorkshopText(message?.content || message?.text || message?.message || '', '')

const firstMessageByRole = (messages = [], role = '') =>
  (Array.isArray(messages) ? messages : []).find((item) => String(item?.role || '').trim() === role) || null

const lastMessageByRole = (messages = [], role = '') =>
  [...(Array.isArray(messages) ? messages : [])]
    .reverse()
    .find((item) => String(item?.role || '').trim() === role) || null

const normalizeWorkshopHistoryItem = (item = {}) => {
  const prompt =
    pickWorkshopText(item.prompt, '') ||
    extractMessageText(firstMessageByRole(item.messages, 'user')) ||
    pickWorkshopText(item.title, '')
  const assistantSummary =
    pickWorkshopText(item?.result?.summary || item.summary, '') ||
    extractMessageText(lastMessageByRole(item.messages, 'assistant')) ||
    prompt
  const previewUrl = normalizeWorkshopPreviewUrl(
    item?.result?.previewUrl || item?.result?.url || item?.preview?.url || item?.previewUrl || item?.url || '',
  )
  const code =
    pickWorkshopText(item?.result?.code, '') || pickWorkshopText(item?.preview?.code?.content || item?.html, '')
  const title = pickWorkshopText(item.title, '') || prompt || 'Workshop Preview'

  return {
    ...item,
    id: String(item.id || '').trim(),
    title,
    prompt,
    result:
      item?.result && typeof item.result === 'object'
        ? {
            ...item.result,
            title: pickWorkshopText(item.result.title, title) || title,
            summary: pickWorkshopText(item.result.summary, assistantSummary) || assistantSummary,
            previewUrl,
            url: previewUrl,
            code,
            language: item.result.language || item?.preview?.code?.lang || 'html',
          }
        : {
            title,
            summary: assistantSummary,
            previewUrl,
            url: previewUrl,
            code,
            language: item?.preview?.code?.lang || 'html',
          },
    createdAt: item.createdAt || item.created_at || Date.now(),
    updatedAt: item.updatedAt || item.updated_at || item.createdAt || item.created_at || Date.now(),
  }
}

const buildRemoteWorkshopConversationPayload = (conversation = {}) => {
  const normalizedConversation = normalizeWorkshopHistoryItem(conversation)
  const fallbackMessages = [
    normalizedConversation.prompt ? { role: 'user', content: normalizedConversation.prompt } : null,
    normalizedConversation.result?.summary
      ? { role: 'assistant', content: normalizedConversation.result.summary }
      : null,
  ].filter(Boolean)

  return {
    id: normalizedConversation.id,
    title: normalizedConversation.title || normalizedConversation.prompt || '新对话',
    prompt: normalizedConversation.prompt,
    result: normalizedConversation.result,
    createdAt: normalizedConversation.createdAt,
    updatedAt: normalizedConversation.updatedAt || Date.now(),
    messages:
      Array.isArray(conversation.messages) && conversation.messages.length ? conversation.messages : fallbackMessages,
    preview: {
      mode:
        conversation?.preview?.mode ||
        (normalizedConversation.result?.previewUrl || normalizedConversation.result?.url
          ? 'url'
          : normalizedConversation.result?.code
            ? 'code'
            : 'empty'),
      html: conversation?.preview?.html || '',
      url: normalizeWorkshopPreviewUrl(
        conversation?.preview?.url ||
          normalizedConversation.result?.previewUrl ||
          normalizedConversation.result?.url ||
          '',
      ),
      code: {
        lang: conversation?.preview?.code?.lang || normalizedConversation.result?.language || 'html',
        content: conversation?.preview?.code?.content || normalizedConversation.result?.code || '',
      },
    },
  }
}

const buildWorkshopStreamPayload = (prompt, options = {}) => ({
  context: prompt,
  system_prompt: options.systemPrompt || WORKSHOP_SYSTEM_PROMPT,
  conversation_id: options.conversationId || createWorkshopConversationId(),
  username: options.username || getCurrentWorkshopUsername(),
  title: options.title || prompt.slice(0, 40) || 'Mobile Workshop Preview',
  generation_mode: options.generationMode || 'preview',
})

const extractSsePayload = (block = '') => {
  const dataLines = block
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .filter(Boolean)

  if (!dataLines.length) return null

  const rawPayload = dataLines.join('\n')
  if (!rawPayload || rawPayload === '[DONE]') return null

  try {
    return JSON.parse(rawPayload)
  } catch (error) {
    return null
  }
}

const readSseBlocks = (buffer = '') => {
  const blocks = []
  const separator = /\r?\n\r?\n/g
  let cursor = 0
  let match = separator.exec(buffer)

  while (match) {
    blocks.push(buffer.slice(cursor, match.index))
    cursor = match.index + match[0].length
    match = separator.exec(buffer)
  }

  return {
    blocks,
    remainder: buffer.slice(cursor),
  }
}

export const generateCode = (prompt, options = {}) => {
  const payload = buildWorkshopStreamPayload(prompt, options)
  const baseUrl = getBaseUrl()
  const unifiedKey = uni.getStorageSync('unifiedApiKey')

  return new Promise((resolve, reject) => {
    if (typeof XMLHttpRequest === 'undefined') {
      reject(new Error('Streaming is not supported in current environment'))
      return
    }

    const xhr = new XMLHttpRequest()
    let settled = false
    let processedLength = 0
    let pendingBuffer = ''
    let draftText = ''
    let latestStatus = ''
    let finalResult = null
    let conversationId = payload.conversation_id

    const safeReject = (error) => {
      if (settled) return
      settled = true
      reject(error instanceof Error ? error : new Error(String(error || 'Request failed')))
    }

    const safeResolve = () => {
      if (settled) return
      settled = true
      const normalizedPreviewUrl = normalizeWorkshopPreviewUrl(finalResult?.previewUrl || finalResult?.url || '')
      resolve({
        result: finalResult || {},
        summary: finalResult?.summary || finalResult?.message || draftText || latestStatus,
        message: finalResult?.message || draftText || latestStatus,
        previewUrl: normalizedPreviewUrl,
        url: normalizedPreviewUrl,
        conversationId: finalResult?.conversationId || finalResult?.conversation_id || conversationId,
        streamStatus: latestStatus,
        streamText: draftText,
      })
    }

    const handlePayload = (eventPayload) => {
      if (!eventPayload || typeof eventPayload !== 'object') return

      if (eventPayload.conversationId || eventPayload.conversation_id) {
        conversationId = eventPayload.conversationId || eventPayload.conversation_id || conversationId
      }

      const eventType = String(eventPayload.type || '').trim().toLowerCase()
      if (!eventType) return

      if (eventType === 'status') {
        latestStatus = String(eventPayload.content || eventPayload.stage || latestStatus || '').trim()
        if (typeof options.onStatus === 'function' && latestStatus) {
          options.onStatus(latestStatus, eventPayload)
        }
        return
      }

      if (eventType === 'delta') {
        const deltaText = String(eventPayload.content || '')
        if (!deltaText) return
        draftText += deltaText
        if (typeof options.onDelta === 'function') {
          options.onDelta(deltaText, draftText, eventPayload)
        }
        return
      }

      if (eventType === 'result') {
        finalResult = {
          ...(finalResult || {}),
          ...eventPayload,
          previewUrl: normalizeWorkshopPreviewUrl(eventPayload.previewUrl || eventPayload.url || ''),
          url: normalizeWorkshopPreviewUrl(eventPayload.url || eventPayload.previewUrl || ''),
          conversationId: eventPayload.conversationId || eventPayload.conversation_id || conversationId,
        }
        if (typeof options.onResult === 'function') {
          options.onResult(finalResult, eventPayload)
        }
        return
      }

      if (eventType === 'error') {
        safeReject(new Error(String(eventPayload.content || eventPayload.message || 'Generation failed')))
      }
    }

    const processResponseText = () => {
      const nextText = xhr.responseText.slice(processedLength)
      if (!nextText) return

      processedLength = xhr.responseText.length
      pendingBuffer += nextText

      const parsed = readSseBlocks(pendingBuffer)
      pendingBuffer = parsed.remainder
      parsed.blocks.forEach((block) => handlePayload(extractSsePayload(block)))
    }

    xhr.open('POST', `${baseUrl}${WORKSHOP_STREAM_ENDPOINT}`, true)
    xhr.timeout = 600000
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('Accept', 'text/event-stream')
    if (unifiedKey) {
      xhr.setRequestHeader('X-Api-Key', unifiedKey)
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState >= 3) {
        processResponseText()
      }

      if (xhr.readyState !== 4 || settled) return

      processResponseText()

      if (xhr.status >= 200 && xhr.status < 300) {
        if (pendingBuffer.trim()) {
          handlePayload(extractSsePayload(pendingBuffer))
          pendingBuffer = ''
        }

        if (!settled) {
          safeResolve()
        }
        return
      }

      safeReject(new Error(xhr.responseText || `Request failed with status ${xhr.status}`))
    }

    xhr.onerror = () => safeReject(new Error('Network request failed'))
    xhr.ontimeout = () => safeReject(new Error('Request timeout'))
    xhr.send(JSON.stringify(payload))
  })
}

export const routeWorkshopInput = (text) =>
  request({
    url: '/api/workshop/router',
    method: 'POST',
    data: { text },
    timeout: 180000,
  })

export const getWorkshopHistoryRemote = () =>
  request({
    baseUrl: getNewsBaseUrl(),
    url: WORKSHOP_HISTORY_ENDPOINT,
    timeout: 180000,
    withAuth: true,
  }).then((response) => ({
    ...response,
    list: Array.isArray(response?.list) ? response.list.map((item) => normalizeWorkshopHistoryItem(item)) : [],
  }))

export const saveWorkshopHistoryRemote = async (list = []) => {
  const conversations = (Array.isArray(list) ? list : [])
    .map((item) => buildRemoteWorkshopConversationPayload(item))
    .filter((item) => item.id)

  const savedList = []
  for (const conversation of conversations) {
    const response = await request({
      baseUrl: getNewsBaseUrl(),
      url: WORKSHOP_HISTORY_ENDPOINT + '/' + encodeURIComponent(conversation.id),
      method: 'PUT',
      data: conversation,
      timeout: 180000,
      withAuth: true,
    })
    if (response?.data) {
      savedList.push(normalizeWorkshopHistoryItem(response.data))
    }
  }

  return {
    success: true,
    list: savedList,
  }
}
