<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item>评论互动管理</el-breadcrumb-item>
        <el-breadcrumb-item>评论列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 操作按钮 -->
      <div class="operation-bar mb-4">
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="batchDelete">
          批量删除 ({{ selectedRows.length }})
        </el-button>
        <el-button @click="refreshList">刷新列表</el-button>
      </div>

      <!-- 搜索和筛选 -->
      <el-form :inline="true" class="search-form mb-4">
        <el-form-item label="评论内容">
          <el-input v-model="searchParams.content" placeholder="请输入评论内容" style="width: 250px;" />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-select v-model="searchParams.productId" placeholder="请选择产品" style="width: 200px;">
            <el-option label="全部产品" value="" />
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="评分">
          <el-rate
            v-model="searchParams.rating"
            :max="5"
            :allow-half="true"
            :show-score="true"
            score-template="≥{value}星"
            placeholder="选择最低评分"
          />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchParams.status" placeholder="请选择审核状态" style="width: 150px;">
            <el-option label="全部" value="" />
            <el-option label="已通过" value="approved" />
            <el-option label="待审核" value="pending" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="评论时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="paginatedCommentList"
        style="width: 100%"
        row-key="id"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="评论ID" width="100" />
        <el-table-column prop="userInfo.nickname" label="用户昵称" width="120">
          <template slot-scope="scope">
            <div class="user-info">
              <el-avatar :src="scope.row.userInfo.avatar" size="small" />
              <span class="ml-2">{{ scope.row.userInfo.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="评论产品" width="180" />
        <el-table-column prop="rating" label="评分" width="100" align="center">
          <template slot-scope="scope">
            <el-rate
              v-model="scope.row.rating"
              :max="5"
              disabled
              allow-half
            />
            <span class="ml-2">{{ scope.row.rating }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" min-width="300">
          <template slot-scope="scope">
            <div class="comment-content">
              <p v-html="formatContent(scope.row.content)" />
              <div v-if="scope.row.images && scope.row.images.length > 0" class="comment-images">
                <el-image
                  v-for="(image, index) in scope.row.images.slice(0, 3)"
                  :key="index"
                  :src="image.url"
                  fit="cover"
                  class="image-thumbnail"
                  @click="previewImage(image.url)"
                />
                <span v-if="scope.row.images.length > 3" class="more-images">+{{ scope.row.images.length - 3 }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="审核状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="likes" label="点赞数" width="80" align="center" />
        <el-table-column prop="replies" label="回复数" width="80" align="center" />
        <el-table-column prop="createdTime" label="评论时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button size="mini" type="danger" @click="deleteComment(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :total="filteredCommentList.length"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :current-page="currentPage"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 评论详情对话框 -->
    <el-dialog
      :visible.sync="detailDialogVisible"
      :title="'评论详情 - ' + (selectedComment ? selectedComment.id : '')"
      :width="'700px'"
    >
      <div class="comment-detail">
        <!-- 评论基本信息 -->
        <div class="comment-header">
          <div class="user-info">
            <el-avatar :src="selectedComment && selectedComment.userInfo ? selectedComment.userInfo.avatar : ''" size="large" />
            <div class="ml-4">
              <h3>{{ selectedComment && selectedComment.userInfo ? selectedComment.userInfo.nickname : '' }}</h3>
              <div class="comment-meta">
                <span class="meta-item">用户ID: {{ selectedComment && selectedComment.userInfo ? selectedComment.userInfo.userId : '' }}</span>
                <span class="meta-item">评论时间: {{ selectedComment ? selectedComment.createdTime : '' }}</span>
                <span class="meta-item">IP地址: {{ selectedComment ? selectedComment.ipAddress : '' }}</span>
              </div>
            </div>
          </div>
          <div class="comment-actions">
            <el-tag :type="getStatusTagType(selectedComment ? selectedComment.status : '')">
              {{ getStatusName(selectedComment ? selectedComment.status : '') }}
            </el-tag>
          </div>
        </div>

        <!-- 评论产品信息 -->
        <div class="product-info">
          <div class="product-item">
            <el-image
              :src="selectedComment ? selectedComment.productImage : ''"
              fit="cover"
              class="product-thumbnail"
            />
            <div class="product-details">
              <h4>{{ selectedComment ? selectedComment.productName : '' }}</h4>
              <div class="product-meta">
                <span>{{ selectedComment ? selectedComment.productBatch : '' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 评分和内容 -->
        <div class="comment-content-section">
          <div class="rating-section">
            <el-rate
              v-model="commentRating"
              :max="5"
              disabled
              allow-half
            />
            <span class="ml-2 rating-score">{{ selectedComment ? selectedComment.rating : '' }}</span>
          </div>
          <div class="content-section">
            <p v-html="selectedComment ? formatContent(selectedComment.content) : ''" />
          </div>
        </div>

        <!-- 评论图片 -->
        <div v-if="selectedComment && selectedComment.images && selectedComment.images.length > 0" class="comment-images-section">
          <h4 class="section-title">评论图片 ({{ selectedComment.images.length }})</h4>
          <div class="image-grid">
            <div
              v-for="(image, index) in selectedComment.images"
              :key="index"
              class="image-item"
              @click="previewImage(image.url)"
            >
              <el-image :src="image.url" fit="cover" class="image-preview" />
            </div>
          </div>
        </div>

        <!-- 点赞和回复统计 -->
        <div class="comment-stats">
          <div class="stat-item">
            <i class="el-icon-thumb" />
            <span>点赞数: {{ selectedComment ? selectedComment.likes : 0 }}</span>
          </div>
          <div class="stat-item">
            <i class="el-icon-chat-line-round" />
            <span>回复数: {{ selectedComment ? selectedComment.replies : 0 }}</span>
          </div>
        </div>

        <!-- 系统操作日志 -->
        <div v-if="selectedComment && selectedComment.operationLogs && selectedComment.operationLogs.length > 0" class="operation-logs">
          <h4 class="section-title">操作日志</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in selectedComment.operationLogs"
              :key="index"
              :timestamp="log.time"
            >
              <div class="log-item">
                <span class="log-action">{{ log.action }}</span>
                <span class="log-operator"> - 操作人: {{ log.operator }}</span>
                <span v-if="log.reason" class="log-reason"> - 原因: {{ log.reason }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 图片预览对话框 -->
    <el-dialog
      :visible.sync="previewDialogVisible"
      title="预览图片"
      width="800px"
    >
      <div class="preview-container">
        <el-image :src="previewImageUrl" fit="contain" style="width: 100%; height: 500px;" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCommentList, deleteComment, batchDeleteComment } from '@/api/comment'

export default {
  name: 'CommentList',
  data() {
    return {
      // 评论列表
      commentList: [],
      // 产品列表（用于关联选择）
      productList: [],
      // 选中的行
      selectedRows: [],
      // 搜索参数
      searchParams: {
        content: '',
        productId: '',
        rating: 0,
        status: '',
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
      // 详情对话框状态
      detailDialogVisible: false,
      selectedComment: null,
      // 预览对话框状态
      previewDialogVisible: false,
      previewImageUrl: ''
    }
  },
  computed: {
    // 过滤后的评论列表
    filteredCommentList() {
      let result = [...this.commentList]

      // 按内容搜索
      if (this.searchParams.content) {
        const keyword = this.searchParams.content.toLowerCase()
        result = result.filter(item => item.content.toLowerCase().includes(keyword))
      }

      // 按产品过滤
      if (this.searchParams.productId) {
        result = result.filter(item => item.productId === this.searchParams.productId)
      }

      // 按评分过滤
      if (this.searchParams.rating > 0) {
        result = result.filter(item => item.rating >= this.searchParams.rating)
      }

      // 按审核状态过滤
      if (this.searchParams.status) {
        result = result.filter(item => item.status === this.searchParams.status)
      }

      // 按日期范围过滤
      if (this.searchParams.startDate) {
        result = result.filter(item => new Date(item.createdTime) >= new Date(this.searchParams.startDate))
      }
      if (this.searchParams.endDate) {
        result = result.filter(item => new Date(item.createdTime) <= new Date(this.searchParams.endDate))
      }

      // 按创建时间倒序排列
      result.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))

      return result
    },

    // 分页后的评论列表
    paginatedCommentList() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredCommentList.slice(start, end)
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
    this.fetchCommentList()
    this.fetchProductList()
  },
  methods: {
    // 获取评论列表
    async fetchCommentList() {
      this.loading = true
      try {
        const params = {
          ...this.searchParams,
          page: this.currentPage,
          pageSize: this.pageSize
        }

        const response = await getCommentList(params)
        this.commentList = response.data || []
      } catch (error) {
        this.$message.error('获取评论列表失败: ' + (error.message || '未知错误'))
        console.error('获取评论列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 获取产品列表
    fetchProductList() {
      // 模拟API请求
      setTimeout(() => {
        this.productList = [
          { id: '101', name: '香泰优质大米' },
          { id: '102', name: '香泰生态米' },
          { id: '103', name: '香泰有机大米' },
          { id: '104', name: '香泰红米' },
          { id: '105', name: '香泰糙米' }
        ]
      }, 500)
    },

    // 搜索
    search() {
      this.currentPage = 1 // 重置到第一页
    },

    // 重置搜索
    resetSearch() {
      this.searchParams = {
        content: '',
        productId: '',
        rating: 0,
        status: '',
        startDate: '',
        endDate: ''
      }
      this.dateRange = null
      this.currentPage = 1
    },

    // 刷新列表
    refreshList() {
      this.fetchCommentList()
    },

    // 处理选择变化
    handleSelectionChange(val) {
      this.selectedRows = val
    },

    // 处理行点击
    handleRowClick(row) {
      this.$refs['commentTable']?.toggleRowSelection(row)
    },

    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },

    handleCurrentChange(val) {
      this.currentPage = val
    },

    // 获取状态名称
    getStatusName(status) {
      const statusMap = {
        'approved': '已通过',
        'pending': '待审核',
        'rejected': '已拒绝'
      }
      return statusMap[status] || '未知'
    },

    // 获取状态标签类型
    getStatusTagType(status) {
      const tagTypeMap = {
        'approved': 'success',
        'pending': 'warning',
        'rejected': 'danger'
      }
      return tagTypeMap[status] || 'default'
    },

    // 格式化评论内容（将换行符转换为HTML换行）
    formatContent(content) {
      if (!content) return ''
      return content.replace(/\n/g, '<br/>')
    },

    // 查看详情
    viewDetail(row) {
      this.selectedComment = JSON.parse(JSON.stringify(row))
      this.detailDialogVisible = true
    },

    // 预览图片
    previewImage(imageUrl) {
      this.previewImageUrl = imageUrl
      this.previewDialogVisible = true
    },

    // 删除评论
    async deleteComment(id) {
      try {
        await this.$confirm('确定要删除这条评论吗？删除后将无法恢复', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.loading = true
        await deleteComment(id)

        // 从列表中移除
        this.commentList = this.commentList.filter(item => item.id !== id)
        // 从选中列表中移除
        this.selectedRows = this.selectedRows.filter(item => item.id !== id)

        this.$message.success('删除成功')
      } catch (error) {
        // 如果是用户取消，不显示错误信息
        if (error !== 'cancel') {
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
        }
      } finally {
        this.loading = false
      }
    },

    // 批量删除
    async batchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请先选择要删除的评论')
        return
      }

      try {
        await this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 条评论吗？删除后将无法恢复`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.loading = true
        const idsToDelete = this.selectedRows.map(item => item.id)
        await batchDeleteComment(idsToDelete)

        this.commentList = this.commentList.filter(item => !idsToDelete.includes(item.id))
        this.selectedRows = []
        this.$message.success(`成功删除 ${idsToDelete.length} 条评论`)
      } catch (error) {
        // 如果是用户取消，不显示错误信息
        if (error !== 'cancel') {
          this.$message.error('批量删除失败: ' + (error.message || '未知错误'))
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.operation-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
}

.search-form {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
}

.comment-content {
  line-height: 1.6;
}

.comment-images {
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.image-thumbnail {
  width: 60px;
  height: 60px;
  margin-right: 5px;
  border-radius: 4px;
  cursor: pointer;
}

.more-images {
  position: relative;
  width: 60px;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  cursor: pointer;
}

/* 详情对话框样式 */
.comment-detail {
  line-height: 1.8;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.comment-meta {
  margin-top: 5px;
}

.meta-item {
  margin-right: 15px;
  color: #909399;
  font-size: 14px;
}

.product-info {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.product-item {
  display: flex;
  align-items: center;
}

.product-thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.product-details {
  margin-left: 15px;
}

.product-meta {
  color: #909399;
  font-size: 14px;
  margin-top: 5px;
}

.comment-content-section {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.rating-section {
  margin-bottom: 10px;
}

.rating-score {
  font-size: 16px;
  color: #f7ba2a;
}

.content-section {
  font-size: 15px;
  line-height: 1.8;
  white-space: pre-wrap;
}

.comment-images-section {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.section-title {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.image-item {
  cursor: pointer;
}

.image-preview {
  width: 100%;
  height: 120px;
  border-radius: 4px;
  transition: transform 0.3s;
}

.image-item:hover .image-preview {
  transform: scale(1.05);
}

.comment-stats {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  align-items: center;
  color: #606266;
}

.stat-item i {
  margin-right: 5px;
  font-size: 16px;
}

.operation-logs {
  padding: 15px 0;
}

.log-item {
  font-size: 14px;
}

.log-action {
  font-weight: 500;
}

.log-operator {
  color: #909399;
}

.log-reason {
  color: #606266;
  margin-left: 5px;
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

@media (max-width: 768px) {
  .operation-bar {
    flex-wrap: wrap;
  }

  .search-form {
    padding: 10px;
  }

  .comment-header {
    flex-direction: column;
    gap: 10px;
  }

  .product-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .product-thumbnail {
    width: 100%;
    max-width: 200px;
  }

  .comment-stats {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
