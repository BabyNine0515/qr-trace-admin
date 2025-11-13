<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item>公司信息管理</el-breadcrumb-item>
        <el-breadcrumb-item>公司宣传媒体</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 上传区域 -->
      <el-card shadow="never" class="mb-4">
        <template slot="header">
          <div class="card-header">
            <span>上传宣传媒体</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="媒体类型">
              <el-radio-group v-model="uploadSettings.mediaType" @change="handleMediaTypeChange">
                <el-radio label="image">图片</el-radio>
                <el-radio label="video">视频</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用场景">
              <el-select v-model="uploadSettings.scene" placeholder="请选择使用场景">
                <el-option label="首页轮播" value="home_banner" />
                <el-option label="公司介绍" value="company_intro" />
                <el-option label="产品展示" value="product_showcase" />
                <el-option label="企业文化" value="company_culture" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="媒体标题" prop="title">
          <el-input
            v-model="uploadSettings.title"
            placeholder="请输入媒体标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="媒体描述" prop="description">
          <el-input
            v-model="uploadSettings.description"
            type="textarea"
            placeholder="请输入媒体描述"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <!-- 上传组件 -->
        <div class="upload-section">
          <template v-if="uploadSettings.mediaType === 'image'">
            <el-upload
              class="image-uploader"
              action="#"
              :on-success="handleUploadSuccess"
              :before-upload="beforeImageUpload"
              :file-list="tempFileList"
              :multiple="true"
              :limit="5"
              :on-exceed="handleExceed"
              :accept="'.jpg,.jpeg,.png,.gif'"
              list-type="picture-card"
              :auto-upload="false"
            >
              <i class="el-icon-plus" />
              <div class="el-upload__text">点击上传或拖拽文件到此处</div>
              <div slot="tip" class="el-upload__tip">
                支持jpg、jpeg、png、gif格式，单个文件不超过10MB，最多上传5个文件
              </div>
            </el-upload>
          </template>

          <template v-else>
            <el-upload
              class="video-uploader"
              action="#"
              :on-success="handleUploadSuccess"
              :before-upload="beforeVideoUpload"
              :file-list="tempFileList"
              :multiple="true"
              :limit="3"
              :on-exceed="handleExceed"
              :accept="'.mp4,.avi,.mov,.wmv'"
              :auto-upload="false"
            >
              <el-button size="large" type="primary">点击上传视频</el-button>
              <div class="el-upload__tip">
                支持mp4、avi、mov、wmv格式，单个文件不超过100MB，最多上传3个文件
              </div>
            </el-upload>
          </template>
        </div>

        <div v-if="tempFileList.length > 0" class="upload-actions">
          <el-button type="primary" @click="submitUpload">确认上传</el-button>
          <el-button @click="clearTempFiles">取消</el-button>
        </div>
      </el-card>

      <!-- 媒体列表 -->
      <el-card shadow="never">
        <template slot="header">
          <div class="card-header">
            <span>宣传媒体列表 ({{ mediaList.length }})</span>
            <el-button type="danger" size="small" :disabled="!selectedRows.length" @click="batchDelete">
              批量删除 ({{ selectedRows.length }})
            </el-button>
          </div>
        </template>

        <!-- 搜索和筛选 -->
        <el-form :inline="true" class="search-form mb-4">
          <el-form-item label="媒体类型">
            <el-select v-model="searchParams.mediaType" placeholder="全部">
              <el-option label="全部" value="" />
              <el-option label="图片" value="image" />
              <el-option label="视频" value="video" />
            </el-select>
          </el-form-item>
          <el-form-item label="使用场景">
            <el-select v-model="searchParams.scene" placeholder="全部">
              <el-option label="全部" value="" />
              <el-option label="首页轮播" value="home_banner" />
              <el-option label="公司介绍" value="company_intro" />
              <el-option label="产品展示" value="product_showcase" />
              <el-option label="企业文化" value="company_culture" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="searchParams.keyword" placeholder="标题或描述" style="width: 200px;" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="search">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 媒体展示 -->
        <div v-if="filteredMediaList.length > 0" class="media-grid">
          <div
            v-for="item in filteredMediaList"
            :key="item.id"
            class="media-card"
            :class="{ 'selected': isSelected(item.id) }"
          >
            <div class="media-selector" @click.stop="toggleSelection(item)">
              <i v-if="isSelected(item.id)" class="el-icon-check" />
            </div>

            <div class="media-preview" @click="previewMedia(item)">
              <template v-if="item.type === 'image'">
                <el-image :src="item.url" fit="cover" />
              </template>
              <template v-else>
                <div class="video-thumbnail">
                  <el-image :src="item.thumbnailUrl" fit="cover" />
                  <div class="play-icon">
                    <i class="el-icon-video-play" />
                  </div>
                </div>
              </template>
            </div>

            <div class="media-info">
              <h4 class="media-title">{{ item.title }}</h4>
              <p class="media-desc">{{ item.description }}</p>
              <div class="media-meta">
                <el-tag size="small">{{ item.type === 'image' ? '图片' : '视频' }}</el-tag>
                <el-tag size="small" type="info">{{ getSceneLabel(item.scene) }}</el-tag>
                <span class="media-size">{{ formatFileSize(item.size) }}</span>
              </div>
              <div class="media-date">上传时间: {{ item.uploadTime }}</div>
            </div>

            <div class="media-actions">
              <el-button type="primary" size="mini" @click="editMedia(item)">编辑</el-button>
              <el-button size="mini" @click="replaceMedia(item)">替换</el-button>
              <el-button type="danger" size="mini" @click="deleteMedia(item.id)">删除</el-button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <el-empty description="暂无宣传媒体" />
        </div>
      </el-card>

      <!-- 编辑媒体对话框 -->
      <el-dialog
        :visible.sync="editDialogVisible"
        title="编辑宣传媒体"
        :width="'600px'"
      >
        <el-form
          ref="editForm"
          :model="editingItem"
          :rules="editRules"
          label-width="100px"
        >
          <el-form-item label="媒体标题" prop="title">
            <el-input
              v-model="editingItem.title"
              placeholder="请输入媒体标题"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="媒体描述" prop="description">
            <el-input
              v-model="editingItem.description"
              type="textarea"
              placeholder="请输入媒体描述"
              :rows="3"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="使用场景" prop="scene">
            <el-select
              v-model="editingItem.scene"
              placeholder="请选择使用场景"
            >
              <el-option label="首页轮播" value="home_banner" />
              <el-option label="公司介绍" value="company_intro" />
              <el-option label="产品展示" value="product_showcase" />
              <el-option label="企业文化" value="company_culture" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>

          <el-form-item label="显示顺序" prop="sortOrder">
            <el-input-number
              v-model="editingItem.sortOrder"
              :min="1"
              :max="100"
            />
          </el-form-item>

          <el-form-item label="是否启用">
            <el-switch v-model="editingItem.isActive" />
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </div>
      </el-dialog>

      <!-- 替换媒体对话框 -->
      <el-dialog
        :visible.sync="replaceDialogVisible"
        title="替换宣传媒体"
        :width="'500px'"
      >
        <div class="replace-content">
          <p class="replace-title">{{ replaceItem.title }}</p>
          <p class="replace-type">类型: {{ replaceItem.type === 'image' ? '图片' : '视频' }}</p>

          <el-upload
            class="replace-uploader"
            action="#"
            :on-success="handleReplaceSuccess"
            :before-upload="beforeReplaceUpload"
            :auto-upload="false"
          >
            <el-button size="large" type="primary">点击上传新文件</el-button>
            <div class="el-upload__tip">
              {{ replaceItem.type === 'image' ?
                '支持jpg、jpeg、png、gif格式，单个文件不超过10MB' :
                '支持mp4、avi、mov、wmv格式，单个文件不超过100MB' }}
            </div>
          </el-upload>
        </div>

        <div slot="footer" class="dialog-footer">
          <el-button @click="replaceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReplace">确认替换</el-button>
        </div>
      </el-dialog>

      <!-- 预览对话框 -->
      <el-dialog
        :visible.sync="previewDialogVisible"
        :title="previewItem.title || '预览媒体'"
        width="800px"
      >
        <div class="preview-container">
          <template v-if="previewItem.type === 'image'">
            <el-image :src="previewItem.url" fit="contain" style="width: 100%; height: 500px;" />
          </template>
          <template v-else>
            <video :src="previewItem.url" controls style="width: 100%; max-height: 500px;" />
          </template>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CompanyPromotionMedia',
  data() {
    return {
      // 上传设置
      uploadSettings: {
        mediaType: 'image',
        scene: '',
        title: '',
        description: ''
      },
      // 临时文件列表
      tempFileList: [],
      // 媒体列表
      mediaList: [],
      // 选中行
      selectedRows: [],
      // 搜索参数
      searchParams: {
        mediaType: '',
        scene: '',
        keyword: ''
      },
      // 编辑相关
      editDialogVisible: false,
      editingItem: {
        id: '',
        title: '',
        description: '',
        scene: '',
        sortOrder: 1,
        isActive: true
      },
      editRules: {
        title: [
          { required: true, message: '请输入媒体标题', trigger: 'blur' }
        ],
        scene: [
          { required: true, message: '请选择使用场景', trigger: 'change' }
        ]
      },
      // 替换相关
      replaceDialogVisible: false,
      replaceItem: {},
      replaceFile: null,
      // 预览相关
      previewDialogVisible: false,
      previewItem: {}
    }
  },
  computed: {
    // 过滤后的媒体列表
    filteredMediaList() {
      let result = [...this.mediaList]

      // 按类型过滤
      if (this.searchParams.mediaType) {
        result = result.filter(item => item.type === this.searchParams.mediaType)
      }

      // 按场景过滤
      if (this.searchParams.scene) {
        result = result.filter(item => item.scene === this.searchParams.scene)
      }

      // 按关键词搜索
      if (this.searchParams.keyword) {
        const keyword = this.searchParams.keyword.toLowerCase()
        result = result.filter(item =>
          item.title.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword)
        )
      }

      // 按排序号和上传时间排序
      result.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder
        }
        return new Date(b.uploadTime) - new Date(a.uploadTime)
      })

      return result
    }
  },
  created() {
    this.fetchMediaList()
  },
  methods: {
    // 获取媒体列表
    fetchMediaList() {
      // 模拟API请求
      setTimeout(() => {
        this.mediaList = [
          {
            id: '1',
            type: 'image',
            title: '公司总部大楼',
            description: '湖南香泰供应链管理有限公司总部大楼外观',
            url: 'https://via.placeholder.com/800x600?text=Company+Headquarters',
            size: 2048000,
            scene: 'company_intro',
            sortOrder: 1,
            isActive: true,
            uploadTime: '2023-01-15 10:30:00'
          },
          {
            id: '2',
            type: 'image',
            title: '生产基地全景',
            description: '现代化生产基地全景图',
            url: 'https://via.placeholder.com/800x600?text=Production+Base',
            size: 1536000,
            scene: 'product_showcase',
            sortOrder: 2,
            isActive: true,
            uploadTime: '2023-01-16 14:20:00'
          },
          {
            id: '3',
            type: 'video',
            title: '企业宣传片',
            description: '公司2023年度企业宣传片',
            url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
            thumbnailUrl: 'https://via.placeholder.com/800x450?text=Company+Promo',
            size: 10240000,
            scene: 'home_banner',
            sortOrder: 1,
            isActive: true,
            uploadTime: '2023-01-18 09:15:00'
          },
          {
            id: '4',
            type: 'image',
            title: '企业文化墙',
            description: '公司企业文化展示墙',
            url: 'https://via.placeholder.com/800x600?text=Corporate+Culture',
            size: 1843200,
            scene: 'company_culture',
            sortOrder: 1,
            isActive: true,
            uploadTime: '2023-01-20 16:45:00'
          }
        ]
      }, 1000)
    },

    // 处理媒体类型变化
    handleMediaTypeChange() {
      this.tempFileList = []
    },

    // 图片上传前检查
    beforeImageUpload(file) {
      const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isImage) {
        this.$message.error('上传文件只能是图片格式!')
      }
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 10MB!')
      }
      return isImage && isLt10M
    },

    // 视频上传前检查
    beforeVideoUpload(file) {
      const isVideo = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv'].includes(file.type)
      const isLt100M = file.size / 1024 / 1024 < 100

      if (!isVideo) {
        this.$message.error('上传文件只能是视频格式!')
      }
      if (!isLt100M) {
        this.$message.error('上传文件大小不能超过 100MB!')
      }
      return isVideo && isLt100M
    },

    // 替换文件上传前检查
    beforeReplaceUpload(file) {
      this.replaceFile = file
      if (this.replaceItem.type === 'image') {
        return this.beforeImageUpload(file)
      } else {
        return this.beforeVideoUpload(file)
      }
    },

    // 处理文件超出限制
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制最多上传${this.uploadSettings.mediaType === 'image' ? '5' : '3'}个文件`)
    },

    // 处理上传成功
    handleUploadSuccess(response, file, fileList) {
      // 上传成功后，文件会自动添加到fileList
    },

    // 提交上传
    submitUpload() {
      if (this.tempFileList.length === 0) {
        this.$message.warning('请先选择要上传的文件')
        return
      }

      if (!this.uploadSettings.scene) {
        this.$message.warning('请选择使用场景')
        return
      }

      // 模拟上传处理
      setTimeout(() => {
        const newMediaItems = this.tempFileList.map((file, index) => {
          const item = {
            id: Date.now() + index.toString(),
            type: this.uploadSettings.mediaType,
            title: this.uploadSettings.title || file.name,
            description: this.uploadSettings.description,
            url: URL.createObjectURL(file.raw) || file.url,
            size: file.size || 0,
            scene: this.uploadSettings.scene,
            sortOrder: this.getMaxSortOrder() + index + 1,
            isActive: true,
            uploadTime: new Date().toLocaleString('zh-CN')
          }

          // 如果是视频，添加缩略图
          if (this.uploadSettings.mediaType === 'video') {
            item.thumbnailUrl = 'https://via.placeholder.com/800x450?text=Video+Thumbnail'
          }

          return item
        })

        this.mediaList = [...this.mediaList, ...newMediaItems]

        // 重置上传设置
        this.tempFileList = []
        this.uploadSettings.title = ''
        this.uploadSettings.description = ''

        this.$message.success(`成功上传 ${newMediaItems.length} 个宣传媒体`)
      }, 2000)
    },

    // 清空临时文件
    clearTempFiles() {
      this.tempFileList = []
    },

    // 搜索
    search() {
      // 触发计算属性更新
    },

    // 重置搜索
    resetSearch() {
      this.searchParams = {
        mediaType: '',
        scene: '',
        keyword: ''
      }
    },

    // 切换选中状态
    toggleSelection(item) {
      const index = this.selectedRows.findIndex(row => row.id === item.id)
      if (index > -1) {
        this.selectedRows.splice(index, 1)
      } else {
        this.selectedRows.push(item)
      }
    },

    // 判断是否选中
    isSelected(id) {
      return this.selectedRows.some(item => item.id === id)
    },

    // 预览媒体
    previewMedia(item) {
      this.previewItem = { ...item }
      this.previewDialogVisible = true
    },

    // 编辑媒体
    editMedia(item) {
      this.editingItem = { ...item }
      this.editDialogVisible = true
    },

    // 保存编辑
    saveEdit() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          // 模拟保存
          setTimeout(() => {
            const index = this.mediaList.findIndex(item => item.id === this.editingItem.id)
            if (index > -1) {
              this.mediaList.splice(index, 1, { ...this.editingItem })
            }
            this.editDialogVisible = false
            this.$message.success('保存成功')
          }, 1000)
        }
      })
    },

    // 替换媒体
    replaceMedia(item) {
      this.replaceItem = { ...item }
      this.replaceFile = null
      this.replaceDialogVisible = true
    },

    // 处理替换成功
    handleReplaceSuccess(response, file, fileList) {
      // 文件已通过beforeReplaceUpload设置
    },

    // 确认替换
    confirmReplace() {
      if (!this.replaceFile) {
        this.$message.warning('请先选择要替换的文件')
        return
      }

      // 模拟替换
      setTimeout(() => {
        const index = this.mediaList.findIndex(item => item.id === this.replaceItem.id)
        if (index > -1) {
          const updatedItem = { ...this.replaceItem }
          updatedItem.url = URL.createObjectURL(this.replaceFile)
          updatedItem.size = this.replaceFile.size
          updatedItem.uploadTime = new Date().toLocaleString('zh-CN')

          // 如果是视频，更新缩略图
          if (updatedItem.type === 'video') {
            updatedItem.thumbnailUrl = 'https://via.placeholder.com/800x450?text=New+Video+Thumbnail'
          }

          this.mediaList.splice(index, 1, updatedItem)
        }

        this.replaceDialogVisible = false
        this.$message.success('替换成功')
      }, 1500)
    },

    // 删除媒体
    deleteMedia(id) {
      this.$confirm('确定要删除这个宣传媒体吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟删除
        setTimeout(() => {
          this.mediaList = this.mediaList.filter(item => item.id !== id)
          // 从选中列表中移除
          this.selectedRows = this.selectedRows.filter(item => item.id !== id)
          this.$message.success('删除成功')
        }, 500)
      })
    },

    // 批量删除
    batchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的宣传媒体')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 个宣传媒体吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟删除
        setTimeout(() => {
          const idsToDelete = this.selectedRows.map(item => item.id)
          this.mediaList = this.mediaList.filter(item => !idsToDelete.includes(item.id))
          this.selectedRows = []
          this.$message.success(`成功删除 ${idsToDelete.length} 个宣传媒体`)
        }, 500)
      })
    },

    // 获取场景标签
    getSceneLabel(scene) {
      const sceneMap = {
        'home_banner': '首页轮播',
        'company_intro': '公司介绍',
        'product_showcase': '产品展示',
        'company_culture': '企业文化',
        'other': '其他'
      }
      return sceneMap[scene] || '未知场景'
    },

    // 获取最大排序号
    getMaxSortOrder() {
      if (this.mediaList.length === 0) return 0
      return Math.max(...this.mediaList.map(item => item.sortOrder || 0))
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

.search-form {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.upload-actions {
  margin-top: 20px;
  text-align: right;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.media-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  position: relative;
  transition: all 0.3s;
}

.media-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.media-card.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.media-selector {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
}

.media-selector .el-icon-check {
  color: #409eff;
  font-size: 14px;
}

.media-preview {
  width: 100%;
  height: 200px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 15px;
  cursor: pointer;
}

.media-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-thumbnail {
  width: 100%;
  height: 100%;
  position: relative;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.play-icon i {
  color: white;
  font-size: 24px;
}

.media-info {
  margin-bottom: 15px;
}

.media-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.media-desc {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.media-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.media-size {
  color: #909399;
  font-size: 12px;
}

.media-date {
  color: #909399;
  font-size: 12px;
}

.media-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 20px;
}

.replace-content {
  text-align: center;
  padding: 20px 0;
}

.replace-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 10px;
}

.replace-type {
  color: #606266;
  margin-bottom: 30px;
}

.replace-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
