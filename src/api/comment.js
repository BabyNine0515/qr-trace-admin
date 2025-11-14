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

// 获取评论详情
export const getCommentDetail = (id) => {
  return request({
    url: `/comment/detail/${id}`,
    method: 'get'
  })
}

// 审核评论
export const approveComment = (id, data) => {
  return request({
    url: `/comment/approve/${id}`,
    method: 'put',
    data
  })
}

// 删除评论
export const deleteComment = (id) => {
  return request({
    url: `/comment/delete/${id}`,
    method: 'delete'
  })
}

// 批量删除评论
export const batchDeleteComment = (ids) => {
  return request({
    url: '/comment/batch-delete',
    method: 'delete',
    data: { ids }
  })
}

// 回复评论
export const replyComment = (id, data) => {
  return request({
    url: `/comment/reply/${id}`,
    method: 'post',
    data
  })
}
