const DEBUG_LOG_STORAGE_KEY = 'aiNexusDebugLogs'
const DEBUG_LOG_FILE_PATH = '_doc/ai-nexus-debug/workshop-debug.log'
const DEBUG_LOG_MAX_ENTRIES = 200

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value)

const safeSerialize = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)

  try {
    return JSON.stringify(value)
  } catch (error) {
    return '[unserializable]'
  }
}

const normalizeDetail = (detail) => {
  if (detail === null || detail === undefined) return ''
  if (typeof detail === 'string') return detail

  if (Array.isArray(detail)) {
    return detail.map((item) => safeSerialize(item)).join(' ')
  }

  if (isPlainObject(detail)) {
    const next = {}
    Object.keys(detail).forEach((key) => {
      const value = detail[key]
      if (value === undefined) return
      next[key] = typeof value === 'string' ? value : safeSerialize(value)
    })
    return safeSerialize(next)
  }

  return safeSerialize(detail)
}

const readDebugLogs = () => {
  const stored = uni.getStorageSync(DEBUG_LOG_STORAGE_KEY)
  return Array.isArray(stored) ? stored : []
}

const writeDebugLogs = (list) => {
  uni.setStorageSync(DEBUG_LOG_STORAGE_KEY, Array.isArray(list) ? list.slice(-DEBUG_LOG_MAX_ENTRIES) : [])
}

const appendFileLog = (line) => {
  // #ifdef APP-PLUS
  try {
    if (!plus?.io?.requestFileSystem) return
    plus.io.requestFileSystem(
      plus.io.PRIVATE_DOC,
      (fs) => {
        fs.root.getFile(
          DEBUG_LOG_FILE_PATH,
          { create: true },
          (entry) => {
            entry.createWriter(
              (writer) => {
                const previousError = writer.onerror
                writer.onerror = (error) => {
                  if (typeof previousError === 'function') previousError(error)
                }
                writer.seek(writer.length)
                writer.write(`${line}\n`)
              },
              () => {},
            )
          },
          () => {},
        )
      },
      () => {},
    )
  } catch (error) {
    // ignore file log failures
  }
  // #endif
}

export const appendDebugLog = (scope, event, detail = '') => {
  const entry = {
    at: new Date().toISOString(),
    scope: String(scope || 'app').trim() || 'app',
    event: String(event || 'event').trim() || 'event',
    detail: normalizeDetail(detail),
  }

  const line = `[${entry.at}] [${entry.scope}] ${entry.event}${entry.detail ? ` ${entry.detail}` : ''}`
  const logs = readDebugLogs()
  logs.push(entry)
  writeDebugLogs(logs)
  console.log(line)
  appendFileLog(line)
  return entry
}

export const getDebugLogEntries = () => readDebugLogs()

export const getDebugLogText = () =>
  readDebugLogs()
    .map((entry) => `[${entry.at}] [${entry.scope}] ${entry.event}${entry.detail ? ` ${entry.detail}` : ''}`)
    .join('\n')

export const clearDebugLogs = () => {
  writeDebugLogs([])
  // #ifdef APP-PLUS
  try {
    if (!plus?.io?.resolveLocalFileSystemURL) return
    plus.io.resolveLocalFileSystemURL(
      DEBUG_LOG_FILE_PATH,
      (entry) => entry.remove(() => {}, () => {}),
      () => {},
    )
  } catch (error) {
    // ignore cleanup failures
  }
  // #endif
}

export const DEBUG_LOG_FILE_HINT = DEBUG_LOG_FILE_PATH
