<template>
  <div class="media-video-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>媒体资源管理</el-breadcrumb-item>
      <el-breadcrumb-item>视频管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 操作按钮区 -->
    <div class="action-buttons">
      <el-upload
        class="upload-btn"
        action="#"
        :auto-upload="false"
        :on-change="handleVideoSelect"
        multiple
        accept="video/*"
      >
        <el-button type="primary" icon="el-icon-upload2">上传视频</el-button>
      </el-upload>
      <el-button
        type="danger"
        icon="el-icon-delete"
        :disabled="selectedRows.length === 0"
        @click="handleBatchDelete"
      >
        批量删除
      </el-button>
    </div>

    <!-- 搜索筛选区 -->
    <div class="search-section">
      <el-form :inline="true" :model="searchParams" class="search-form">
        <el-form-item label="视频名称">
          <el-input
            v-model="searchParams.name"
            placeholder="请输入视频名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="上传人">
          <el-input
            v-model="searchParams.uploader"
            placeholder="请输入上传人"
            clearable
          />
        </el-form-item>
        <el-form-item label="上传时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="paginatedVideoList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="视频ID" width="180" />
      <el-table-column label="视频封面" width="120">
        <template slot-scope="scope">
          <el-image
            :src="scope.row.coverUrl"
            fit="cover"
            class="preview-thumbnail"
            @click="previewVideo(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="视频名称" />
      <el-table-column prop="size" label="大小" width="100">
        <template slot-scope="scope">
          {{ formatFileSize(scope.row.size) }}
        </template>
      </el-table-column>
      <el-table-column prop="format" label="格式" width="80" />
      <el-table-column prop="duration" label="时长" width="100">
        <template slot-scope="scope">
          {{ formatDuration(scope.row.duration) }}
        </template>
      </el-table-column>
      <el-table-column prop="resolution" label="分辨率" width="100" />
      <el-table-column prop="uploader" label="上传人" width="100" />
      <el-table-column prop="uploadTime" label="上传时间" width="180" />
      <el-table-column prop="usageCount" label="引用次数" width="100" />
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="previewVideo(scope.row)"
          >
            预览
          </el-button>
          <el-button
            type="text"
            size="small"
            @click="copyVideoUrl(scope.row)"
          >
            复制链接
          </el-button>
          <el-button
            type="text"
            size="small"
            class="delete-btn"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next, jumper, total"
        :total="filteredVideoList.length"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 预览视频对话框 -->
    <el-dialog
      :visible.sync="previewDialogVisible"
      :title="previewVideoTitle"
      width="80%"
      fullscreen
    >
      <div class="preview-container">
        <video
          :src="previewVideoUrl"
          controls
          style="width: 100%; max-height: 70vh;"
        >
          您的浏览器不支持HTML5视频播放
        </video>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 确认删除对话框 -->
    <el-dialog
      :visible.sync="confirmDialogVisible"
      title="确认删除"
      :show-close="false"
      width="400px"
    >
      <span>确定要删除选中的视频吗？删除后将无法恢复。</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MediaVideo',
  data() {
    return {
      // 视频列表
      videoList: [],
      // 选中的行
      selectedRows: [],
      // 搜索参数
      searchParams: {
        name: '',
        uploader: '',
        startDate: '',
        endDate: ''
      },
      // 日期范围
      dateRange: null,
      // 分页参数
      currentPage: 1,
      pageSize: 10,
      // 加载状态
      loading: false,
      // 预览对话框状态
      previewDialogVisible: false,
      previewVideoUrl: '',
      previewVideoTitle: '',
      // 确认删除对话框状态
      confirmDialogVisible: false,
      deleteTargetIds: []
    }
  },
  computed: {
    // 过滤后的视频列表
    filteredVideoList() {
      let result = [...this.videoList]

      // 按名称搜索
      if (this.searchParams.name) {
        const keyword = this.searchParams.name.toLowerCase()
        result = result.filter(item => item.name.toLowerCase().includes(keyword))
      }

      // 按上传人搜索
      if (this.searchParams.uploader) {
        const keyword = this.searchParams.uploader.toLowerCase()
        result = result.filter(item => item.uploader.toLowerCase().includes(keyword))
      }

      // 按日期范围过滤
      if (this.searchParams.startDate) {
        result = result.filter(item => new Date(item.uploadTime) >= new Date(this.searchParams.startDate))
      }
      if (this.searchParams.endDate) {
        result = result.filter(item => new Date(item.uploadTime) <= new Date(this.searchParams.endDate))
      }

      // 按上传时间倒序排列
      result.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime))

      return result
    },

    // 分页后的视频列表
    paginatedVideoList() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredVideoList.slice(start, end)
    }
  },
  watch: {
    // 监听日期范围变化
    dateRange: {
      handler(newVal) {
        if (newVal && newVal.length === 2) {
          this.searchParams.startDate = newVal[0]
          this.searchParams.endDate = newVal[1]
        } else {
          this.searchParams.startDate = ''
          this.searchParams.endDate = ''
        }
      },
      immediate: true
    }
  },
  created() {
    this.fetchVideoList()
  },
  methods: {
    // 获取视频列表
    fetchVideoList() {
      this.loading = true
      // 模拟API请求
      setTimeout(() => {
        this.videoList = [
          {
            id: 'video001',
            name: '产品展示视频.mp4',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            coverUrl: 'https://via.placeholder.com/160x90?text=Video+Cover+1',
            size: 25000000,
            format: 'mp4',
            duration: 180,
            resolution: '1080p',
            uploader: 'admin',
            uploadTime: '2023-06-01 14:30:00',
            usageCount: 3
          },
          {
            id: 'video002',
            name: '生产工艺介绍.mp4',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            coverUrl: 'https://via.placeholder.com/160x90?text=Production+Process',
            size: 45000000,
            format: 'mp4',
            duration: 360,
            resolution: '720p',
            uploader: 'editor',
            uploadTime: '2023-06-02 10:15:00',
            usageCount: 2
          },
          {
            id: 'video003',
            name: '公司宣传片.mp4',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            coverUrl: 'https://via.placeholder.com/160x90?text=Company+Promo',
            size: 150000000,
            format: 'mp4',
            duration: 600,
            resolution: '1080p',
            uploader: 'admin',
            uploadTime: '2023-06-03 16:40:00',
            usageCount: 5
          },
          {
            id: 'video004',
            name: '产品使用教程.mp4',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            coverUrl: 'https://via.placeholder.com/160x90?text=Tutorial',
            size: 30000000,
            format: 'mp4',
            duration: 240,
            resolution: '720p',
            uploader: 'productMgr',
            uploadTime: '2023-06-04 09:25:00',
            usageCount: 8
          },
          {
            id: 'video005',
            name: '客户见证.mp4',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            coverUrl: 'https://via.placeholder.com/160x90?text=Customer+Testimonial',
            size: 20000000,
            format: 'mp4',
            duration: 120,
            resolution: '720p',
            uploader: 'marketing',
            uploadTime: '2023-06-05 15:10:00',
            usageCount: 4
          }
        ]
        this.loading = false
      }, 500)
    },

    // 处理视频选择
    handleVideoSelect(file, fileList) {
      // 这里可以处理视频上传逻辑
      this.$message.success(`已选择 ${file.name} 视频`)
    },

    // 处理搜索
    handleSearch() {
      this.currentPage = 1
      // 触发过滤和分页
    },

    // 重置搜索
    resetSearch() {
      this.searchParams = {
        name: '',
        uploader: '',
        startDate: '',
        endDate: ''
      }
      this.dateRange = null
      this.currentPage = 1
    },

    // 处理页码变化
    handleCurrentChange(val) {
      this.currentPage = val
    },

    // 处理页大小变化
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 预览视频
    previewVideo(video) {
      this.previewVideoUrl = video.url
      this.previewVideoTitle = video.name
      this.previewDialogVisible = true
    },

    // 复制视频链接
    copyVideoUrl(row) {
      // 这里可以实现复制到剪贴板的逻辑
      this.$message.success('视频链接已复制到剪贴板')
    },

    // 处理单个删除
    handleDelete(id) {
      this.deleteTargetIds = [id]
      this.confirmDialogVisible = true
    },

    // 处理批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的视频')
        return
      }
      this.deleteTargetIds = this.selectedRows.map(row => row.id)
      this.confirmDialogVisible = true
    },

    // 确认删除
    confirmDelete() {
      this.loading = true
      // 模拟删除操作
      setTimeout(() => {
        this.videoList = this.videoList.filter(item => !this.deleteTargetIds.includes(item.id))
        this.confirmDialogVisible = false
        this.selectedRows = []
        this.loading = false
        this.$message.success('删除成功')
      }, 500)
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 格式化时长
    formatDuration(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.media-video-container {
  padding: 20px;
}

.action-buttons {
  margin-bottom: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.search-form {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.preview-thumbnail {
  width: 90px;
  height: 50px;
  cursor: pointer;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.delete-btn {
  color: #f56c6c;
}
</style>
