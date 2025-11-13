<template>
  <div class="verify-container">
    <div class="verify-card">
      <!-- 添加logo和标语 -->
      <div class="header-section">
        <img v-if="false" src="/logo.png" alt="Logo" class="logo">
        <h2 class="title">产品溯源码验证</h2>
        <p class="subtitle">为您提供真实可靠的产品溯源信息</p>
      </div>
      <el-form ref="verifyForm" :model="verifyForm" :rules="rules" label-width="100px">
        <el-form-item label="溯源码" prop="code">
          <el-input v-model="verifyForm.code" placeholder="请输入溯源码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" icon="el-icon-search" @click="handleVerify">验证</el-button>
          <el-button icon="el-icon-refresh" @click="resetVerify">重置</el-button>
          <el-button icon="el-icon-camera" @click="scanCode">扫码验证</el-button>
        </el-form-item>
      </el-form>

      <!-- 验证结果展示 -->
      <div v-if="resultVisible" class="result-card">
        <div v-if="verifyResult.status === 'success'" class="success-result">
          <div class="result-header">
            <el-avatar size="60" icon="el-icon-success" />
            <h3 style="color: #67c23a; margin-left: 10px; margin-bottom: 0; line-height: 60px;">验证成功！</h3>
          </div>
          <div class="product-info">
            <!-- 产品图片 -->
            <div v-if="verifyResult.data.imageUrl" class="product-image-container">
              <img :src="verifyResult.data.imageUrl" alt="产品图片" class="product-image">
            </div>
            <div class="product-details">
              <el-descriptions :column="{xs: 1, sm: 2}" border :content-style="{padding: '12px 10px'}">
                <el-descriptions-item label="溯源码" class="code-item">
                  <div class="code-display">
                    {{ verifyResult.data.code }}
                    <el-button type="text" icon="el-icon-document-copy" size="small" @click="copyCode">复制</el-button>
                  </div>
                </el-descriptions-item>
                <el-descriptions-item label="产品名称">{{ verifyResult.data.productName }}</el-descriptions-item>
                <el-descriptions-item label="品牌">{{ verifyResult.data.brand || '-' }}</el-descriptions-item>
                <el-descriptions-item label="产品规格">{{ verifyResult.data.specs || '-' }}</el-descriptions-item>
                <el-descriptions-item label="产品类别">{{ verifyResult.data.category || '-' }}</el-descriptions-item>
                <el-descriptions-item label="生产日期">{{ verifyResult.data.productionDate || '-' }}</el-descriptions-item>
                <el-descriptions-item label="保质期">{{ verifyResult.data.shelfLife || '-' }}</el-descriptions-item>
                <el-descriptions-item label="生产地">{{ verifyResult.data.productionPlace || '-' }}</el-descriptions-item>
                <el-descriptions-item label="产品描述" :span="{xs: 1, sm: 2}">{{ verifyResult.data.description || '-' }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ verifyResult.data.createdAt }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>

          <!-- 生产流程时间线 -->
          <div v-if="verifyResult.data.processSteps && verifyResult.data.processSteps.length > 0" class="process-timeline">
            <h3 class="timeline-title">生产流程</h3>
            <el-timeline>
              <el-timeline-item
                v-for="(step, index) in verifyResult.data.processSteps"
                :key="index"
                :timestamp="formatDateTime(step.time)"
                :type="getStepType(step.type)"
                :icon="getStepIcon(step.type)"
              >
                <div class="timeline-content">
                  <h4>{{ step.name }}</h4>
                  <p><strong>环节类型：</strong>{{ getStepTypeName(step.type) }}</p>
                  <p><strong>操作人：</strong>{{ step.operator || '-' }}</p>
                  <p><strong>地点：</strong>{{ step.location || '-' }}</p>
                  <p><strong>负责人：</strong>{{ step.responsiblePerson || '-' }}</p>
                  <p v-if="step.description" class="step-description"><strong>备注：</strong>{{ step.description }}</p>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" icon="el-icon-share" @click="shareResult">分享结果</el-button>
            <el-button icon="el-icon-document" @click="saveRecord">保存记录</el-button>
            <el-button icon="el-icon-printer" @click="printResult">打印报告</el-button>
          </div>
        </div>
        <div v-else class="error-result">
          <div class="result-header">
            <el-avatar size="60" icon="el-icon-error" />
            <h3 style="color: #f56c6c; margin-left: 10px; margin-bottom: 0; line-height: 60px;">验证失败！</h3>
          </div>
          <el-alert :title="verifyResult.message" type="error" show-icon style="margin-top: 20px;" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VerifyTraceability',
  data() {
    return {
      loading: false,
      verifyForm: {
        code: ''
      },
      rules: {
        code: [
          { required: true, message: '请输入溯源码', trigger: 'blur' },
          { min: 8, message: '溯源码长度至少为8位', trigger: 'blur' }
        ]
      },
      resultVisible: false,
      verifyResult: {
        status: '',
        message: '',
        data: {}
      },
      scanVisible: false,
      scanInput: '',
      // 生产环节类型映射
      stepTypes: {
        MATERIAL: { name: '原料采购', type: 'primary', icon: 'el-icon-goods' },
        PRODUCTION: { name: '生产加工', type: 'success', icon: 'el-icon-s-order' },
        PACKAGING: { name: '包装', type: 'warning', icon: 'el-icon-box' },
        INSPECTION: { name: '检验', type: 'info', icon: 'el-icon-check' },
        LOGISTICS: { name: '物流运输', type: 'danger', icon: 'el-icon-truck' }
      }
    }
  },
  methods: {
    // 验证溯源码
    handleVerify() {
      this.$refs.verifyForm.validate((valid) => {
        if (valid) {
          this.loading = true
          // 模拟网络延迟
          setTimeout(() => {
            // 从localStorage获取数据
            const data = JSON.parse(localStorage.getItem('traceabilityCodes') || '[]')
            // 查找溯源码
            const item = data.find(item => item.code.toUpperCase() === this.verifyForm.code.toUpperCase())

            this.loading = false
            this.resultVisible = true

            if (item) {
              if (item.status) {
                this.verifyResult = {
                  status: 'success',
                  message: '溯源码有效',
                  data: item
                }
                this.$message({ type: 'success', message: '验证成功' })
                // 保存验证记录
                this.saveVerifyHistory(item)
              } else {
                this.verifyResult = {
                  status: 'error',
                  message: '溯源码已失效'
                }
                this.$message({ type: 'error', message: '溯源码已失效' })
              }
            } else {
              this.verifyResult = {
                status: 'error',
                message: '未找到该溯源码，请检查输入是否正确'
              }
              this.$message({ type: 'error', message: '未找到该溯源码' })
            }
          }, 500)
        }
      })
    },

    // 重置验证表单
    resetVerify() {
      this.$refs.verifyForm.resetFields()
      this.resultVisible = false
    },

    // 扫码验证
    scanCode() {
      this.$message.info('扫码功能开发中，敬请期待')
      // 实际项目中可以集成扫码库
      // 这里模拟扫码输入
      // this.scanVisible = true
    },

    // 复制溯源码
    copyCode() {
      const code = this.verifyResult.data.code
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code)
          .then(() => {
            this.$message.success('溯源码已复制到剪贴板')
          })
          .catch(() => {
            this.$message.error('复制失败，请手动复制')
          })
      } else {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = code
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          document.execCommand('copy')
          this.$message.success('溯源码已复制到剪贴板')
        } catch (err) {
          this.$message.error('复制失败，请手动复制')
        } finally {
          document.body.removeChild(textArea)
        }
      }
    },

    // 分享结果
    shareResult() {
      this.$message.info('分享功能开发中，敬请期待')
    },

    // 保存记录
    saveRecord() {
      this.saveVerifyHistory(this.verifyResult.data)
      this.$message.success('记录已保存')
    },

    // 打印报告
    printResult() {
      this.$message.info('打印功能开发中，敬请期待')
    },

    // 保存验证历史
    saveVerifyHistory(item) {
      try {
        const history = JSON.parse(localStorage.getItem('verifyHistory') || '[]')
        history.push({
          code: item.code,
          productName: item.productName,
          verifyTime: new Date().toISOString(),
          result: 'success'
        })
        localStorage.setItem('verifyHistory', JSON.stringify(history))
      } catch (e) {
        console.error('保存验证历史失败', e)
      }
    },

    // 格式化日期时间
    formatDateTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },

    // 获取环节类型对应的样式
    getStepType(type) {
      return this.stepTypes[type]?.type || 'primary'
    },

    // 获取环节类型对应的图标
    getStepIcon(type) {
      return this.stepTypes[type]?.icon || 'el-icon-circle-check'
    },

    // 获取环节类型名称
    getStepTypeName(type) {
      return this.stepTypes[type]?.name || '未知环节'
    }
  }
}
</script>

<style scoped>
.verify-container {
  min-height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.verify-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  width: 100%;
  max-width: 800px;
  margin-top: 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  border-radius: 50%;
}

.title {
  text-align: center;
  margin-bottom: 10px;
  color: #303133;
  font-size: 28px;
  font-weight: bold;
}

.subtitle {
  text-align: center;
  color: #909399;
  margin-bottom: 30px;
  font-size: 16px;
}

.result-card {
  margin-top: 30px;
  padding: 25px;
  border-radius: 12px;
  background-color: #fafafa;
  border: 1px solid #ebeef5;
  animation: fadeIn 0.5s ease-in-out;
}

.result-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ebeef5;
}

.success-result {
  padding: 25px;
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 8px;
}

.error-result {
  padding: 25px;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 8px;
}

/* 产品信息样式 */
.product-info {
  margin-bottom: 30px;
}

.product-image-container {
  text-align: center;
  margin-bottom: 20px;
}

.product-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-details {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.code-item {
  background-color: #f0f2f5;
}

.code-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 时间线样式 */
.process-timeline {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #ebeef5;
}

.timeline-title {
  margin-bottom: 20px;
  color: #303133;
  font-size: 20px;
  font-weight: bold;
}

.timeline-content {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #67c23a;
}

.timeline-content h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
}

.timeline-content p {
  margin: 5px 0;
  color: #606266;
}

.step-description {
  font-style: italic;
  color: #909399 !important;
}

/* 操作按钮样式 */
.action-buttons {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .verify-card {
    padding: 25px;
    margin-top: 10px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .product-image {
    max-width: 150px;
    max-height: 150px;
  }

  .result-header {
    flex-direction: column;
    text-align: center;
  }

  .result-header h3 {
    margin-left: 0 !important;
    margin-top: 10px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}

/* 深色模式支持 */
:global(.dark-theme) .verify-container {
  background: linear-gradient(135deg, #3a1c71 0%, #d76d77 100%);
}

:global(.dark-theme) .verify-card {
  background: #1f2937;
  color: #f9fafb;
}

:global(.dark-theme) .title {
  color: #f9fafb;
}

:global(.dark-theme) .subtitle {
  color: #d1d5db;
}

:global(.dark-theme) .product-details {
  background: #374151;
}

:global(.dark-theme) .timeline-content {
  background: #374151;
  border-left-color: #10b981;
}

:global(.dark-theme) .timeline-content h4 {
  color: #f9fafb;
}

:global(.dark-theme) .timeline-content p {
  color: #d1d5db;
}

:global(.dark-theme) .step-description {
  color: #9ca3af !important;
}
</style>
