# 项目 API 接口文档

> 本文档覆盖项目中所有后端服务的 HTTP API 接口。  
> 项目包含三个独立后端服务和一个爬虫监控服务。

---

## 目录

- [一、Crawl 主服务（端口 8000）](#一crawl-主服务端口-8000)
  - [1.1 健康检查](#11-健康检查)
  - [1.2 新闻详情](#12-新闻详情)
  - [1.3 新闻速览](#13-新闻速览)
  - [1.4 新闻服务健康检查](#14-新闻服务健康检查)
  - [1.5 用户登录](#15-用户登录)
  - [1.6 用户登出](#16-用户登出)
  - [1.7 微博样式排行榜](#17-微博样式排行榜)
  - [1.8 视频排行榜（占位）](#18-视频排行榜占位)
  - [1.9 爬取批次列表](#19-爬取批次列表)
  - [1.10 用户注册](#110-用户注册)
  - [1.11 列出 Workshop 对话](#111-列出-workshop-对话)
  - [1.12 保存 Workshop 对话](#112-保存-workshop-对话)
  - [1.13 删除 Workshop 对话](#113-删除-workshop-对话)
- [二、Crawl Worker 爬虫工作进程（端口 6600）](#二crawl-worker-爬虫工作进程端口-6600)
  - [2.1 Worker 健康检查](#21-worker-健康检查)
- [三、Crawl Monitor 爬虫监控服务](#三crawl-monitor-爬虫监控服务)
  - [3.1 批次列表](#31-批次列表)
  - [3.2 批次详情](#32-批次详情)
  - [3.3 日志会话列表](#33-日志会话列表)
  - [3.4 日志内容](#34-日志内容)
  - [3.5 服务状态](#35-服务状态)
  - [3.6 日志实时流](#36-日志实时流)
  - [3.7 监控看板页面](#37-监控看板页面)
- [四、WorkShop HTML 生成服务（端口 5000）](#四workshop-html-生成服务端口-5000)
  - [4.1 文件上传至 OSS](#41-文件上传至-oss)
  - [4.2 流式生成 HTML](#42-流式生成-html)
- [五、OpenMAIC 服务（Next.js，端口 3000）](#五openmaic-服务nextjs端口-3000)
  - [5.1 健康检查](#51-健康检查)
  - [5.2 AI 对话（流式）](#52-ai-对话流式)
  - [5.3 创建课堂](#53-创建课堂)
  - [5.4 获取课堂](#54-获取课堂)
  - [5.5 生成课堂（异步任务）](#55-生成课堂异步任务)
  - [5.6 查询课堂生成进度](#56-查询课堂生成进度)
  - [5.7 对话预填充](#57-对话预填充)
  - [5.8 验证模型](#58-验证模型)
  - [5.9 服务端 Provider 列表](#59-服务端-provider-列表)
  - [5.10 Web 搜索](#510-web-搜索)
  - [5.11 语音转文字](#511-语音转文字)
  - [5.12 PDF 解析](#512-pdf-解析)
  - [5.13 验证 PDF Provider](#513-验证-pdf-provider)
  - [5.14 验证 Image Provider](#514-验证-image-provider)
  - [5.15 验证 Video Provider](#515-验证-video-provider)
  - [5.16 媒体代理](#516-媒体代理)
  - [5.17 测验评分](#517-测验评分)
  - [5.18 PBL 对话](#518-pbl-对话)
  - [5.19 Azure 语音列表](#519-azure-语音列表)
  - [5.20 生成 Agent 角色](#520-生成-agent-角色)
  - [5.21 流式生成场景大纲](#521-流式生成场景大纲)
  - [5.22 生成场景内容](#522-生成场景内容)
  - [5.23 生成场景动作](#523-生成场景动作)
  - [5.24 生成图片](#524-生成图片)
  - [5.25 生成视频](#525-生成视频)
  - [5.26 文字转语音 (TTS)](#526-文字转语音-tts)
- [六、前端代理映射说明](#六前端代理映射说明)

---

## 一、Crawl 主服务（端口 8000）

**入口文件**：`Backend/Crawl/run_local.py`  
**框架**：FastAPI  
**默认端口**：8000  
**CORS**：全局开启（`allow_origins=["*"]`）  
**认证**：用户与会话存 SQLite；登录后发 Token。Workshop 对话历史相关接口需请求头 `Authorization: Bearer <token>`。  
**交互式文档**：`GET /docs`（Swagger UI）

> 注意：`news_router` 同时挂载于根路径 `/news/...` 和 `/api/news/...`，两者功能完全相同。

---

### 1.1 健康检查

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/health` |
| **认证** | 无 |

**响应示例**：
```json
{
  "status": "ok",
  "mode": "local",
  "headless": false
}
```

**定义文件**：`Backend/Crawl/run_local.py`

---

### 1.2 新闻详情

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/news/{news_id}` 或 `/api/news/{news_id}` |
| **认证** | 无 |

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `news_id` | `int` | 是 | 新闻文章 ID |

**成功响应**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "文章标题",
    "url": "https://example.com/article",
    "cover_url": "https://example.com/cover.jpg",
    "summary": "文章摘要",
    "source": "来源名称",
    "source_key": "source_key",
    "content": "文章正文内容",
    "brief_json": "{...}",
    "total_score": 8.5,
    "ai_relevance": 0.9,
    "industry_impact": 0.8,
    "spread_heat": 0.7,
    "timeliness": 0.6,
    "content_quality": 0.85,
    "readability": 0.9,
    "published_at": "2026-03-30T10:00:00",
    "crawl_batch": "biz_20260330"
  }
}
```

**失败响应**：
```json
{
  "success": false,
  "message": "未找到新闻：999"
}
```

**定义文件**：`Backend/Crawl/news_api.py`

---

### 1.3 新闻速览

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/news/brief` 或 `/api/news/brief` |
| **认证** | 无 |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `news_id` | `int` | 是 | 新闻文章 ID |

```json
{
  "news_id": 1
}
```

**成功响应**：
```json
{
  "success": true,
  "data": {
    "headline": "速览标题",
    "lead": "导语文本",
    "paragraphs": ["段落1", "段落2", "段落3"],
    "tags": ["AI", "资讯", "速览"],
    "sources": [
      { "label": "来源名", "url": "https://example.com" }
    ]
  }
}
```

**说明**：优先读取数据库中预生成的 `brief_json`；若不可用则通过 LLM 实时生成；最终兜底返回 fallback 结构。

**定义文件**：`Backend/Crawl/news_api.py`

---

### 1.4 新闻服务健康检查

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/news/health` 或 `/api/news/health` |
| **认证** | 无 |

**响应示例**：
```json
{
  "status": "ok",
  "service": "AI News Agent (RSS模式)",
  "version": "3.0.0",
  "features": [
    "RSS 直连采集（AI资讯速览官方 feed，最高排序优先级）",
    "RSS 直连采集（Hacker News）",
    "API 兜底采集（GitHub/B站）",
    "热度 API 补齐（HN/GitHub/B站）",
    "Hacker News 重力衰减排序 (P-1)/(T+2)^G",
    "LLM 商业/个人受众分流",
    "一句话摘要生成",
    "双榜模式（商业/个人）"
  ]
}
```

> ⚠️ 由于路由注册顺序，`@news_router.get("/{news_id}")` 写在 `@news_router.get("/health")` **之前**，路径 `/news/health` 与 `/api/news/health` 都会先匹配 `/{news_id}`，将 `health` 当作整数解析失败，返回 **422**。修复方式：在 `news_api.py` 中将 `/health` 路由移到 `/{news_id}` 之前。

**定义文件**：`Backend/Crawl/news_api.py`

---

### 1.5 用户登录

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/auth/sessions` |
| **认证** | 无（此接口即登录入口） |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `username` | `string` | 是 | 用户名 |
| `password` | `string` | 是 | 密码 |

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**成功响应**：
```json
{
  "success": true,
  "token": "随机 hex 字符串（64 字符）",
  "user": {
    "username": "admin",
    "displayName": "管理员"
  }
}
```

**失败响应**（401）：
```json
{
  "detail": "用户名或密码错误"
}
```

**说明**：用户与会话持久化在 SQLite（`app_users` / `app_sessions`）。数据库初始化时会确保默认账号存在（密码在库内为 PBKDF2 哈希）：`admin` / `admin123`，`workshop_guest` / `123456`（显示名分别为「管理员」「默认用户」）。也可通过 [1.10 用户注册](#110-用户注册) 创建新用户。

**定义文件**：`Backend/Crawl/rank_api.py`

---

### 1.6 用户登出

| 项目 | 内容 |
|------|------|
| **方法** | `DELETE` |
| **路径** | `/api/auth/sessions/current` |
| **认证** | 可选；若携带 `Authorization: Bearer <token>`，服务端会从 `app_sessions` 删除该会话 |

**响应**：
```json
{
  "success": true
}
```

**说明**：无 Token 时仍返回成功（幂等）；有 Token 时清除对应会话记录。

**定义文件**：`Backend/Crawl/rank_api.py`

---

### 1.7 微博样式排行榜

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/ranks/{board}/weibo` |
| **认证** | 无 |

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `board` | `string` | 是 | 榜单类型：`main`（企业榜 / `biz_*`）或 `sub`（个人榜 / `personal_*`）；其他值回退到企业榜 |

**响应示例**：
```json
{
  "list": [
    {
      "id": 1,
      "title": "文章标题",
      "viewsNum": "8.5",
      "tag": "AI",
      "newsId": 42,
      "url": "https://example.com/article",
      "source": "Hacker News",
      "coverUrl": "https://example.com/cover.jpg"
    }
  ]
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `int` | 序号（从 1 开始） |
| `title` | `string` | 文章标题 |
| `viewsNum` | `string` | 综合评分（`total_score`） |
| `tag` | `string` | 标签，来源为 `ai_digest` 时显示"速览"，其他显示"AI" |
| `newsId` | `int` | 数据库文章 ID |
| `url` | `string` | 原文链接 |
| `source` | `string` | 来源名称 |
| `coverUrl` | `string` | 封面图 URL |

**定义文件**：`Backend/Crawl/rank_api.py`

---

### 1.8 视频排行榜（占位）

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/ranks/{board}/video` |
| **认证** | 无 |

**响应**：
```json
{
  "list": []
}
```

**说明**：视频榜数据由前端 Mock，此接口始终返回空列表。

**定义文件**：`Backend/Crawl/rank_api.py`

---

### 1.9 爬取批次列表

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/ranks/batches` |
| **认证** | 无 |

**响应示例**：
```json
{
  "batches": [
    {
      "batch": "biz_20260330_0900",
      "count": 25,
      "time": "2026-03-30 09:15:00"
    }
  ]
}
```

**定义文件**：`Backend/Crawl/rank_api.py`

---

### 1.10 用户注册

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/auth/register` |
| **认证** | 无 |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `username` | `string` | 是 | 用户名（非空） |
| `password` | `string` | 是 | 密码（至少 6 个字符） |
| `display_name` | `string` | 否 | 显示名，默认与用户名相同 |

**成功响应**：
```json
{
  "success": true,
  "token": "...",
  "user": {
    "username": "newuser",
    "displayName": "新用户"
  }
}
```

**失败响应**：400（用户名为空、密码过短）、409（用户名已存在）。

**说明**：注册成功后自动创建会话并返回 Token，格式与登录一致。

**定义文件**：`Backend/Crawl/rank_api.py`

---

### 1.11 列出 Workshop 对话

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/workshop-history/conversations` |
| **认证** | 必填 `Authorization: Bearer <token>` |

**成功响应**：
```json
{
  "success": true,
  "list": [
    {
      "id": "conv_uuid",
      "title": "新对话",
      "messages": [],
      "preview": {},
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**失败响应**（401）：`{"detail": "未登录或登录已失效"}`

**定义文件**：`Backend/Crawl/rank_api.py`

---

### 1.12 保存 Workshop 对话

| 项目 | 内容 |
|------|------|
| **方法** | `PUT` |
| **路径** | `/api/workshop-history/conversations/{conversation_id}` |
| **认证** | 必填 `Authorization: Bearer <token>` |

**路径参数**：`conversation_id` 须与请求体中的 `id` 字段一致。

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 会话 ID（与 URL 一致） |
| `title` | `string` | 否 | 标题，默认 `新对话` |
| `createdAt` / `updatedAt` | `string` | 否 | ISO 时间 |
| `messages` | `array` | 否 | 消息列表 |
| `preview` | `object` | 否 | 预览信息 |

**成功响应**：
```json
{
  "success": true,
  "data": { ... }
}
```

**定义文件**：`Backend/Crawl/rank_api.py`

---

### 1.13 删除 Workshop 对话

| 项目 | 内容 |
|------|------|
| **方法** | `DELETE` |
| **路径** | `/api/workshop-history/conversations/{conversation_id}` |
| **认证** | 必填 `Authorization: Bearer <token>` |

**成功响应**：
```json
{
  "success": true
}
```

**说明**：仅删除当前用户名下、ID 匹配的会话。

**定义文件**：`Backend/Crawl/rank_api.py`

---

## 二、Crawl Worker 爬虫工作进程（端口 6600）

**入口文件**：`Backend/Crawl/crawler_worker.py`  
**框架**：FastAPI  
**默认端口**：6600（可通过环境变量 `WORKER_PORT` 配置）

---

### 2.1 Worker 健康检查

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/health` |
| **认证** | 无 |

**响应示例**：
```json
{
  "status": "ok",
  "service": "crawler_worker"
}
```

**定义文件**：`Backend/Crawl/crawler_worker.py`

---

## 三、Crawl Monitor 爬虫监控服务

**入口文件**：`Backend/Crawl/monitor_api.py`  
**框架**：FastAPI  
**启动方式**：`uvicorn monitor_api:app`  
**认证**：无

---

### 3.1 批次列表

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/batches` |
| **认证** | 无 |

**响应示例**：
```json
{
  "batches": [
    {
      "id": "biz_20260330_0900",
      "cnt": 25,
      "updated_at": "2026-03-30 09:15:00"
    }
  ],
  "runs": [
    {
      "suffix": "20260330_0900",
      "biz_batch": "biz_20260330_0900",
      "personal_batch": "personal_20260330_0900",
      "biz_count": 25,
      "personal_count": 18,
      "updated_at": "2026-03-30 09:15:00"
    }
  ]
}
```

**定义文件**：`Backend/Crawl/monitor_api.py`

---

### 3.2 批次详情

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/batch_view` |
| **认证** | 无 |

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `batch` | `string` | 否 | 批次 ID，缺省时使用数据库中最新批次 |

**响应示例**：
```json
{
  "batch": "biz_20260330_0900",
  "source_distribution": [
    { "source": "Hacker News", "count": 15 },
    { "source": "GitHub", "count": 8 }
  ],
  "articles": [
    {
      "title": "文章标题",
      "url": "https://example.com",
      "source": "Hacker News",
      "source_key": "hackernews",
      "total_score": 8.5,
      "spread_heat": 120,
      "published_at": "2026-03-30T08:00:00",
      "updated_at": "2026-03-30 09:15:00",
      "hn_p": 121.0,
      "hn_t": 1.25,
      "hn_g": 1.8
    }
  ]
}
```

**定义文件**：`Backend/Crawl/monitor_api.py`

---

### 3.3 日志会话列表

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/logs/sessions` |
| **认证** | 无 |

**响应示例**：
```json
{
  "sessions": [
    {
      "key": "current",
      "label": "当前会话（第 3 次）",
      "is_current": true
    },
    {
      "key": "archive/crawl_log_20260329.txt",
      "label": "第 2 次 · 归档 2026-03-29 18:0",
      "is_current": false,
      "size": 524288
    }
  ]
}
```

**定义文件**：`Backend/Crawl/monitor_api.py`

---

### 3.4 日志内容

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/logs/content` |
| **认证** | 无 |

**查询参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `key` | `string` | 否 | `"current"` | 日志会话 key |
| `max_bytes` | `int` | 否 | `2000000` | 最大读取字节数（范围 1,000 - 8,000,000） |

**成功响应**：
```json
{
  "text": "日志内容...",
  "truncated": false,
  "size": 12345
}
```

**失败响应**（404）：
```json
{
  "error": "not found",
  "text": ""
}
```

**定义文件**：`Backend/Crawl/monitor_api.py`

---

### 3.5 服务状态

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/status` |
| **认证** | 无 |

**响应示例**：
```json
{
  "db_exists": true,
  "now": "2026-03-30 10:00:00",
  "timezone": "Asia/Shanghai (UTC+8)",
  "worker_online": true,
  "latest_batch": {
    "crawl_batch": "biz_20260330_0900",
    "count": 25,
    "updated_at": "2026-03-30 09:15:00"
  }
}
```

**定义文件**：`Backend/Crawl/monitor_api.py`

---

### 3.6 日志实时流

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/logs/stream` |
| **认证** | 无 |
| **响应格式** | `text/event-stream`（SSE） |

**查询参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `key` | `string` | 否 | `"current"` | 日志会话 key |

**SSE 事件格式**：
```
data: {"type": "init", "chunk": "初始日志内容..."}

data: {"type": "append", "chunk": "新增日志内容..."}
```

**说明**：`type=init` 为首次连接时返回最近 80 行日志；`type=append` 为实时追加的日志内容。仅对当前会话（`key=current`）持续推送。

**定义文件**：`Backend/Crawl/monitor_api.py`

---

### 3.7 监控看板页面

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/` |
| **认证** | 无 |
| **响应格式** | `text/html` |

**说明**：返回内嵌的单页「爬虫进度看板」HTML 页面，包含运行状态、批次分布、文章列表和实时日志。

**定义文件**：`Backend/Crawl/monitor_api.py`

---

## 四、WorkShop HTML 生成服务（端口 5000）

**入口文件**：`Backend/WorkShop/app.py`  
**框架**：FastAPI  
**默认端口**：5000  
**前端代理路径**：`/api/workshop/...` → `http://localhost:5000/...`  
**依赖**：环境变量 `DASHSCOPE_API_KEY`（LLM）、OSS 配置（上传）

---

### 4.1 文件上传至 OSS

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/upload`（前端通过 `/api/workshop/upload` 代理） |
| **认证** | 无 |
| **Content-Type** | `multipart/form-data` |

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | `File` | 是 | 要上传的文件 |

**成功响应**：
```json
{
  "url": "https://your-oss-domain.com/filename.html"
}
```

**失败响应**（OSS 未配置）：
```json
{
  "error": "OSS credentials are not configured properly."
}
```

**定义文件**：`Backend/WorkShop/app.py`

---

### 4.2 流式生成 HTML

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/generate`（前端通过 `/api/workshop/generate` 代理） |
| **认证** | 无 |
| **响应格式** | `text/event-stream`（SSE） |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `context` | `string` | 是 | 用户输入的上下文/需求描述 |
| `system_prompt` | `string` | 是 | 系统提示词 |

```json
{
  "context": "创建一个产品展示页面",
  "system_prompt": "你是一个 HTML 生成专家..."
}
```

**SSE 事件格式**：

模型输出分为两个阶段，以 `<<<HTML_BEGIN>>>` 标记分隔：

```
data: {"type": "friendly", "content": "我来帮你创建一个展示页面..."}

data: {"type": "text", "content": "<!DOCTYPE html>..."}

data: [DONE]
```

| `type` | 说明 |
|--------|------|
| `friendly` | 分隔符前的自然语言说明 |
| `text` | 分隔符后的 HTML 源码 |

**失败响应**（503，API Key 未配置）：
```json
{
  "detail": "DashScope API Key is not configured."
}
```

**定义文件**：`Backend/WorkShop/app.py`

---

## 五、OpenMAIC 服务（Next.js，端口 3000）

**入口目录**：`Backend/OpenMAIC/`  
**框架**：Next.js App Router  
**默认端口**：3000  
**前端代理路径**：`/openmaic/api/...` → `http://localhost:3000/api/...`  
**CORS**：中间件对 `/api/*` 添加 CORS 支持（`OPTIONS` 返回 204）

**统一响应格式**：
- 成功：`{ "success": true, ...其他字段 }`
- 失败：`{ "success": false, "errorCode": "...", "error": "...", "details": "..." }`

---

### 5.1 健康检查

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/health` |
| **认证** | 无 |

**响应示例**：
```json
{
  "success": true,
  "status": "ok",
  "version": "1.0.0"
}
```

**定义文件**：`Backend/OpenMAIC/app/api/health/route.ts`

---

### 5.2 AI 对话（流式）

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/chat` |
| **认证** | 需要有效 LLM API Key（请求体或服务端环境变量） |
| **响应格式** | `text/event-stream`（SSE） |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `messages` | `array` | 是 | 对话消息数组 |
| `storeState` | `object` | 是 | 状态存储 |
| `config.agentIds` | `string[]` | 是 | Agent ID 列表（非空） |
| `model` | `string` | 否 | 模型名称 |
| `apiKey` | `string` | 否 | LLM API Key |
| `baseUrl` | `string` | 否 | LLM Base URL |
| `directorState` | `object` | 否 | Director 状态 |

**SSE 事件格式**：
```
data: <StatelessEvent JSON>

:heartbeat
```

**失败响应**（401）：
```json
{
  "success": false,
  "errorCode": "MISSING_API_KEY",
  "error": "API Key is required"
}
```

**定义文件**：`Backend/OpenMAIC/app/api/chat/route.ts`

---

### 5.3 创建课堂

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/classroom` |
| **认证** | 无 |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `stage` | `object` | 是 | 课堂阶段信息 |
| `scenes` | `array` | 是 | 场景列表 |

**成功响应**（201）：
```json
{
  "success": true,
  "id": "classroom_id",
  "url": "/classroom/classroom_id"
}
```

**定义文件**：`Backend/OpenMAIC/app/api/classroom/route.ts`

---

### 5.4 获取课堂

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/classroom` |
| **认证** | 无 |

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 课堂 ID（需通过服务端 `isValidClassroomId` 校验） |

**成功响应**：
```json
{
  "success": true,
  "classroom": { ... }
}
```

**失败响应**（404）：
```json
{
  "success": false,
  "error": "Classroom not found"
}
```

**定义文件**：`Backend/OpenMAIC/app/api/classroom/route.ts`

---

### 5.5 生成课堂（异步任务）

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/generate-classroom` |
| **认证** | 无 |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `requirement` | `string` | 是 | 课堂需求描述 |
| `pdfContent` | `object` | 否 | PDF 内容 `{ text, images }` |
| `language` | `string` | 否 | 目标语言 |

**成功响应**（202）：
```json
{
  "success": true,
  "jobId": "job_xxx",
  "status": "processing",
  "step": "initializing",
  "message": "开始生成课堂...",
  "pollUrl": "/api/generate-classroom/job_xxx",
  "pollIntervalMs": 2000
}
```

**定义文件**：`Backend/OpenMAIC/app/api/generate-classroom/route.ts`

---

### 5.6 查询课堂生成进度

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/generate-classroom/{jobId}` |
| **认证** | 无 |

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `jobId` | `string` | 是 | 异步任务 ID |

**响应示例**：
```json
{
  "success": true,
  "jobId": "job_xxx",
  "status": "processing",
  "step": "generating_scenes",
  "progress": 60,
  "message": "正在生成第 3/5 个场景...",
  "pollUrl": "/api/generate-classroom/job_xxx",
  "pollIntervalMs": 2000,
  "scenesGenerated": 3,
  "totalScenes": 5,
  "result": null,
  "error": null,
  "done": false
}
```

**定义文件**：`Backend/OpenMAIC/app/api/generate-classroom/[jobId]/route.ts`

---

### 5.7 对话预填充

| 项目 | 内容 |
|------|------|
| **方法** | `POST` / `GET` |
| **路径** | `/api/dialog-prefill` |
| **认证** | 无 |

**POST 请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` / `content` / `text` | `string` | 否 | 预填充文本（三选一） |
| `classroomId` / `classroom_id` | `string` | 否 | 课堂 ID |
| `redirect` | `boolean` | 否 | 是否重定向（默认 `true`） |
| `to` | `string` | 否 | 重定向目标路径 |

**GET 查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` / `content` | `string` | 否 | 预填充文本 |
| `classroomId` | `string` | 否 | 课堂 ID |
| `to` | `string` | 否 | 重定向目标路径 |

**响应**：
- 重定向模式（302）：跳转到课堂/首页，并设置 Cookie `openmaic_prefill`
- 非重定向模式（200）：`{ "ok": true }`
- 错误（400）：`{ "ok": false, "error": "..." }`

**定义文件**：`Backend/OpenMAIC/app/api/dialog-prefill/route.ts`

---

### 5.8 验证模型

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/verify-model` |
| **认证** | 无 |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | `string` | 是 | 模型名称 |
| `apiKey` | `string` | 否 | API Key |
| `baseUrl` | `string` | 否 | Base URL |
| `providerType` | `string` | 否 | Provider 类型 |
| `requiresApiKey` | `boolean` | 否 | 是否必须提供 API Key |

**响应示例**：
```json
{
  "success": true,
  "message": "Model verified successfully",
  "response": "..."
}
```

**定义文件**：`Backend/OpenMAIC/app/api/verify-model/route.ts`

---

### 5.9 服务端 Provider 列表

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/server-providers` |
| **认证** | 无 |

**响应示例**：
```json
{
  "success": true,
  "providers": [...],
  "tts": {...},
  "asr": {...},
  "pdf": {...},
  "image": {...},
  "video": {...},
  "webSearch": {...}
}
```

**定义文件**：`Backend/OpenMAIC/app/api/server-providers/route.ts`

---

### 5.10 Web 搜索

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/web-search` |
| **认证** | 无 |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | `string` | 是 | 搜索关键词 |
| `apiKey` | `string` | 否 | 搜索 API Key |

**响应示例**：
```json
{
  "success": true,
  "answer": "搜索摘要...",
  "sources": [...],
  "context": "...",
  "query": "搜索关键词",
  "responseTime": 1200
}
```

**定义文件**：`Backend/OpenMAIC/app/api/web-search/route.ts`

---

### 5.11 语音转文字

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/transcription` |
| **认证** | 无 |
| **Content-Type** | `multipart/form-data` |

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `audio` | `File` | 是 | 音频文件 |
| `providerId` | `string` | 否 | ASR Provider ID |
| `language` | `string` | 否 | 目标语言 |
| `apiKey` | `string` | 否 | API Key |
| `baseUrl` | `string` | 否 | Base URL |

**响应示例**：
```json
{
  "success": true,
  "text": "转录的文字内容"
}
```

**定义文件**：`Backend/OpenMAIC/app/api/transcription/route.ts`

---

### 5.12 PDF 解析

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/parse-pdf` |
| **认证** | 无 |
| **Content-Type** | `multipart/form-data` |

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `pdf` | `File` | 是 | PDF 文件 |
| `providerId` | `string` | 否 | PDF Provider ID |
| `apiKey` | `string` | 否 | API Key |
| `baseUrl` | `string` | 否 | Base URL |

**响应示例**：
```json
{
  "success": true,
  "data": {
    "text": "解析的文本内容",
    "images": [...]
  }
}
```

**定义文件**：`Backend/OpenMAIC/app/api/parse-pdf/route.ts`

---

### 5.13 验证 PDF Provider

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/verify-pdf-provider` |
| **认证** | 无 |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `providerId` | `string` | 是 | PDF Provider ID |
| `apiKey` | `string` | 否 | API Key |
| `baseUrl` | `string` | 否 | Base URL |

**定义文件**：`Backend/OpenMAIC/app/api/verify-pdf-provider/route.ts`

---

### 5.14 验证 Image Provider

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/verify-image-provider` |
| **认证** | 无 |

**请求 Headers**：

| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `x-image-provider` | `string` | 是 | 图片 Provider 名称 |
| `x-image-model` | `string` | 是 | 图片模型名称 |
| `x-api-key` | `string` | 否 | API Key |
| `x-base-url` | `string` | 否 | Base URL |

**响应示例**：
```json
{
  "success": true,
  "message": "Image provider verified"
}
```

**定义文件**：`Backend/OpenMAIC/app/api/verify-image-provider/route.ts`

---

### 5.15 验证 Video Provider

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/verify-video-provider` |
| **认证** | 无 |

**请求 Headers**：

| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `x-video-provider` | `string` | 是 | 视频 Provider 名称 |
| `x-video-model` | `string` | 是 | 视频模型名称 |
| `x-api-key` | `string` | 否 | API Key |
| `x-base-url` | `string` | 否 | Base URL |

**定义文件**：`Backend/OpenMAIC/app/api/verify-video-provider/route.ts`

---

### 5.16 媒体代理

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/proxy-media` |
| **认证** | 无 |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | `string` | 是 | 目标媒体 URL |

**成功响应**：返回二进制媒体内容，`Content-Type` 与原始资源一致。

**失败响应**：
```json
{
  "success": false,
  "error": "Failed to fetch media"
}
```

**定义文件**：`Backend/OpenMAIC/app/api/proxy-media/route.ts`

---

### 5.17 测验评分

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/quiz-grade` |
| **认证** | 通过 Headers 传递 LLM 配置 |

**请求 Headers**：

| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `x-model` | `string` | 是 | 模型名称 |
| `x-api-key` | `string` | 否 | API Key |
| `x-base-url` | `string` | 否 | Base URL |
| `x-provider-type` | `string` | 否 | Provider 类型 |
| `x-requires-api-key` | `string` | 否 | 是否需要 API Key |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `question` | `string` | 是 | 题目内容 |
| `userAnswer` | `string` | 是 | 用户答案 |
| `points` | `number` | 是 | 题目分值 |
| `commentPrompt` | `string` | 否 | 评语提示词 |
| `language` | `string` | 否 | 评语语言 |

**响应示例**：
```json
{
  "success": true,
  "score": 8,
  "comment": "回答很好，但缺少..."
}
```

**定义文件**：`Backend/OpenMAIC/app/api/quiz-grade/route.ts`

---

### 5.18 PBL 对话

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/pbl/chat` |
| **认证** | 通过 Headers 传递 LLM 配置 |

**请求 Headers**：同 [5.17 测验评分](#517-测验评分) 中的 LLM Headers。

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `message` | `string` | 是 | 用户消息 |
| `agent` | `object` | 是 | Agent 信息 |
| `currentIssue` | `object` | 是 | 当前议题 |
| `recentMessages` | `array` | 是 | 近期消息列表 |
| `userRole` | `string` | 是 | 用户角色 |
| `agentType` | `string` | 否 | Agent 类型 |

**响应示例**：
```json
{
  "success": true,
  "message": "Agent 回复内容...",
  "agentName": "导师"
}
```

**定义文件**：`Backend/OpenMAIC/app/api/pbl/chat/route.ts`

---

### 5.19 Azure 语音列表

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/azure-voices` |
| **认证** | 无 |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `apiKey` | `string` | 是 | Azure API Key |
| `baseUrl` | `string` | 是 | Azure Base URL |

**响应示例**：
```json
{
  "success": true,
  "voices": [...]
}
```

**定义文件**：`Backend/OpenMAIC/app/api/azure-voices/route.ts`

---

### 5.20 生成 Agent 角色

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/generate/agent-profiles` |
| **认证** | 通过 Headers 传递 LLM 配置 |

**请求 Headers**：同 [5.17](#517-测验评分) 中的 LLM Headers。

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `stageInfo.name` | `string` | 是 | 阶段名称 |
| `language` | `string` | 是 | 语言 |
| `availableAvatars` | `array` | 是 | 可用头像列表（非空） |
| `sceneOutlines` | `array` | 否 | 场景大纲 |

**响应示例**：
```json
{
  "success": true,
  "agents": [
    {
      "id": "agent_1",
      "name": "张教授",
      "role": "讲师",
      "persona": "人工智能专家...",
      "avatar": "avatar_01",
      "color": "#4A90D9",
      "priority": 1
    }
  ]
}
```

**定义文件**：`Backend/OpenMAIC/app/api/generate/agent-profiles/route.ts`

---

### 5.21 流式生成场景大纲

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/generate/scene-outlines-stream` |
| **认证** | 通过 Headers 传递 LLM 配置 |
| **响应格式** | `text/event-stream`（SSE） |

**请求 Headers**：同 [5.17](#517-测验评分) 中的 LLM Headers。

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `requirements` | `object` | 是 | 用户需求（`UserRequirements` 类型） |
| `pdfText` | `string` | 否 | PDF 文本内容 |
| `pdfImages` | `array` | 否 | PDF 图片列表 |
| `imageMapping` | `object` | 否 | 图片映射 |
| `researchContext` | `string` | 否 | 研究上下文 |
| `agents` | `array` | 否 | Agent 列表 |

**SSE 事件类型**：`outline` / `done` / `error`

**定义文件**：`Backend/OpenMAIC/app/api/generate/scene-outlines-stream/route.ts`

---

### 5.22 生成场景内容

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/generate/scene-content` |
| **认证** | 通过 Headers 传递 LLM 配置 |

**请求 Headers**：同 [5.17](#517-测验评分) 中的 LLM Headers。

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `outline` | `object` | 是 | 场景大纲 |
| `allOutlines` | `array` | 是 | 所有场景大纲 |
| `stageId` | `string` | 是 | 阶段 ID |
| `stageInfo` | `object` | 是 | 阶段信息 |
| `pdfImages` | `array` | 否 | PDF 图片 |
| `imageMapping` | `object` | 否 | 图片映射 |
| `agents` | `array` | 否 | Agent 列表 |

**响应示例**：
```json
{
  "success": true,
  "content": { ... },
  "effectiveOutline": { ... }
}
```

**定义文件**：`Backend/OpenMAIC/app/api/generate/scene-content/route.ts`

---

### 5.23 生成场景动作

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/generate/scene-actions` |
| **认证** | 通过 Headers 传递 LLM 配置 |

**请求 Headers**：同 [5.17](#517-测验评分) 中的 LLM Headers。

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `outline` | `object` | 是 | 场景大纲 |
| `allOutlines` | `array` | 是 | 所有场景大纲 |
| `content` | `object` | 是 | 场景内容 |
| `stageId` | `string` | 是 | 阶段 ID |
| `agents` | `array` | 否 | Agent 列表 |
| `previousSpeeches` | `array` | 否 | 之前的对话记录 |
| `userProfile` | `object` | 否 | 用户信息 |

**响应示例**：
```json
{
  "success": true,
  "scene": { ... },
  "previousSpeeches": [...]
}
```

**定义文件**：`Backend/OpenMAIC/app/api/generate/scene-actions/route.ts`

---

### 5.24 生成图片

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/generate/image` |
| **认证** | 通过 Headers 传递 Provider 配置 |

**请求 Headers**：

| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `x-image-provider` | `string` | 是 | 图片 Provider |
| `x-api-key` | `string` | 是 | API Key |
| `x-base-url` | `string` | 否 | Base URL |
| `x-image-model` | `string` | 否 | 图片模型 |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | `string` | 是 | 图片描述 |
| `negativePrompt` | `string` | 否 | 负面提示词 |
| `width` | `number` | 否 | 图片宽度 |
| `height` | `number` | 否 | 图片高度 |
| `aspectRatio` | `string` | 否 | 宽高比 |
| `style` | `string` | 否 | 风格 |

**响应示例**：
```json
{
  "success": true,
  "result": { ... }
}
```

**定义文件**：`Backend/OpenMAIC/app/api/generate/image/route.ts`

---

### 5.25 生成视频

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/generate/video` |
| **认证** | 通过 Headers 传递 Provider 配置 |

**请求 Headers**：

| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `x-video-provider` | `string` | 是 | 视频 Provider |
| `x-video-model` | `string` | 是 | 视频模型 |
| `x-api-key` | `string` | 是 | API Key |
| `x-base-url` | `string` | 否 | Base URL |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | `string` | 是 | 视频描述 |
| `duration` | `number` | 否 | 视频时长（秒） |
| `aspectRatio` | `string` | 否 | 宽高比 |
| `resolution` | `string` | 否 | 分辨率 |

**响应示例**：
```json
{
  "success": true,
  "result": { ... }
}
```

**定义文件**：`Backend/OpenMAIC/app/api/generate/video/route.ts`

---

### 5.26 文字转语音 (TTS)

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/generate/tts` |
| **认证** | 无 |

**请求体（JSON）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | `string` | 是 | 待转换文本 |
| `audioId` | `string` | 是 | 音频标识 ID |
| `ttsProviderId` | `string` | 是 | TTS Provider ID |
| `ttsVoice` | `string` | 是 | 语音角色名称 |
| `ttsSpeed` | `number` | 否 | 语速 |
| `ttsApiKey` | `string` | 否 | TTS API Key |
| `ttsBaseUrl` | `string` | 否 | TTS Base URL |

**响应示例**：
```json
{
  "success": true,
  "audioId": "audio_001",
  "base64": "UklGRi...",
  "format": "wav"
}
```

**定义文件**：`Backend/OpenMAIC/app/api/generate/tts/route.ts`

---

## 六、前端代理映射说明

前端（Vue + Vite）开发服务器端口为 **5173**，通过 `FrontEnd/vite.config.js` 配置代理将 API 请求转发到对应后端。生产环境见 `FrontEnd/nginx.conf` / `FrontEnd/nginx.compose.conf`，通常与下表一致且额外包含未在 Vite 中配置的项（见下）。

| 前端请求路径 | 代理目标 | 说明 |
|-------------|----------|------|
| `/openmaic/*` | `http://localhost:3000/*` | OpenMAIC（去掉 `/openmaic` 前缀） |
| `/api/workshop/*` | `http://localhost:5000/*` | WorkShop（去掉 `/api/workshop` 前缀） |
| `/api/ranks/*` | `http://localhost:8000/api/ranks/*` | Crawl 排行榜（保留路径） |
| `/api/auth/*` | `http://localhost:8000/api/auth/*` | 登录 / 注册 / 登出（保留路径） |
| `/api/articles/*` | `http://localhost:8000/api/articles/*` | ⚠️ 见下文 |
| `/api/news/*` | `http://localhost:8000/api/news/*` | 新闻详情与速览；**当前 `vite.config.js` 未配置**，开发时需自行加代理或直连 8000；**Nginx 生产配置已包含** |
| `/api/workshop-history/*` | `http://localhost:8000/api/workshop-history/*` | Workshop 对话历史；**Vite 未配置**，**Nginx 已包含** |
| `/api/page-screenshot` | `http://localhost:8000/api/page-screenshot` | ⚠️ 见下文 |
| `/api/page-screenshot.png` | `http://localhost:8000/api/page-screenshot.png` | ⚠️ 见下文 |
| `/api/og-image` | `http://localhost:8000/api/og-image` | ⚠️ 见下文 |

> ⚠️ `/api/articles`、`/api/page-screenshot`、`/api/page-screenshot.png`、`/api/og-image` 在 `Backend/Crawl/run_local.py` 中**未注册路由**，请求 Crawl 8000 会得到 **404**（可能为预留或由其他部署方式提供）。其余已列路径在 Crawl 侧有对应实现或与 WorkShop/OpenMAIC 一致。

---

*文档生成时间：2026-04-02*
