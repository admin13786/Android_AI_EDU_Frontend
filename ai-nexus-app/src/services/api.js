import request from './request'

// Crawl - news
export const getNewsList = (type = 'business') =>
  request({ url: `/api/news?type=${type}`, timeout: 180000 })

// WorkShop - generation
export const generateCode = (prompt) =>
  request({
    url: '/api/workshop/generate',
    method: 'POST',
    data: { prompt },
    timeout: 600000,
  })

// School
export const createClassroom = (topic) =>
  request({ url: '/api/school/create', method: 'POST', data: { topic }, timeout: 180000 })

export const getClassroomHistory = () =>
  request({ url: '/api/school/history' })

export const getClassroomDetail = (id) =>
  request({ url: `/api/school/${id}`, timeout: 180000 })

export const sendClassroomMessage = (id, data) =>
  request({ url: `/api/school/${id}/chat`, method: 'POST', data, timeout: 180000 })

export const updateClassroomProgress = (id, data) =>
  request({ url: `/api/school/${id}/progress`, method: 'PUT', data })

export const prepareClassroomSceneAudio = (classroomId, sceneId) =>
  request({ url: `/api/school/${classroomId}/scenes/${sceneId}/audio`, method: 'POST', timeout: 180000 })

export const scoreClassroomQuiz = (classroomId, data) =>
  request({
    url: `/api/school/${classroomId}/quiz/score`,
    method: 'POST',
    data,
    timeout: 180000,
  })

// User
export const getUserInfo = () =>
  request({ url: '/api/user/info' })

export const updateUserInfo = (data) =>
  request({ url: '/api/user/info', method: 'PUT', data })

export const updateApiBaseUrl = (baseUrl) =>
  request({ url: '/api/user/settings', method: 'PUT', data: { apiBaseUrl: baseUrl } })
