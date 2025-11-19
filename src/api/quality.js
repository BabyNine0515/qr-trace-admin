// 质量信息管理相关API
import request from '@/utils/request'

// 获取检验报告列表
export const getInspectionReportList = (params) => {
  return request({
    url: '/quality/report/list',
    method: 'get',
    params
  })
}

// 获取检验报告详情
export const getInspectionReportDetail = (id) => {
  return request({
    url: `/quality/report/detail/${id}`,
    method: 'get'
  })
}

// 创建检验报告
export const createInspectionReport = (data) => {
  return request({
    url: '/quality/report/create',
    method: 'post',
    data
  })
}

// 更新检验报告
export const updateInspectionReport = (id, data) => {
  return request({
    url: `/quality/report/update/${id}`,
    method: 'put',
    data
  })
}

// 删除检验报告
export const deleteInspectionReport = (id) => {
  return request({
    url: `/quality/report/delete/${id}`,
    method: 'delete'
  })
}

// 上传检验报告文件
export const uploadInspectionReportFile = (data) => {
  return request({
    url: '/quality/report/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
