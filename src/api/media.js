// 媒体资源管理相关API
import request from '@/utils/request'

// 获取图片库列表
export const getImageList = (params) => {
  return request({
    url: '/media/image/list',
    method: 'get',
    params
  })
}

// 上传图片
export const uploadImage = (data) => {
  return request({
    url: '/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除图片
export const deleteImage = (id) => {
  return request({
    url: `/media/image/delete/${id}`,
    method: 'delete'
  })
}

// 获取视频库列表
export const getVideoList = (params) => {
  return request({
    url: '/media/video/list',
    method: 'get',
    params
  })
}

// 上传视频
export const uploadVideo = (data) => {
  return request({
    url: '/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除视频
export const deleteVideo = (id) => {
  return request({
    url: `/media/video/delete/${id}`,
    method: 'delete'
  })
}

// 获取文件列表
export const getFileList = (params) => {
  return request({
    url: '/media/file/list',
    method: 'get',
    params
  })
}

// 上传文件
export const uploadFile = (data) => {
  return request({
    url: '/media/file/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除文件
export const deleteFile = (id) => {
  return request({
    url: `/media/file/delete/${id}`,
    method: 'delete'
  })
}
