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

// School
export const createClassroom = (topic) =>
  request({ url: '/api/school/create', method: 'POST', data: { topic }, timeout: 180000 })

export const getClassroomHistory = () =>
  request({ url: '/api/school/history' })

export const deleteClassroom = (id) =>
  request({ url: `/api/school/${id}`, method: 'DELETE', timeout: 180000 })

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
