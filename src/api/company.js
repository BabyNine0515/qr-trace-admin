// 公司信息管理相关API
import request from '@/utils/request'

// 获取公司基本信息
export const getCompanyInfo = () => {
  return request({
    url: '/company/info',
    method: 'get'
  })
}

// 更新公司基本信息
export const updateCompanyInfo = (data) => {
  return request({
    url: '/company/update',
    method: 'put',
    data
  })
}

// 获取公司资质列表
export const getCompanyCertificates = () => {
  return request({
    url: '/company/certificates',
    method: 'get'
  })
}

// 添加公司资质
export const addCertificate = (data) => {
  return request({
    url: '/company/certificate/add',
    method: 'post',
    data
  })
}

// 更新公司资质
export const updateCertificate = (id, data) => {
  return request({
    url: `/company/certificate/update/${id}`,
    method: 'put',
    data
  })
}

// 删除公司资质
export const deleteCertificate = (id) => {
  return request({
    url: `/company/certificate/delete/${id}`,
    method: 'delete'
  })
}

// 获取公司宣传媒体列表
export const getCompanyMedia = () => {
  return request({
    url: '/company/media',
    method: 'get'
  })
}

// 更新公司宣传媒体
export const updateCompanyMedia = (data) => {
  return request({
    url: '/company/media/update',
    method: 'put',
    data
  })
}
