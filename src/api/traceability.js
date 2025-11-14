// 溯源码管理相关API
import request from '@/utils/request'

// 由于没有真实后端，这里提供基于request的API函数，实际使用时会连接到真实的后端API

// 获取溯源码列表
export const getTraceabilityList = (params) => {
  return request({
    url: '/traceability/list',
    method: 'get',
    params
  })
}

// 获取溯源码二维码列表
export const getQRCodeList = (params) => {
  return request({
    url: '/traceability/qrcode/list',
    method: 'get',
    params
  })
}

// 创建溯源码
export const createTraceability = (data) => {
  return request({
    url: '/traceability/create',
    method: 'post',
    data
  })
}

// 生成溯源码二维码
export const generateQRCode = (data) => {
  return request({
    url: '/traceability/qrcode/generate',
    method: 'post',
    data
  })
}

// 更新溯源码
export const updateTraceability = (id, data) => {
  return request({
    url: `/traceability/update/${id}`,
    method: 'put',
    data
  })
}

// 删除溯源码
export const deleteTraceability = (id) => {
  return request({
    url: `/traceability/delete/${id}`,
    method: 'delete'
  })
}

// 删除溯源码二维码
export const deleteQRCode = (id) => {
  return request({
    url: `/traceability/qrcode/delete/${id}`,
    method: 'delete'
  })
}

// 验证溯源码
export const verifyTraceability = (code) => {
  return request({
    url: '/traceability/verify',
    method: 'get',
    params: { code }
  })
}

// 批量生成溯源码
export const batchGenerateTraceabilityCodes = (count) => {
  return request({
    url: '/traceability/batch-generate',
    method: 'post',
    data: { count }
  })
}



// 上传图片
export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/traceability/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传视频
export const uploadVideo = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/traceability/upload/video',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传证书/报告
export const uploadCertificate = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/traceability/upload/certificate',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 导入溯源码
export const importTraceabilityCodes = (formData) => {
  return request({
    url: '/traceability/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 保存验证历史
export const saveVerifyHistory = (data) => {
  return request({
    url: '/traceability/verify/history',
    method: 'post',
    data
  })
}
