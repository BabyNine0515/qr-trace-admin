<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item>媒体资源管理</el-breadcrumb-item>
        <el-breadcrumb-item>媒体文件上传</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 上传设置 -->
      <el-card shadow="never" class="mb-4">
        <template slot="header">
          <div class="card-header">
            <span>上传设置</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="文件类型" prop="fileType">
              <el-radio-group v-model="uploadSettings.fileType">
                <el-radio label="image">图片文件</el-radio>
                <el-radio label="video">视频文件</el-radio>
                <el-radio label="document">文档文件</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="文件分类" prop="category">
              <el-select v-model="uploadSettings.category" placeholder="请选择文件分类">
                <el-option v-for="category in getAvailableCategories()" :key="category.value" :label="category.label" :value="category.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="自动生成缩略图">
              <el-switch v-model="uploadSettings.generateThumbnail" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="uploadSettings.fileType === 'video'" :gutter="20">
          <el-col :span="8">
            <el-form-item label="视频格式转换">
              <el-switch v-model="uploadSettings.convertFormat" @change="handleConvertFormatChange" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item v-if="uploadSettings.convertFormat" label="目标格式" prop="targetFormat">
              <el-select v-model="uploadSettings.targetFormat" placeholder="请选择目标格式">
                <el-option label="MP4" value="mp4" />
                <el-option label="WebM" value="webm" />
                <el-option label="AVI" value="avi" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item v-if="uploadSettings.convertFormat" label="清晰度" prop="resolution">
              <el-select v-model="uploadSettings.resolution" placeholder="请选择清晰度">
                <el-option label="480P" value="480p" />
                <el-option label="720P" value="720p" />
                <el-option label="1080P" value="1080p" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="添加标签" prop="tags">
          <el-input
            v-model="uploadSettings.tagInput"
            placeholder="输入标签后按回车添加"
            style="width: 300px;"
            @keyup.enter.native="addTag"
          />
          <div class="tag-list">
            <el-tag
              v-for="(tag, index) in uploadSettings.tags"
              :key="tag"
              closable
              @close="removeTag(index)"
            >
              {{ tag }}
            </el-tag>
          </div>
        </el-form-item>
      </el-card>

      <!-- 上传区域 -->
      <div class="upload-area">
        <el-upload
          v-model="fileList"
          drag
          action="#"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-progress="handleUploadProgress"
          :before-upload="beforeUpload"
          :before-exceed="handleExceed"
          :multiple="true"
          :accept="getAcceptType()"
          :auto-upload="true"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" class="el-upload__tip">
            {{ getUploadTip() }}
          </div>
        </el-upload>
      </div>

      <!-- 上传进度和状态 -->
      <div v-if="uploadTasks.length > 0" class="upload-status">
        <el-card shadow="never">
          <template slot="header">
            <div class="card-header">
              <span>上传任务 ({{ uploadTasks.length }})</span>
              <el-button type="danger" size="small" @click="clearAllTasks">清空</el-button>
            </div>
          </template>

          <div v-for="task in uploadTasks" :key="task.id" class="task-item">
            <div class="task-header">
              <div class="task-info">
                <span class="file-name">{{ task.name }}</span>
                <span class="file-size">{{ formatFileSize(task.size) }}</span>
              </div>
              <div class="task-status">
                <el-tag v-if="task.status === 'uploading'" type="primary">上传中</el-tag>
                <el-tag v-else-if="task.status === 'success'" type="success">上传成功</el-tag>
                <el-tag v-else-if="task.status === 'error'" type="danger">上传失败</el-tag>
                <el-tag v-else-if="task.status === 'converting'" type="warning">转换中</el-tag>
              </div>
            </div>
            <div class="task-progress">
              <el-progress :percentage="task.progress" :status="getStatusColor(task.status)" />
              <div class="progress-info">
                <span>{{ formatFileSize(task.uploadedSize) }} / {{ formatFileSize(task.size) }}</span>
                <span v-if="task.status === 'uploading'">- {{ task.speed }}/s</span>
              </div>
            </div>
            <div class="task-actions">
              <el-button
                v-if="task.status === 'uploading' || task.status === 'converting'"
                size="mini"
                @click="cancelUpload(task.id)"
              >
                取消
              </el-button>
              <el-button
                v-if="task.status === 'error'"
                size="mini"
                type="primary"
                @click="retryUpload(task.id)"
              >
                重试
              </el-button>
              <el-button
                v-if="task.status === 'success'"
                size="mini"
                @click="previewFile(task)"
              >
                预览
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 已完成上传文件列表 -->
      <div v-if="completedFiles.length > 0" class="completed-files">
        <el-card shadow="never">
          <template slot="header">
            <div class="card-header">
              <span>已完成上传 ({{ completedFiles.length }})</span>
              <el-button size="small" @click="clearCompletedFiles">清空</el-button>
            </div>
          </template>

          <el-table :data="completedFiles" style="width: 100%;">
            <el-table-column prop="name" label="文件名称" show-overflow-tooltip />
            <el-table-column prop="type" label="文件类型" width="100" />
            <el-table-column prop="size" label="文件大小" width="100">
              <template slot-scope="scope">
                {{ formatFileSize(scope.row.size) }}
              </template>
            </el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="180" />
            <el-table-column label="操作" width="100" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" @click="previewFile(scope.row)">预览</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 预览对话框 -->
      <el-dialog
        :visible.sync="previewDialogVisible"
        :title="previewFileInfo.name"
        :width="previewFileInfo.type.includes('video') ? '800px' : '600px'"
      >
        <template v-if="previewFileInfo.type.includes('image')">
          <el-image :src="previewFileInfo.url" fit="contain" style="width: 100%; height: 400px;" />
        </template>
        <template v-else-if="previewFileInfo.type.includes('video')">
          <video :src="previewFileInfo.url" controls style="width: 100%; max-height: 500px;" />
        </template>
        <template v-else>
          <div class="file-preview-info">
            <p>文件名: {{ previewFileInfo.name }}</p>
            <p>文件大小: {{ formatFileSize(previewFileInfo.size) }}</p>
            <p>上传时间: {{ previewFileInfo.uploadTime }}</p>
            <p>文件类型: {{ previewFileInfo.type }}</p>
            <el-button type="primary" @click="downloadFile(previewFileInfo)">下载文件</el-button>
          </div>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'MediaUpload',
  data() {
    return {
      fileList: [],
      uploadTasks: [],
      completedFiles: [],
      uploadSettings: {
        fileType: 'image',
        category: '',
        generateThumbnail: true,
        convertFormat: false,
        targetFormat: 'mp4',
        resolution: '720p',
        tags: [],
        tagInput: ''
      },
      previewDialogVisible: false,
      previewFileInfo: {}
    }
  },
  methods: {
    // 获取可用分类
    getAvailableCategories() {
      const categories = {
        image: [
          { label: '产品图片', value: 'product' },
          { label: '公司宣传', value: 'company' },
          { label: '生产环境', value: 'production' },
          { label: '质检报告', value: 'quality' }
        ],
        video: [
          { label: '产品视频', value: 'product' },
          { label: '公司宣传', value: 'company' },
          { label: '生产过程', value: 'production' }
        ],
        document: [
          { label: '质检报告', value: 'quality' },
          { label: '资质证书', value: 'certificate' },
          { label: '其他文档', value: 'other' }
        ]
      }
      return categories[this.uploadSettings.fileType] || []
    },

    // 处理格式转换开关变化
    handleConvertFormatChange() {
      if (this.uploadSettings.convertFormat) {
        this.uploadSettings.targetFormat = 'mp4'
        this.uploadSettings.resolution = '720p'
      }
    },

    // 添加标签
    addTag() {
      if (this.uploadSettings.tagInput && !this.uploadSettings.tags.includes(this.uploadSettings.tagInput)) {
        this.uploadSettings.tags.push(this.uploadSettings.tagInput)
        this.uploadSettings.tagInput = ''
      }
    },

    // 移除标签
    removeTag(index) {
      this.uploadSettings.tags.splice(index, 1)
    },

    // 获取接受的文件类型
    getAcceptType() {
      const acceptTypes = {
        image: 'image/*',
        video: 'video/*',
        document: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'
      }
      return acceptTypes[this.uploadSettings.fileType] || '*'
    },

    // 获取上传提示
    getUploadTip() {
      const tips = {
        image: '支持jpg、jpeg、png、gif格式，单张不超过10MB',
        video: '支持mp4、avi格式，单个不超过100MB',
        document: '支持常见文档格式，单个不超过50MB'
      }
      return tips[this.uploadSettings.fileType] || '请选择文件上传'
    },

    // 文件上传前检查
    beforeUpload(file) {
      const fileType = this.uploadSettings.fileType
      const fileExtension = file.name.split('.').pop().toLowerCase()
      let isAllowedType = false
      let maxSize = 10 * 1024 * 1024 // 默认10MB

      // 根据文件类型检查
      switch (fileType) {
        case 'image':
          isAllowedType = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)
          maxSize = 10 * 1024 * 1024 // 10MB
          break
        case 'video':
          isAllowedType = ['mp4', 'avi', 'webm'].includes(fileExtension)
          maxSize = 100 * 1024 * 1024 // 100MB
          break
        case 'document':
          isAllowedType = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(fileExtension)
          maxSize = 50 * 1024 * 1024 // 50MB
          break
      }

      const isLtMaxSize = file.size < maxSize

      if (!isAllowedType) {
        this.$message.error(`不支持的文件格式，请上传${this.getUploadTip()}`)
      }
      if (!isLtMaxSize) {
        this.$message.error(`文件大小不能超过${this.formatFileSize(maxSize)}`)
      }

      if (isAllowedType && isLtMaxSize) {
        // 创建上传任务
        const taskId = Date.now() + Math.random().toString(36).substr(2, 9)
        this.uploadTasks.push({
          id: taskId,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedSize: 0,
          progress: 0,
          status: 'uploading',
          speed: '0 MB',
          startTime: Date.now(),
          settings: {
            ...this.uploadSettings,
            tags: [...this.uploadSettings.tags]
          }
        })
      }

      return isAllowedType && isLtMaxSize
    },

    // 处理文件超出数量限制
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制只能上传${this.uploadSettings.multiple ? '多个' : '1个'}文件`)
    },

    // 处理上传进度
    handleUploadProgress(event, file, fileList) {
      const task = this.uploadTasks.find(t => t.name === file.name && t.status === 'uploading')
      if (task) {
        const progress = Math.floor(event.percent)
        const uploadedSize = (progress / 100) * task.size
        const elapsedTime = (Date.now() - task.startTime) / 1000 // 秒
        const speed = uploadedSize / elapsedTime // 字节/秒

        task.progress = progress
        task.uploadedSize = uploadedSize
        task.speed = this.formatFileSize(speed)

        // 模拟上传完成后的处理
        if (progress === 100 && this.uploadSettings.fileType === 'video' && this.uploadSettings.convertFormat) {
          task.status = 'converting'
          this.simulateFormatConversion(task)
        }
      }
    },

    // 模拟格式转换
    simulateFormatConversion(task) {
      setTimeout(() => {
        task.progress = 100
        task.status = 'success'
        this.moveToCompleted(task)
      }, 3000) // 模拟3秒转换时间
    },

    // 处理上传成功
    handleUploadSuccess(response, file, fileList) {
      const task = this.uploadTasks.find(t => t.name === file.name && (t.status === 'uploading' || t.status === 'converting'))
      if (task) {
        task.progress = 100
        task.status = 'success'
        this.moveToCompleted(task)
      }
    },

    // 处理上传失败
    handleUploadError(error, file, fileList) {
      const task = this.uploadTasks.find(t => t.name === file.name)
      if (task) {
        task.status = 'error'
        // 添加错误提示
        this.$message.error(`文件上传失败: ${error && error.message ? error.message : '未知错误'}`)
      }
    },

    // 将任务移到已完成列表
    moveToCompleted(task) {
      this.completedFiles.push({
        id: task.id,
        name: task.name,
        size: task.size,
        type: task.type,
        uploadTime: new Date().toLocaleString(),
        url: this.getMockFileUrl(task),
        settings: task.settings
      })

      // 从任务列表移除
      setTimeout(() => {
        const index = this.uploadTasks.findIndex(t => t.id === task.id)
        if (index > -1) {
          this.uploadTasks.splice(index, 1)
        }
      }, 2000)
    },

    // 获取模拟文件URL
    getMockFileUrl(task) {
      if (task.type.includes('image')) {
        return 'https://via.placeholder.com/800x600?text=Uploaded+Image'
      } else if (task.type.includes('video')) {
        return 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
      } else {
        return '#'
      }
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes < 1024) {
        return bytes + ' B'
      } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB'
      } else {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB'
      }
    },

    // 获取状态颜色
    getStatusColor(status) {
      const statusColors = {
        uploading: 'primary',
        success: 'success',
        error: 'exception',
        converting: 'warning'
      }
      return statusColors[status] || 'info'
    },

    // 取消上传
    cancelUpload(taskId) {
      const index = this.uploadTasks.findIndex(t => t.id === taskId)
      if (index > -1) {
        this.uploadTasks.splice(index, 1)
        this.$message({ type: 'info', message: '上传已取消' })
      }
    },

    // 重试上传
    retryUpload(taskId) {
      const task = this.uploadTasks.find(t => t.id === taskId)
      if (task) {
        task.status = 'uploading'
        task.progress = 0
        task.uploadedSize = 0
        task.startTime = Date.now()
        task.speed = '0 MB'
        // 这里应该重新触发上传，为简化，我们只更新状态
        setTimeout(() => {
          task.progress = 100
          task.status = 'success'
          this.moveToCompleted(task)
        }, 2000)
      }
    },

    // 清空所有任务
    clearAllTasks() {
      this.uploadTasks = []
    },

    // 清空已完成文件
    clearCompletedFiles() {
      this.completedFiles = []
    },

    // 预览文件
    previewFile(file) {
      this.previewFileInfo = { ...file }
      this.previewDialogVisible = true
    },

    // 下载文件
    downloadFile(file) {
      this.$message({ type: 'info', message: '文件下载功能开发中...' })
    }
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-area {
  margin-bottom: 30px;
}

.upload-status {
  margin-bottom: 30px;
}

.task-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.task-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-name {
  font-weight: 500;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.task-progress {
  margin-bottom: 10px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
}

.tag-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.file-preview-info {
  padding: 20px;
  text-align: center;
}

.file-preview-info p {
  margin-bottom: 10px;
  color: #606266;
}
</style>
