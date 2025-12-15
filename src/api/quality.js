// 检验报告管理相关API
import request from '@/utils/request'

// 获取检验报告列表
export const getInspectionReportList = (params) => {
  return request({
    url: '/inspection-report/list',
    method: 'get',
    params
  })
}

// 创建检验报告
export const createInspectionReport = (data) => {
  return request({
    url: '/inspection-report',
    method: 'post',
    data
  })
}

// 更新检验报告
export const updateInspectionReport = (data) => {
  return request({
    url: '/inspection-report',
    method: 'put',
    data
  })
}

// 删除检验报告
export const deleteInspectionReport = (id) => {
  return request({
    url: '/inspection-report',
    method: 'delete',
    params: { id }
  })
}
