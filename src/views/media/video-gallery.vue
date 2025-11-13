<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item>媒体资源管理</el-breadcrumb-item>
        <el-breadcrumb-item>视频库管理</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 搜索和上传区域 -->
      <div class="search-upload-container">
        <div class="search-section">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索视频名称或标签"
            prefix-icon="el-icon-search"
            style="width: 300px;"
          />
          <el-select
            v-model="searchForm.category"
            placeholder="视频分类"
            style="width: 150px; margin-left: 10px;"
          >
            <el-option label="全部" value="" />
            <el-option label="产品视频" value="product" />
            <el-option label="公司宣传" value="company" />
            <el-option label="生产过程" value="production" />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 280px; margin-left: 10px;"
          />
          <el-button type="primary" style="margin-left: 10px;" @click="handleSearch">搜索</el-button>
          <el-button style="margin-left: 10px;" @click="resetSearch">重置</el-button>
        </div>

        <div class="upload-section">
          <el-upload
            action="#"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-progress="handleUploadProgress"
            :before-upload="beforeUpload"
            accept="video/*"
            multiple
          >
            <el-button type="primary">上传视频</el-button>
            <div slot="tip" class="el-upload__tip">
              支持MP4、AVI格式，单个不超过100MB，可批量上传
            </div>
          </el-upload>
        </div>
      </div>

      <!-- 上传进度条 -->
      <div v-if="uploadProgress > 0" class="upload-progress">
        <el-progress :percentage="uploadProgress" :status="uploadStatus" />
        <div class="progress-info">正在上传: {{ uploadingFileName }}</div>
      </div>

      <!-- 批量操作工具栏 -->
      <div v-if="selectedVideos.length > 0" class="batch-actions">
        <el-button type="danger" size="small" @click="batchDelete">
          批量删除 ({{ selectedVideos.length }})
        </el-button>
        <el-button type="primary" size="small" @click="batchUpdateCategory">
          批量修改分类
        </el-button>
        <el-button size="small" @click="batchTag">批量添加标签</el-button>
        <el-button size="small" @click="clearSelection">取消选择</el-button>
      </div>

      <!-- 视频列表 -->
      <el-table
        v-loading="loading"
        :data="videoList"
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="视频ID" width="80" />
        <el-table-column prop="name" label="视频名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <div class="video-name">
              <video :src="scope.row.url" poster="https://via.placeholder.com/120x68?text=Video" controls style="width: 120px; height: 68px;" />
              <span class="ml-3">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="视频分类" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.category === 'product'">产品视频</el-tag>
            <el-tag v-else-if="scope.row.category === 'company'" type="success">公司宣传</el-tag>
            <el-tag v-else-if="scope.row.category === 'production'" type="warning">生产过程</el-tag>
            <el-tag v-else type="info">未分类</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="80">
          <template slot-scope="scope">
            {{ formatDuration(scope.row.duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100">
          <template slot-scope="scope">
            {{ formatFileSize(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="format" label="格式" width="80" />
        <el-table-column prop="tags" label="标签" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tag v-for="tag in scope.row.tags" :key="tag" size="mini" type="info" class="mr-1">{{ tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="handlePreview(scope.row)">预览</el-button>
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next, jumper, sizes, total"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 视频预览对话框 -->
      <el-dialog
        :visible.sync="previewDialogVisible"
        title="视频预览"
        width="800px"
        class="video-preview-dialog"
      >
        <video :src="previewVideoUrl" controls style="width: 100%; max-height: 500px;" />
        <div slot="footer" class="video-info">
          <span>{{ previewVideoName }}</span>
        </div>
      </el-dialog>

      <!-- 编辑视频对话框 -->
      <el-dialog
        :visible.sync="editDialogVisible"
        title="编辑视频信息"
        width="600px"
      >
        <el-form ref="editForm" :model="editForm" :rules="editRules" label-width="100px">
          <el-form-item label="视频名称" prop="name">
            <el-input v-model="editForm.name" />
          </el-form-item>
          <el-form-item label="视频分类" prop="category">
            <el-select v-model="editForm.category" placeholder="请选择视频分类">
              <el-option label="产品视频" value="product" />
              <el-option label="公司宣传" value="company" />
              <el-option label="生产过程" value="production" />
            </el-select>
          </el-form-item>
          <el-form-item label="视频标签">
            <el-input
              v-model="editForm.tagInput"
              placeholder="输入标签后按回车添加"
              @keyup.enter.native="addTag"
            />
            <div class="tag-list">
              <el-tag
                v-for="(tag, index) in editForm.tags"
                :key="tag"
                closable
                @close="removeTag(index)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm">确定</el-button>
        </div>
      </el-dialog>

      <!-- 批量修改分类对话框 -->
      <el-dialog
        :visible.sync="batchCategoryDialogVisible"
        title="批量修改分类"
        width="400px"
      >
        <el-form ref="batchCategoryForm" :model="batchCategoryForm" :rules="batchCategoryRules" label-width="100px">
          <el-form-item label="目标分类" prop="category">
            <el-select v-model="batchCategoryForm.category" placeholder="请选择分类">
              <el-option label="产品视频" value="product" />
              <el-option label="公司宣传" value="company" />
              <el-option label="生产过程" value="production" />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="batchCategoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBatchCategory">确定</el-button>
        </div>
      </el-dialog>

      <!-- 批量添加标签对话框 -->
      <el-dialog
        :visible.sync="batchTagDialogVisible"
        title="批量添加标签"
        width="400px"
      >
        <el-form ref="batchTagForm" :model="batchTagForm" :rules="batchTagRules" label-width="100px">
          <el-form-item label="标签" prop="tags">
            <el-input
              v-model="batchTagForm.tagInput"
              placeholder="输入标签后按回车添加"
              @keyup.enter.native="addBatchTag"
            />
            <div class="tag-list">
              <el-tag
                v-for="(tag, index) in batchTagForm.tags"
                :key="tag"
                closable
                @close="removeBatchTag(index)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="batchTagDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBatchTag">确定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'VideoGallery',
  data() {
    return {
      loading: false,
      videoList: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      selectedVideos: [],
      uploadProgress: 0,
      uploadStatus: 'success',
      uploadingFileName: '',
      searchForm: {
        keyword: '',
        category: ''
      },
      dateRange: [],
      previewDialogVisible: false,
      previewVideoUrl: '',
      previewVideoName: '',
      editDialogVisible: false,
      editForm: {
        id: '',
        name: '',
        category: '',
        tags: [],
        tagInput: ''
      },
      editRules: {
        name: [
          { required: true, message: '请输入视频名称', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择视频分类', trigger: 'change' }
        ]
      },
      batchCategoryDialogVisible: false,
      batchCategoryForm: {
        category: ''
      },
      batchCategoryRules: {
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ]
      },
      batchTagDialogVisible: false,
      batchTagForm: {
        tags: [],
        tagInput: ''
      },
      batchTagRules: {
        tags: [
          { required: true, message: '请至少添加一个标签', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取数据
    fetchData() {
      this.loading = true
      // 模拟API调用
      setTimeout(() => {
        this.videoList = [
          {
            id: 1,
            name: '产品宣传片.mp4',
            url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
            size: 1024 * 1024 * 50, // 50MB
            duration: 300, // 5分钟
            format: 'mp4',
            category: 'product',
            tags: ['产品', '宣传', '推广'],
            uploadTime: '2025-11-01 10:00:00'
          },
          {
            id: 2,
            name: '公司介绍视频.mp4',
            url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
            size: 1024 * 1024 * 80, // 80MB
            duration: 600, // 10分钟
            format: 'mp4',
            category: 'company',
            tags: ['公司', '介绍', '文化'],
            uploadTime: '2025-11-01 14:00:00'
          },
          {
            id: 3,
            name: '生产工艺流程.mp4',
            url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
            size: 1024 * 1024 * 100, // 100MB
            duration: 1200, // 20分钟
            format: 'mp4',
            category: 'production',
            tags: ['生产', '工艺', '流程'],
            uploadTime: '2025-11-02 09:00:00'
          }
        ]
        this.total = 50
        this.loading = false
      }, 1000)
    },

    // 搜索
    handleSearch() {
      this.currentPage = 1
      this.fetchData()
    },

    // 重置搜索
    resetSearch() {
      this.searchForm = {
        keyword: '',
        category: ''
      }
      this.dateRange = []
      this.currentPage = 1
      this.fetchData()
    },

    // 上传前检查
    beforeUpload(file) {
      const isVideo = file.type.includes('video/')
      const isLt100M = file.size / 1024 / 1024 < 100

      if (!isVideo) {
        this.$message.error('只能上传视频文件!')
      }
      if (!isLt100M) {
        this.$message.error('上传视频大小不能超过 100MB!')
      }
      this.uploadingFileName = file.name
      return isVideo && isLt100M
    },

    // 上传进度
    handleUploadProgress(event, file, fileList) {
      this.uploadProgress = Math.floor(event.percent)
    },

    // 上传成功
    handleUploadSuccess(response, file, fileList) {
      // 模拟上传成功
      this.uploadStatus = 'success'
      setTimeout(() => {
        this.uploadProgress = 0
        this.uploadingFileName = ''
        this.$message({ type: 'success', message: '视频上传成功' })
        this.fetchData()
      }, 500)
    },

    // 上传失败
    handleUploadError(error, file, fileList) {
      this.uploadStatus = 'exception'
      console.error('视频上传失败原因:', error)
      this.$message.error(`视频上传失败: ${error && error.message ? error.message : '未知错误'}`)
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes < 1024) {
        return bytes + ' B'
      } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB'
      } else if (bytes < 1024 * 1024 * 1024) {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB'
      } else {
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
      }
    },

    // 格式化视频时长
    formatDuration(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.selectedVideos = selection
    },

    // 取消选择
    clearSelection() {
      this.$refs.videoTable.clearSelection()
      this.selectedVideos = []
    },

    // 预览视频
    handlePreview(video) {
      this.previewVideoUrl = video.url
      this.previewVideoName = video.name
      this.previewDialogVisible = true
    },

    // 编辑视频信息
    handleEdit(video) {
      this.editForm = {
        id: video.id,
        name: video.name,
        category: video.category,
        tags: [...video.tags],
        tagInput: ''
      }
      this.editDialogVisible = true
    },

    // 删除视频
    handleDelete(video) {
      this.$confirm('确定要删除该视频吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟API调用
        setTimeout(() => {
          const index = this.videoList.findIndex(item => item.id === video.id)
          if (index > -1) {
            this.videoList.splice(index, 1)
          }
          this.$message({ type: 'success', message: '删除成功' })
        }, 500)
      }).catch(() => {})
    },

    // 批量删除
    batchDelete() {
      this.$confirm(`确定要删除选中的${this.selectedVideos.length}个视频吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟API调用
        setTimeout(() => {
          const selectedIds = this.selectedVideos.map(item => item.id)
          this.videoList = this.videoList.filter(item => !selectedIds.includes(item.id))
          this.$message({ type: 'success', message: '批量删除成功' })
          this.clearSelection()
        }, 500)
      }).catch(() => {})
    },

    // 添加标签
    addTag() {
      if (this.editForm.tagInput && !this.editForm.tags.includes(this.editForm.tagInput)) {
        this.editForm.tags.push(this.editForm.tagInput)
        this.editForm.tagInput = ''
      }
    },

    // 移除标签
    removeTag(index) {
      this.editForm.tags.splice(index, 1)
    },

    // 提交编辑表单
    submitEditForm() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          // 模拟API调用
          setTimeout(() => {
            const video = this.videoList.find(item => item.id === this.editForm.id)
            if (video) {
              video.name = this.editForm.name
              video.category = this.editForm.category
              video.tags = [...this.editForm.tags]
            }
            this.$message({ type: 'success', message: '编辑成功' })
            this.editDialogVisible = false
          }, 500)
        }
      })
    },

    // 批量修改分类
    batchUpdateCategory() {
      this.batchCategoryForm.category = ''
      this.batchCategoryDialogVisible = true
    },

    // 提交批量分类修改
    submitBatchCategory() {
      this.$refs.batchCategoryForm.validate((valid) => {
        if (valid) {
          // 模拟API调用
          setTimeout(() => {
            this.selectedVideos.forEach(item => {
              item.category = this.batchCategoryForm.category
            })
            this.$message({ type: 'success', message: '批量修改分类成功' })
            this.batchCategoryDialogVisible = false
          }, 500)
        }
      })
    },

    // 批量添加标签
    batchTag() {
      this.batchTagForm.tags = []
      this.batchTagForm.tagInput = ''
      this.batchTagDialogVisible = true
    },

    // 添加批量标签
    addBatchTag() {
      if (this.batchTagForm.tagInput && !this.batchTagForm.tags.includes(this.batchTagForm.tagInput)) {
        this.batchTagForm.tags.push(this.batchTagForm.tagInput)
        this.batchTagForm.tagInput = ''
      }
    },

    // 移除批量标签
    removeBatchTag(index) {
      this.batchTagForm.tags.splice(index, 1)
    },

    // 提交批量标签添加
    submitBatchTag() {
      // 模拟API调用
      setTimeout(() => {
        this.selectedVideos.forEach(item => {
          this.batchTagForm.tags.forEach(tag => {
            if (!item.tags.includes(tag)) {
              item.tags.push(tag)
            }
          })
        })
        this.$message({ type: 'success', message: '批量添加标签成功' })
        this.batchTagDialogVisible = false
      }, 500)
    },

    // 分页大小变化
    handleSizeChange(size) {
      this.pageSize = size
      this.fetchData()
    },

    // 页码变化
    handleCurrentChange(current) {
      this.currentPage = current
      this.fetchData()
    }
  }
}
</script>

<style scoped>
.search-upload-container {
  margin-bottom: 20px;
}

.search-section {
  margin-bottom: 15px;
}

.upload-progress {
  margin-bottom: 15px;
}

.progress-info {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
}

.batch-actions {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  gap: 10px;
}

.video-name {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.tag-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.video-preview-dialog .el-dialog__footer {
  text-align: left;
  padding: 15px 20px 20px;
  background-color: #f5f7fa;
}

.video-info {
  font-size: 14px;
  color: #606266;
}
</style>
