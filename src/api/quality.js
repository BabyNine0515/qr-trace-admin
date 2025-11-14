// 质量信息管理相关API
import request from '@/utils/request'

// 获取检验报告列表
export const getInspectionReportList = (params) => {
  return request({
    url: '/quality/inspection-report/list',
    method: 'get',
    params
  })
}

// 获取检验报告详情
export const getInspectionReportDetail = (id) => {
  return request({
    url: `/quality/inspection-report/detail/${id}`,
    method: 'get'
  })
}

// 创建检验报告
export const createInspectionReport = (data) => {
  return request({
    url: '/quality/inspection-report/create',
    method: 'post',
    data
  })
}

// 更新检验报告
export const updateInspectionReport = (id, data) => {
  return request({
    url: `/quality/inspection-report/update/${id}`,
    method: 'put',
    data
  })
}

// 删除检验报告
export const deleteInspectionReport = (id) => {
  return request({
    url: `/quality/inspection-report/delete/${id}`,
    method: 'delete'
  })
}

// 上传检验报告文件
export const uploadInspectionReportFile = (id, data) => {
  return request({
    url: `/quality/inspection-report/upload/${id}`,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
