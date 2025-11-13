<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item>媒体资源管理</el-breadcrumb-item>
        <el-breadcrumb-item>图片库管理</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 搜索和上传区域 -->
      <div class="search-upload-container">
        <div class="search-section">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索图片名称或标签"
            prefix-icon="el-icon-search"
            style="width: 300px;"
          />
          <el-select
            v-model="searchForm.category"
            placeholder="图片分类"
            style="width: 150px; margin-left: 10px;"
          >
            <el-option label="全部" value="" />
            <el-option label="产品图片" value="product" />
            <el-option label="公司宣传" value="company" />
            <el-option label="生产环境" value="production" />
            <el-option label="质检报告" value="quality" />
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
            accept="image/*"
            multiple
          >
            <el-button type="primary">批量上传图片</el-button>
            <div slot="tip" class="el-upload__tip">
              支持jpg、jpeg、png、gif格式，单张不超过10MB，可批量上传
            </div>
          </el-upload>
        </div>
      </div>

      <!-- 上传进度条 -->
      <div v-if="uploadProgress > 0" class="upload-progress">
        <el-progress :percentage="uploadProgress" :status="uploadStatus" />
      </div>

      <!-- 批量操作工具栏 -->
      <div v-if="selectedImages.length > 0" class="batch-actions">
        <el-button type="danger" size="small" @click="batchDelete">
          批量删除 ({{ selectedImages.length }})
        </el-button>
        <el-button type="primary" size="small" @click="batchUpdateCategory">
          批量修改分类
        </el-button>
        <el-button size="small" @click="batchTag">批量添加标签</el-button>
        <el-button size="small" @click="clearSelection">取消选择</el-button>
      </div>

      <!-- 图片列表 -->
      <div class="image-grid">
        <div v-for="(image, index) in imageList" :key="image.id" class="image-item">
          <el-checkbox v-model="image.selected" @change="handleSelectionChange" />
          <el-image
            :src="image.url"
            :preview-src-list="getImageUrlList()"
            fit="cover"
            class="image-preview"
          >
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline" />
            </div>
          </el-image>
          <div class="image-info">
            <div class="image-name">{{ image.name }}</div>
            <div class="image-meta">
              <el-tag size="mini">{{ getCategoryText(image.category) }}</el-tag>
              <span class="image-size">{{ formatFileSize(image.size) }}</span>
              <span class="image-date">{{ formatDate(image.uploadTime) }}</span>
            </div>
            <div v-if="image.tags && image.tags.length > 0" class="image-tags">
              <el-tag v-for="tag in image.tags" :key="tag" size="mini" type="info">{{ tag }}</el-tag>
            </div>
          </div>
          <div class="image-actions">
            <el-button size="mini" @click="handleEdit(image)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(image, index)">删除</el-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next, jumper, sizes, total"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[20, 40, 60, 80]"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 编辑图片对话框 -->
      <el-dialog
        :visible.sync="editDialogVisible"
        title="编辑图片信息"
        width="600px"
      >
        <el-form ref="editForm" :model="editForm" :rules="editRules" label-width="100px">
          <el-form-item label="图片预览">
            <el-image :src="editForm.url" fit="cover" style="width: 150px; height: 150px;" />
          </el-form-item>
          <el-form-item label="图片名称" prop="name">
            <el-input v-model="editForm.name" />
          </el-form-item>
          <el-form-item label="图片分类" prop="category">
            <el-select v-model="editForm.category" placeholder="请选择图片分类">
              <el-option label="产品图片" value="product" />
              <el-option label="公司宣传" value="company" />
              <el-option label="生产环境" value="production" />
              <el-option label="质检报告" value="quality" />
            </el-select>
          </el-form-item>
          <el-form-item label="图片标签">
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
              <el-option label="产品图片" value="product" />
              <el-option label="公司宣传" value="company" />
              <el-option label="生产环境" value="production" />
              <el-option label="质检报告" value="quality" />
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
  name: 'ImageGallery',
  data() {
    return {
      loading: false,
      imageList: [],
      total: 0,
      pageSize: 20,
      currentPage: 1,
      selectedImages: [],
      uploadProgress: 0,
      uploadStatus: 'success',
      searchForm: {
        keyword: '',
        category: ''
      },
      dateRange: [],
      editDialogVisible: false,
      editForm: {
        id: '',
        name: '',
        url: '',
        category: '',
        tags: [],
        tagInput: ''
      },
      editRules: {
        name: [
          { required: true, message: '请输入图片名称', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择图片分类', trigger: 'change' }
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
        this.imageList = [
          {
            id: 1,
            name: '产品图片1.jpg',
            url: 'https://via.placeholder.com/300x300?text=Product+Image+1',
            size: 1024 * 1024 * 2, // 2MB
            category: 'product',
            tags: ['牛肉', '酱牛肉', '热销'],
            uploadTime: '2025-11-01 10:00:00',
            selected: false
          },
          {
            id: 2,
            name: '公司大门.jpg',
            url: 'https://via.placeholder.com/300x300?text=Company+Gate',
            size: 1024 * 1024 * 3, // 3MB
            category: 'company',
            tags: ['公司', '大门', '形象'],
            uploadTime: '2025-11-01 11:00:00',
            selected: false
          },
          {
            id: 3,
            name: '生产车间.jpg',
            url: 'https://via.placeholder.com/300x300?text=Production+Line',
            size: 1024 * 1024 * 4, // 4MB
            category: 'production',
            tags: ['生产', '车间', '环境'],
            uploadTime: '2025-11-01 14:00:00',
            selected: false
          },
          {
            id: 4,
            name: '质检报告1.jpg',
            url: 'https://via.placeholder.com/300x300?text=Quality+Report',
            size: 1024 * 1024 * 1.5, // 1.5MB
            category: 'quality',
            tags: ['质检', '报告'],
            uploadTime: '2025-11-01 16:00:00',
            selected: false
          },
          {
            id: 5,
            name: '产品图片2.jpg',
            url: 'https://via.placeholder.com/300x300?text=Product+Image+2',
            size: 1024 * 1024 * 2.5, // 2.5MB
            category: 'product',
            tags: ['豆腐', '八公山'],
            uploadTime: '2025-11-02 09:00:00',
            selected: false
          },
          {
            id: 6,
            name: '公司荣誉墙.jpg',
            url: 'https://via.placeholder.com/300x300?text=Honor+Wall',
            size: 1024 * 1024 * 3.5, // 3.5MB
            category: 'company',
            tags: ['荣誉', '证书', '成就'],
            uploadTime: '2025-11-02 10:00:00',
            selected: false
          }
        ]
        this.total = 120
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
      const isImage = file.type.includes('image/')
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
      }
      if (!isLt10M) {
        this.$message.error('上传图片大小不能超过 10MB!')
      }
      return isImage && isLt10M
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
        this.$message({ type: 'success', message: '图片上传成功' })
        this.fetchData()
      }, 500)
    },

    // 上传失败
    handleUploadError(error, file, fileList) {
      this.uploadStatus = 'exception'
      this.$message.error(`图片上传失败: ${error && error.message ? error.message : '未知错误'}`)
    },

    // 获取分类文本
    getCategoryText(category) {
      const categoryMap = {
        product: '产品图片',
        company: '公司宣传',
        production: '生产环境',
        quality: '质检报告'
      }
      return categoryMap[category] || '未分类'
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

    // 格式化日期
    formatDate(dateStr) {
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    },

    // 获取图片URL列表（用于预览）
    getImageUrlList() {
      return this.imageList.map(item => item.url)
    },

    // 选择变化
    handleSelectionChange() {
      this.selectedImages = this.imageList.filter(item => item.selected)
    },

    // 取消选择
    clearSelection() {
      this.imageList.forEach(item => {
        item.selected = false
      })
      this.selectedImages = []
    },

    // 编辑图片
    handleEdit(image) {
      this.editForm = {
        id: image.id,
        name: image.name,
        url: image.url,
        category: image.category,
        tags: [...image.tags],
        tagInput: ''
      }
      this.editDialogVisible = true
    },

    // 删除图片
    handleDelete(image, index) {
      this.$confirm('确定要删除该图片吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟API调用
        setTimeout(() => {
          this.imageList.splice(index, 1)
          this.$message({ type: 'success', message: '删除成功' })
        }, 500)
      }).catch(() => {})
    },

    // 批量删除
    batchDelete() {
      this.$confirm(`确定要删除选中的${this.selectedImages.length}张图片吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟API调用
        setTimeout(() => {
          const selectedIds = this.selectedImages.map(item => item.id)
          this.imageList = this.imageList.filter(item => !selectedIds.includes(item.id))
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
            const image = this.imageList.find(item => item.id === this.editForm.id)
            if (image) {
              image.name = this.editForm.name
              image.category = this.editForm.category
              image.tags = [...this.editForm.tags]
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
            this.selectedImages.forEach(item => {
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
        this.selectedImages.forEach(item => {
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

.batch-actions {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  gap: 10px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.image-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.image-item .el-checkbox {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
}

.image-preview {
  width: 100%;
  height: 200px;
  cursor: pointer;
}

.image-info {
  padding: 10px;
}

.image-name {
  font-weight: 500;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-meta {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #909399;
  gap: 8px;
}

.image-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.image-actions {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  background-color: #f5f7fa;
  gap: 5px;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 200px;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 32px;
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
</style>
