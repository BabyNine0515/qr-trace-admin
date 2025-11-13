<template>
  <div class="media-image-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>媒体资源管理</el-breadcrumb-item>
      <el-breadcrumb-item>图片管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 操作按钮区 -->
    <div class="action-buttons">
      <el-upload
        class="upload-btn"
        action="#"
        :auto-upload="false"
        :on-change="handleImageSelect"
        multiple
        accept="image/*"
      >
        <el-button type="primary" icon="el-icon-upload2">上传图片</el-button>
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
        <el-form-item label="图片名称">
          <el-input
            v-model="searchParams.name"
            placeholder="请输入图片名称"
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
      :data="paginatedImageList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="图片ID" width="180" />
      <el-table-column label="图片预览" width="120">
        <template slot-scope="scope">
          <el-image
            :src="scope.row.url"
            fit="cover"
            class="preview-thumbnail"
            @click="previewImage(scope.row.url)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="图片名称" />
      <el-table-column prop="size" label="大小" width="100">
        <template slot-scope="scope">
          {{ formatFileSize(scope.row.size) }}
        </template>
      </el-table-column>
      <el-table-column prop="format" label="格式" width="80" />
      <el-table-column prop="width" label="宽度" width="80" />
      <el-table-column prop="height" label="高度" width="80" />
      <el-table-column prop="uploader" label="上传人" width="100" />
      <el-table-column prop="uploadTime" label="上传时间" width="180" />
      <el-table-column prop="usageCount" label="引用次数" width="100" />
      <el-table-column label="操作" width="150" fixed="right">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="copyImageUrl(scope.row)"
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
        :total="filteredImageList.length"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 预览图片对话框 -->
    <el-dialog
      :visible.sync="previewDialogVisible"
      title="图片预览"
      width="80%"
    >
      <div class="preview-container">
        <el-image
          :src="previewImageUrl"
          fit="contain"
          style="width: 100%; height: 500px;"
        />
      </div>
    </el-dialog>

    <!-- 确认删除对话框 -->
    <el-dialog
      :visible.sync="confirmDialogVisible"
      title="确认删除"
      :show-close="false"
      width="400px"
    >
      <span>确定要删除选中的图片吗？删除后将无法恢复。</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MediaImage',
  data() {
    return {
      // 图片列表
      imageList: [],
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
      previewImageUrl: '',
      // 确认删除对话框状态
      confirmDialogVisible: false,
      deleteTargetIds: []
    }
  },
  computed: {
    // 过滤后的图片列表
    filteredImageList() {
      let result = [...this.imageList]

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

    // 分页后的图片列表
    paginatedImageList() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredImageList.slice(start, end)
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
    this.fetchImageList()
  },
  methods: {
    // 获取图片列表
    fetchImageList() {
      this.loading = true
      // 模拟API请求
      setTimeout(() => {
        this.imageList = [
          {
            id: 'img001',
            name: '产品主图1.jpg',
            url: 'https://via.placeholder.com/800x600?text=Product+Image+1',
            size: 1024000,
            format: 'jpg',
            width: 800,
            height: 600,
            uploader: 'admin',
            uploadTime: '2023-06-01 10:30:00',
            usageCount: 5
          },
          {
            id: 'img002',
            name: '产品细节图.jpg',
            url: 'https://via.placeholder.com/800x600?text=Product+Detail',
            size: 850000,
            format: 'jpg',
            width: 800,
            height: 600,
            uploader: 'admin',
            uploadTime: '2023-06-01 10:35:00',
            usageCount: 3
          },
          {
            id: 'img003',
            name: '包装展示.png',
            url: 'https://via.placeholder.com/800x600?text=Packaging',
            size: 1500000,
            format: 'png',
            width: 800,
            height: 600,
            uploader: 'editor',
            uploadTime: '2023-06-02 14:20:00',
            usageCount: 2
          },
          {
            id: 'img004',
            name: 'Logo透明背景.png',
            url: 'https://via.placeholder.com/400x400?text=Logo+PNG',
            size: 500000,
            format: 'png',
            width: 400,
            height: 400,
            uploader: 'designer',
            uploadTime: '2023-06-03 09:15:00',
            usageCount: 10
          },
          {
            id: 'img005',
            name: '促销活动Banner.jpg',
            url: 'https://via.placeholder.com/1200x400?text=Promotion+Banner',
            size: 2500000,
            format: 'jpg',
            width: 1200,
            height: 400,
            uploader: 'editor',
            uploadTime: '2023-06-03 16:45:00',
            usageCount: 1
          }
        ]
        this.loading = false
      }, 500)
    },

    // 处理图片选择
    handleImageSelect(file, fileList) {
      // 这里可以处理图片上传逻辑
      this.$message.success(`已选择 ${file.name} 图片`)
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

    // 预览图片
    previewImage(url) {
      this.previewImageUrl = url
      this.previewDialogVisible = true
    },

    // 复制图片链接
    copyImageUrl(row) {
      // 这里可以实现复制到剪贴板的逻辑
      this.$message.success('图片链接已复制到剪贴板')
    },

    // 处理单个删除
    handleDelete(id) {
      this.deleteTargetIds = [id]
      this.confirmDialogVisible = true
    },

    // 处理批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的图片')
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
        this.imageList = this.imageList.filter(item => !this.deleteTargetIds.includes(item.id))
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
    }
  }
}
</script>

<style scoped>
.media-image-container {
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
  width: 60px;
  height: 60px;
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
