// 溯源码管理相关API

// 由于没有后端，这里提供模拟的API函数，实际使用时会被替换为真实的后端API调用

export const getTraceabilityList = () => {
  return new Promise((resolve) => {
    // 模拟从后端获取数据
    setTimeout(() => {
      const data = JSON.parse(localStorage.getItem('traceabilityCodes') || '[]')
      resolve({
        code: 200,
        data: data,
        total: data.length
      })
    }, 300)
  })
}

export const createTraceability = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const codes = JSON.parse(localStorage.getItem('traceabilityCodes') || '[]')
      const newCode = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toLocaleString('zh-CN')
      }
      codes.push(newCode)
      localStorage.setItem('traceabilityCodes', JSON.stringify(codes))
      resolve({
        code: 200,
        data: newCode,
        message: '创建成功'
      })
    }, 300)
  })
}

export const updateTraceability = (id, data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const codes = JSON.parse(localStorage.getItem('traceabilityCodes') || '[]')
      const index = codes.findIndex(item => item.id === id)
      if (index !== -1) {
        codes[index] = { ...codes[index], ...data }
        localStorage.setItem('traceabilityCodes', JSON.stringify(codes))
        resolve({
          code: 200,
          data: codes[index],
          message: '更新成功'
        })
      } else {
        resolve({
          code: 404,
          message: '未找到该溯源码'
        })
      }
    }, 300)
  })
}

export const deleteTraceability = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const codes = JSON.parse(localStorage.getItem('traceabilityCodes') || '[]')
      const newCodes = codes.filter(item => item.id !== id)
      localStorage.setItem('traceabilityCodes', JSON.stringify(newCodes))
      resolve({
        code: 200,
        message: '删除成功'
      })
    }, 300)
  })
}

export const verifyTraceability = (code) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const codes = JSON.parse(localStorage.getItem('traceabilityCodes') || '[]')
      const item = codes.find(item => item.code.toUpperCase() === code.toUpperCase())

      if (item) {
        if (item.status) {
          resolve({
            code: 200,
            status: 'success',
            data: item,
            message: '溯源码有效'
          })
        } else {
          resolve({
            code: 400,
            status: 'error',
            message: '溯源码已失效'
          })
        }
      } else {
        resolve({
          code: 404,
          status: 'error',
          message: '未找到该溯源码'
        })
      }
    }, 300)
  })
}

export const generateTraceabilityCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 16; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code.toUpperCase()
}
