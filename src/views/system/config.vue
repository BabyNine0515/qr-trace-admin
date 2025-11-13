<template>
  <div class="system-config-container">
    <el-card shadow="never">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <!-- 网站信息设置 -->
        <el-tab-pane label="网站信息" name="siteInfo">
          <el-form ref="siteInfoRef" :model="siteInfoForm" :rules="siteInfoRules" label-width="120px">
            <el-form-item label="网站名称" prop="siteName">
              <el-input v-model="siteInfoForm.siteName" placeholder="请输入网站名称" />
            </el-form-item>
            <el-form-item label="网站域名" prop="siteDomain">
              <el-input v-model="siteInfoForm.siteDomain" placeholder="请输入网站域名" />
            </el-form-item>
            <el-form-item label="联系邮箱" prop="contactEmail">
              <el-input v-model="siteInfoForm.contactEmail" type="email" placeholder="请输入联系邮箱" />
            </el-form-item>
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="siteInfoForm.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="ICP备案号" prop="icpNumber">
              <el-input v-model="siteInfoForm.icpNumber" placeholder="请输入ICP备案号" />
            </el-form-item>
            <el-form-item label="网站描述" prop="siteDescription">
              <el-input
                v-model="siteInfoForm.siteDescription"
                type="textarea"
                :rows="4"
                placeholder="请输入网站描述"
              />
            </el-form-item>
            <el-form-item label="网站Logo">
              <el-upload
                class="avatar-uploader"
                :action="uploadUrl"
                :show-file-list="false"
                :on-success="handleLogoUploadSuccess"
                :before-upload="beforeLogoUpload"
              >
                <img v-if="siteInfoForm.siteLogo" :src="siteInfoForm.siteLogo" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon" />
              </el-upload>
              <div class="upload-tip">
                请上传jpg/png格式图片，建议尺寸200x80
              </div>
            </el-form-item>
            <el-form-item label="Favicon图标">
              <el-upload
                class="avatar-uploader"
                :action="uploadUrl"
                :show-file-list="false"
                :on-success="handleFaviconUploadSuccess"
                :before-upload="beforeFaviconUpload"
              >
                <img v-if="siteInfoForm.favicon" :src="siteInfoForm.favicon" class="favicon">
                <i v-else class="el-icon-plus avatar-uploader-icon favicon-icon" />
              </el-upload>
              <div class="upload-tip">
                请上传ico/png格式图标，建议尺寸32x32
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveSiteInfo">保存设置</el-button>
              <el-button @click="handleResetSiteInfo">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 溯源码设置 -->
        <el-tab-pane label="溯源码设置" name="traceability">
          <el-form ref="traceabilityRef" :model="traceabilityForm" :rules="traceabilityRules" label-width="120px">
            <el-form-item label="溯源码前缀" prop="codePrefix">
              <el-input v-model="traceabilityForm.codePrefix" placeholder="请输入溯源码前缀" />
              <div class="form-tip">
                溯源码前缀将添加到每个生成的溯源码前面，建议使用简短的字母或数字
              </div>
            </el-form-item>
            <el-form-item label="溯源码长度" prop="codeLength">
              <el-input-number
                v-model="traceabilityForm.codeLength"
                :min="8"
                :max="20"
                :step="1"
                placeholder="请输入溯源码长度"
              />
              <div class="form-tip">
                溯源码随机部分的长度，建议设置为12-16位
              </div>
            </el-form-item>
            <el-form-item label="码值字符集">
              <el-checkbox-group v-model="traceabilityForm.charSet">
                <el-checkbox label="numbers">数字 (0-9)</el-checkbox>
                <el-checkbox label="uppercase">大写字母 (A-Z)</el-checkbox>
                <el-checkbox label="lowercase">小写字母 (a-z)</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="二维码尺寸" prop="qrCodeSize">
              <el-input-number
                v-model="traceabilityForm.qrCodeSize"
                :min="100"
                :max="500"
                :step="50"
                placeholder="请输入二维码尺寸"
              />
              <span class="unit">像素</span>
            </el-form-item>
            <el-form-item label="二维码颜色" prop="qrCodeColor">
              <el-color-picker v-model="traceabilityForm.qrCodeColor" />
            </el-form-item>
            <el-form-item label="二维码背景" prop="qrCodeBgColor">
              <el-color-picker v-model="traceabilityForm.qrCodeBgColor" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveTraceability">保存设置</el-button>
              <el-button @click="handleResetTraceability">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 其他配置 -->
        <el-tab-pane label="其他配置" name="otherConfig">
          <el-form ref="otherConfigRef" :model="otherConfigForm" :rules="otherConfigRules" label-width="120px">
            <el-form-item label="每页显示条数" prop="pageSize">
              <el-select v-model="otherConfigForm.pageSize" placeholder="请选择每页显示条数">
                <el-option :value="10" label="10条/页" />
                <el-option :value="20" label="20条/页" />
                <el-option :value="50" label="50条/页" />
                <el-option :value="100" label="100条/页" />
              </el-select>
            </el-form-item>
            <el-form-item label="文件上传大小限制" prop="maxFileSize">
              <el-input-number
                v-model="otherConfigForm.maxFileSize"
                :min="1"
                :max="100"
                :step="1"
                placeholder="请输入文件大小限制"
              />
              <span class="unit">MB</span>
            </el-form-item>
            <el-form-item label="图片压缩质量" prop="imageQuality">
              <el-slider
                v-model="otherConfigForm.imageQuality"
                :min="0.1"
                :max="1"
                :step="0.1"
                show-stops
              />
              <span class="quality-value">{{ otherConfigForm.imageQuality }}</span>
            </el-form-item>
            <el-form-item label="是否启用评论审核">
              <el-switch
                v-model="otherConfigForm.commentAudit"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-value="1"
                :inactive-value="0"
              />
              <div class="form-tip">
                启用后，用户评论需要管理员审核通过后才能显示
              </div>
            </el-form-item>
            <el-form-item label="缓存时间" prop="cacheTime">
              <el-input-number
                v-model="otherConfigForm.cacheTime"
                :min="1"
                :max="1440"
                :step="5"
                placeholder="请输入缓存时间"
              />
              <span class="unit">分钟</span>
            </el-form-item>
            <el-form-item label="自动清理日志天数" prop="logCleanDays">
              <el-input-number
                v-model="otherConfigForm.logCleanDays"
                :min="1"
                :max="365"
                :step="1"
                placeholder="请输入自动清理日志天数"
              />
              <span class="unit">天</span>
              <div class="form-tip">
                设置为0表示不自动清理日志
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveOtherConfig">保存设置</el-button>
              <el-button @click="handleResetOtherConfig">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 操作成功提示 -->
    <el-notification
      v-if="notification.show"
      :title="notification.title"
      :message="notification.message"
      :type="notification.type"
      :duration="3000"
      @close="notification.show = false"
    />
  </div>
</template>

<script>
export default {
  name: 'SystemConfig',
  data() {
    return {
      activeTab: 'siteInfo',
      uploadUrl: '/api/upload', // 实际应用中替换为真实的上传接口
      notification: {
        show: false,
        title: '',
        message: '',
        type: 'success'
      },
      // 网站信息表单
      siteInfoForm: {
        siteName: '产品溯源系统',
        siteDomain: 'https://example.com',
        contactEmail: 'contact@example.com',
        contactPhone: '400-123-4567',
        icpNumber: '粤ICP备XXXXXXXX号-X',
        siteDescription: '专业的产品溯源管理系统，为企业提供完整的产品溯源解决方案',
        siteLogo: '',
        favicon: ''
      },
      // 溯源码设置表单
      traceabilityForm: {
        codePrefix: 'TS',
        codeLength: 16,
        charSet: ['numbers', 'uppercase'],
        qrCodeSize: 300,
        qrCodeColor: '#000000',
        qrCodeBgColor: '#ffffff'
      },
      // 其他配置表单
      otherConfigForm: {
        pageSize: 20,
        maxFileSize: 10,
        imageQuality: 0.8,
        commentAudit: 1,
        cacheTime: 30,
        logCleanDays: 30
      },
      // 表单验证规则
      siteInfoRules: {
        siteName: [
          { required: true, message: '请输入网站名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        siteDomain: [
          { required: true, message: '请输入网站域名', trigger: 'blur' },
          { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
        ],
        contactEmail: [
          { required: true, message: '请输入联系邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
        ],
        contactPhone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' }
        ],
        icpNumber: [
          { required: true, message: '请输入ICP备案号', trigger: 'blur' }
        ]
      },
      traceabilityRules: {
        codePrefix: [
          { required: true, message: '请输入溯源码前缀', trigger: 'blur' },
          { max: 10, message: '长度不能超过10个字符', trigger: 'blur' }
        ],
        codeLength: [
          { required: true, message: '请输入溯源码长度', trigger: 'blur' }
        ],
        qrCodeSize: [
          { required: true, message: '请输入二维码尺寸', trigger: 'blur' }
        ]
      },
      otherConfigRules: {
        pageSize: [
          { required: true, message: '请选择每页显示条数', trigger: 'blur' }
        ],
        maxFileSize: [
          { required: true, message: '请输入文件上传大小限制', trigger: 'blur' }
        ],
        cacheTime: [
          { required: true, message: '请输入缓存时间', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 在实际应用中，这里应该调用API获取系统配置
    // 这里使用模拟数据，所以不需要额外操作
  },
  methods: {
    // 标签切换处理
    handleTabClick(tab) {
      // 标签切换时的处理逻辑
    },

    // 网站Logo上传前校验
    beforeLogoUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传Logo图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传Logo图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },

    // 网站Logo上传成功处理
    handleLogoUploadSuccess(response) {
      // 在实际应用中，这里应该处理上传成功后的逻辑
      // 这里使用模拟数据
      this.siteInfoForm.siteLogo = URL.createObjectURL(new Blob([response]))
    },

    // Favicon上传前校验
    beforeFaviconUpload(file) {
      const isImage = file.type === 'image/x-icon' || file.type === 'image/png'
      const isLt1M = file.size / 1024 / 1024 < 1

      if (!isImage) {
        this.$message.error('上传Favicon只能是 ICO/PNG 格式!')
      }
      if (!isLt1M) {
        this.$message.error('上传Favicon大小不能超过 1MB!')
      }
      return isImage && isLt1M
    },

    // Favicon上传成功处理
    handleFaviconUploadSuccess(response) {
      // 在实际应用中，这里应该处理上传成功后的逻辑
      // 这里使用模拟数据
      this.siteInfoForm.favicon = URL.createObjectURL(new Blob([response]))
    },

    // 保存网站信息
    handleSaveSiteInfo() {
      this.$refs.siteInfoRef.validate((valid) => {
        if (valid) {
          // 在实际应用中，这里应该调用API保存设置
          this.showNotification('成功', '网站信息保存成功', 'success')
        } else {
          return false
        }
      })
    },

    // 重置网站信息
    handleResetSiteInfo() {
      this.$refs.siteInfoRef.resetFields()
    },

    // 保存溯源码设置
    handleSaveTraceability() {
      this.$refs.traceabilityRef.validate((valid) => {
        if (valid) {
          // 在实际应用中，这里应该调用API保存设置
          this.showNotification('成功', '溯源码设置保存成功', 'success')
        } else {
          return false
        }
      })
    },

    // 重置溯源码设置
    handleResetTraceability() {
      this.$refs.traceabilityRef.resetFields()
    },

    // 保存其他配置
    handleSaveOtherConfig() {
      this.$refs.otherConfigRef.validate((valid) => {
        if (valid) {
          // 在实际应用中，这里应该调用API保存设置
          this.showNotification('成功', '其他配置保存成功', 'success')
        } else {
          return false
        }
      })
    },

    // 重置其他配置
    handleResetOtherConfig() {
      this.$refs.otherConfigRef.resetFields()
    },

    // 显示通知
    showNotification(title, message, type) {
      this.notification = {
        show: true,
        title,
        message,
        type
      }
    }
  }
}
</script>

<style scoped>
.system-config-container {
  padding: 20px;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  line-height: 1;
  padding-top: 8px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 80px;
  line-height: 80px;
  text-align: center;
}

.favicon-icon {
  width: 64px;
  height: 64px;
  line-height: 64px;
}

.avatar {
  width: 200px;
  height: 80px;
  display: block;
}

.favicon {
  width: 64px;
  height: 64px;
  display: block;
}

.unit {
  margin-left: 8px;
  color: #909399;
}

.quality-value {
  margin-left: 10px;
  color: #409eff;
  font-weight: 500;
}
</style>
