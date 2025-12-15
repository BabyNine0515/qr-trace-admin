// 评论互动管理相关API
import request from '@/utils/request'

// 获取评论列表
export const getCommentList = (params) => {
  return request({
    url: '/comment/list',
    method: 'get',
    params
  })
}

// 创建评论
export const createComment = (data) => {
  return request({
    url: '/comment',
    method: 'post',
    data
  })
}

// 修改评论
export const updateComment = (data) => {
  return request({
    url: '/comment',
    method: 'put',
    data
  })
}

// 删除评论
export const deleteComment = (params) => {
  return request({
    url: '/comment',
    method: 'delete',
    params
  })
}
