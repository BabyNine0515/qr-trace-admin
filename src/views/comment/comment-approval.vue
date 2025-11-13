<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item>评论互动管理</el-breadcrumb-item>
        <el-breadcrumb-item>评论审核</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 操作按钮 -->
      <div class="operation-bar mb-4">
        <el-button type="primary" :disabled="selectedRows.length === 0" @click="batchApprove">
          批量通过 ({{ selectedRows.length }})
        </el-button>
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="batchReject">
          批量拒绝 ({{ selectedRows.length }})
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
        ref="commentTable"
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
        <el-table-column prop="createdTime" label="评论时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.status === 'pending'"
              size="mini"
              type="primary"
              @click="approveComment(scope.row.id)"
            >
              通过
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              size="mini"
              type="danger"
              @click="rejectComment(scope.row.id)"
            >
              拒绝
            </el-button>
            <el-button size="mini" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button size="mini" @click="replyComment(scope.row)">回复</el-button>
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
            <div v-if="selectedComment && selectedComment.status === 'pending'" class="action-buttons">
              <el-button
                size="mini"
                type="primary"
                @click="approveComment(selectedComment.id, true)"
              >
                通过
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="rejectComment(selectedComment.id, true)"
              >
                拒绝
              </el-button>
            </div>
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
              :value="selectedComment ? selectedComment.rating : 0"
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

        <!-- 评论回复 -->
        <div v-if="selectedComment && selectedComment.replies && selectedComment.replies.length > 0" class="comment-replies-section">
          <h4 class="section-title">回复列表 ({{ selectedComment.replies.length }})</h4>
          <div class="reply-list">
            <div v-for="(reply, index) in selectedComment.replies" :key="index" class="reply-item">
              <div class="reply-header">
                <span class="reply-author">{{ reply.author }}</span>
                <span class="reply-time">{{ reply.time }}</span>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
            </div>
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

    <!-- 回复评论对话框 -->
    <el-dialog
      :visible.sync="replyDialogVisible"
      :title="'回复评论 - ' + (replyTargetComment ? replyTargetComment.id : '')"
      :width="'500px'"
    >
      <el-form ref="replyForm" :model="replyForm" :rules="replyRules">
        <el-form-item label="用户昵称" prop="userName">
          <el-input v-model="replyForm.userName" disabled />
        </el-form-item>
        <el-form-item label="评论内容" prop="commentContent">
          <el-input
            v-model="replyForm.commentContent"
            type="textarea"
            :rows="3"
            disabled
          />
        </el-form-item>
        <el-form-item label="回复内容" prop="replyContent">
          <el-input
            v-model="replyForm.replyContent"
            type="textarea"
            :rows="4"
            placeholder="请输入回复内容"
          />
        </el-form-item>
        <el-form-item label="回复方式">
          <el-radio-group v-model="replyForm.replyType">
            <el-radio label="public">公开回复 (显示在评论下方)</el-radio>
            <el-radio label="private">私信回复 (仅用户可见)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelReply">取消</el-button>
        <el-button type="primary" @click="submitReply">提交回复</el-button>
      </div>
    </el-dialog>

    <!-- 拒绝理由对话框 -->
    <el-dialog
      :visible.sync="rejectReasonDialogVisible"
      title="拒绝理由"
      :width="'400px'"
    >
      <el-form ref="rejectReasonForm" :model="rejectReasonForm" :rules="rejectReasonRules">
        <el-form-item label="拒绝理由" prop="reason">
          <el-input
            v-model="rejectReasonForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝理由（选填）"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelReject">取消</el-button>
        <el-button type="primary" @click="confirmReject">确定</el-button>
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
export default {
  name: 'CommentApproval',
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
      // 回复对话框状态
      replyDialogVisible: false,
      replyTargetComment: null,
      replyForm: {
        userName: '',
        commentContent: '',
        replyContent: '',
        replyType: 'public'
      },
      replyRules: {
        replyContent: [
          { required: true, message: '请输入回复内容', trigger: 'blur' },
          { max: 200, message: '回复内容最多200字', trigger: 'blur' }
        ]
      },
      // 拒绝理由对话框状态
      rejectReasonDialogVisible: false,
      rejectReasonForm: {
        reason: ''
      },
      rejectReasonRules: {
        reason: [
          { max: 200, message: '拒绝理由最多200字', trigger: 'blur' }
        ]
      },
      rejectTargetId: null,
      rejectTargetFromDetail: false,
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
    fetchCommentList() {
      this.loading = true
      // 模拟API请求
      setTimeout(() => {
        this.commentList = [
          {
            id: '1001',
            userId: 'u001',
            userInfo: {
              userId: 'u001',
              nickname: '用户小明',
              avatar: 'https://via.placeholder.com/100?text=User1'
            },
            productId: '101',
            productName: '香泰优质大米',
            productBatch: 'XT20230601',
            productImage: 'https://via.placeholder.com/200x200?text=香泰优质大米',
            content: '这款大米真的很香，煮出来的米饭软糯可口，全家人都很喜欢！\n物流也很快，包装完好无损，以后会继续购买。',
            rating: 5,
            images: [
              { id: 'img1', url: 'https://via.placeholder.com/800x600?text=Rice+1' },
              { id: 'img2', url: 'https://via.placeholder.com/800x600?text=Rice+2' }
            ],
            status: 'pending',
            likes: 0,
            replies: [
              {
                id: 'r1',
                content: '感谢您的好评，我们会继续努力提供更好的产品和服务！',
                author: '管理员A',
                time: '2023-06-15 11:00:00',
                type: 'public'
              }
            ],
            ipAddress: '192.168.1.1',
            createdTime: '2023-06-15 10:30:00',
            updatedTime: '2023-06-15 10:30:00',
            operationLogs: [
              {
                time: '2023-06-15 10:30:00',
                action: '评论发布',
                operator: '系统'
              }
            ]
          },
          {
            id: '1002',
            userId: 'u002',
            userInfo: {
              userId: 'u002',
              nickname: '美食达人',
              avatar: 'https://via.placeholder.com/100?text=User2'
            },
            productId: '103',
            productName: '香泰有机大米',
            productBatch: 'XT20230610',
            productImage: 'https://via.placeholder.com/200x200?text=香泰有机大米',
            content: '作为一个注重健康的消费者，这款有机大米确实不错。口感自然，有米香，煮出来的米饭很有嚼劲。虽然价格稍贵，但值得购买。',
            rating: 4.5,
            images: [
              { id: 'img3', url: 'https://via.placeholder.com/800x600?text=Organic+Rice' }
            ],
            status: 'pending',
            likes: 0,
            replies: [],
            ipAddress: '192.168.1.2',
            createdTime: '2023-06-18 14:20:00',
            updatedTime: '2023-06-18 14:20:00',
            operationLogs: [
              {
                time: '2023-06-18 14:20:00',
                action: '评论发布',
                operator: '系统'
              }
            ]
          },
          {
            id: '1003',
            userId: 'u003',
            userInfo: {
              userId: 'u003',
              nickname: '普通消费者',
              avatar: 'https://via.placeholder.com/100?text=User3'
            },
            productId: '104',
            productName: '香泰红米',
            productBatch: 'XT20230615',
            productImage: 'https://via.placeholder.com/200x200?text=香泰红米',
            content: '红米颜色很好看，但是口感一般，可能不太适合我家的口味。不过听说红米营养价值高，还是会偶尔购买。',
            rating: 3,
            images: [],
            status: 'approved',
            likes: 5,
            replies: [
              {
                id: 'r2',
                content: '感谢您的反馈，我们会继续改进产品品质。',
                author: '管理员B',
                time: '2023-06-20 11:00:00',
                type: 'public'
              }
            ],
            ipAddress: '192.168.1.3',
            createdTime: '2023-06-20 09:45:00',
            updatedTime: '2023-06-20 11:00:00',
            operationLogs: [
              {
                time: '2023-06-20 09:45:00',
                action: '评论发布',
                operator: '系统'
              },
              {
                time: '2023-06-20 10:00:00',
                action: '审核通过',
                operator: '管理员C'
              },
              {
                time: '2023-06-20 11:00:00',
                action: '回复评论',
                operator: '管理员B'
              }
            ]
          },
          {
            id: '1004',
            userId: 'u004',
            userInfo: {
              userId: 'u004',
              nickname: '第一次购买',
              avatar: 'https://via.placeholder.com/100?text=User4'
            },
            productId: '101',
            productName: '香泰优质大米',
            productBatch: 'XT20230601',
            productImage: 'https://via.placeholder.com/200x200?text=香泰优质大米',
            content: '第一次购买这个品牌，还没开始吃，但是包装很好，物流也很快。等吃了再追评。',
            rating: 4,
            images: [],
            status: 'pending',
            likes: 0,
            replies: [],
            ipAddress: '192.168.1.4',
            createdTime: '2023-06-22 16:30:00',
            updatedTime: '2023-06-22 16:30:00',
            operationLogs: [
              {
                time: '2023-06-22 16:30:00',
                action: '评论发布',
                operator: '系统'
              }
            ]
          },
          {
            id: '1005',
            userId: 'u005',
            userInfo: {
              userId: 'u005',
              nickname: '不满意的顾客',
              avatar: 'https://via.placeholder.com/100?text=User5'
            },
            productId: '105',
            productName: '香泰糙米',
            productBatch: 'XT20230620',
            productImage: 'https://via.placeholder.com/200x200?text=香泰糙米',
            content: '这个糙米感觉不太新鲜，煮了很久还是有点硬，而且有股怪味。不会再购买了！',
            rating: 1,
            images: [
              { id: 'img4', url: 'https://via.placeholder.com/800x600?text=Brown+Rice+1' },
              { id: 'img5', url: 'https://via.placeholder.com/800x600?text=Brown+Rice+2' }
            ],
            status: 'pending',
            likes: 0,
            replies: [],
            ipAddress: '192.168.1.5',
            createdTime: '2023-06-25 11:00:00',
            updatedTime: '2023-06-25 11:00:00',
            operationLogs: [
              {
                time: '2023-06-25 11:00:00',
                action: '评论发布',
                operator: '系统'
              }
            ]
          },
          {
            id: '1006',
            userId: 'u006',
            userInfo: {
              userId: 'u006',
              nickname: '回头客',
              avatar: 'https://via.placeholder.com/100?text=User6'
            },
            productId: '102',
            productName: '香泰生态米',
            productBatch: 'XT20230520',
            productImage: 'https://via.placeholder.com/200x200?text=香泰生态米',
            content: '一直在买这款生态米，质量稳定，口感好，煮出来的米饭很香。这次还送了小包装的试吃装，很贴心。',
            rating: 5,
            images: [
              { id: 'img6', url: 'https://via.placeholder.com/800x600?text=Eco+Rice' },
              { id: 'img7', url: 'https://via.placeholder.com/800x600?text=Gift' }
            ],
            status: 'approved',
            likes: 18,
            replies: [
              {
                id: 'r3',
                content: '非常感谢您的支持和好评，期待您的下次购买！',
                author: '管理员A',
                time: '2023-06-28 16:00:00',
                type: 'public'
              },
              {
                id: 'r4',
                content: '感谢您的反馈，我们会继续保持产品品质。',
                author: '管理员C',
                time: '2023-06-28 16:15:00',
                type: 'private'
              }
            ],
            ipAddress: '192.168.1.6',
            createdTime: '2023-06-28 15:20:00',
            updatedTime: '2023-06-28 16:15:00',
            operationLogs: [
              {
                time: '2023-06-28 15:20:00',
                action: '评论发布',
                operator: '系统'
              },
              {
                time: '2023-06-28 15:30:00',
                action: '审核通过',
                operator: '管理员B'
              },
              {
                time: '2023-06-28 16:00:00',
                action: '公开回复',
                operator: '管理员A'
              },
              {
                time: '2023-06-28 16:15:00',
                action: '私信回复',
                operator: '管理员C'
              }
            ]
          },
          {
            id: '1007',
            userId: 'u007',
            userInfo: {
              userId: 'u007',
              nickname: '新用户',
              avatar: 'https://via.placeholder.com/100?text=User7'
            },
            productId: '103',
            productName: '香泰有机大米',
            productBatch: 'XT20230610',
            productImage: 'https://via.placeholder.com/200x200?text=香泰有机大米',
            content: '看了评价买的，收到后还没吃，期待口感。',
            rating: 3,
            images: [],
            status: 'pending',
            likes: 0,
            replies: [],
            ipAddress: '192.168.1.7',
            createdTime: '2023-06-30 09:10:00',
            updatedTime: '2023-06-30 09:10:00',
            operationLogs: [
              {
                time: '2023-06-30 09:10:00',
                action: '评论发布',
                operator: '系统'
              }
            ]
          },
          {
            id: '1008',
            userId: 'u008',
            userInfo: {
              userId: 'u008',
              nickname: '有意见',
              avatar: 'https://via.placeholder.com/100?text=User8'
            },
            productId: '104',
            productName: '香泰红米',
            productBatch: 'XT20230615',
            productImage: 'https://via.placeholder.com/200x200?text=香泰红米',
            content: '很差的产品，和描述不符，强烈不推荐购买！！！',
            rating: 1,
            images: [],
            status: 'pending',
            likes: 0,
            replies: [],
            ipAddress: '192.168.1.8',
            createdTime: '2023-07-01 14:30:00',
            updatedTime: '2023-07-01 14:30:00',
            operationLogs: [
              {
                time: '2023-07-01 14:30:00',
                action: '评论发布',
                operator: '系统'
              }
            ]
          }
        ]
        this.loading = false
      }, 1000)
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

    // 回复评论
    replyComment(row) {
      this.replyTargetComment = JSON.parse(JSON.stringify(row))
      this.replyForm = {
        userName: row.userInfo.nickname,
        commentContent: row.content,
        replyContent: '',
        replyType: 'public'
      }
      this.replyDialogVisible = true
    },

    // 取消回复
    cancelReply() {
      this.replyDialogVisible = false
      this.$refs['replyForm']?.resetFields()
    },

    // 提交回复
    submitReply() {
      this.$refs['replyForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          // 模拟提交回复
          setTimeout(() => {
            const newReply = {
              id: `r${Date.now()}`,
              content: this.replyForm.replyContent,
              author: '当前管理员',
              time: new Date().toLocaleString('zh-CN'),
              type: this.replyForm.replyType
            }

            // 更新评论列表中的回复
            const comment = this.commentList.find(item => item.id === this.replyTargetComment.id)
            if (comment) {
              if (!comment.replies) comment.replies = []
              comment.replies.push(newReply)

              // 添加操作日志
              if (!comment.operationLogs) comment.operationLogs = []
              comment.operationLogs.push({
                time: new Date().toLocaleString('zh-CN'),
                action: this.replyForm.replyType === 'public' ? '公开回复' : '私信回复',
                operator: '当前管理员'
              })

              comment.updatedTime = new Date().toLocaleString('zh-CN')
            }

            this.$message.success('回复成功')
            this.replyDialogVisible = false
            this.loading = false
          }, 500)
        }
      })
    },

    // 通过评论
    approveComment(id, fromDetail = false) {
      this.$confirm('确定要通过这条评论吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.loading = true
        // 模拟审核操作
        setTimeout(() => {
          const comment = this.commentList.find(item => item.id === id)
          if (comment) {
            comment.status = 'approved'
            comment.updatedTime = new Date().toLocaleString('zh-CN')

            // 添加操作日志
            if (!comment.operationLogs) comment.operationLogs = []
            comment.operationLogs.push({
              time: new Date().toLocaleString('zh-CN'),
              action: '审核通过',
              operator: '当前管理员'
            })
          }

          // 如果从详情页操作，关闭详情页
          if (fromDetail) {
            this.detailDialogVisible = false
          }

          // 从选中列表中移除
          this.selectedRows = this.selectedRows.filter(item => item.id !== id)

          this.$message.success('审核通过')
          this.loading = false
        }, 500)
      })
    },

    // 拒绝评论
    rejectComment(id, fromDetail = false) {
      this.rejectTargetId = id
      this.rejectTargetFromDetail = fromDetail
      this.rejectReasonForm = { reason: '' }
      this.rejectReasonDialogVisible = true
    },

    // 取消拒绝
    cancelReject() {
      this.rejectReasonDialogVisible = false
      this.$refs['rejectReasonForm']?.resetFields()
    },

    // 确认拒绝
    confirmReject() {
      this.$refs['rejectReasonForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          // 模拟拒绝操作
          setTimeout(() => {
            const comment = this.commentList.find(item => item.id === this.rejectTargetId)
            if (comment) {
              comment.status = 'rejected'
              comment.updatedTime = new Date().toLocaleString('zh-CN')

              // 添加操作日志
              if (!comment.operationLogs) comment.operationLogs = []
              comment.operationLogs.push({
                time: new Date().toLocaleString('zh-CN'),
                action: '审核拒绝',
                operator: '当前管理员',
                reason: this.rejectReasonForm.reason || '未提供理由'
              })
            }

            // 如果从详情页操作，关闭详情页
            if (this.rejectTargetFromDetail) {
              this.detailDialogVisible = false
            }

            // 从选中列表中移除
            this.selectedRows = this.selectedRows.filter(item => item.id !== this.rejectTargetId)

            this.$message.success('审核拒绝')
            this.rejectReasonDialogVisible = false
            this.loading = false
          }, 500)
        }
      })
    },

    // 删除评论
    deleteComment(id) {
      this.$confirm('确定要删除这条评论吗？删除后将无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        // 模拟删除操作
        setTimeout(() => {
          this.commentList = this.commentList.filter(item => item.id !== id)
          // 从选中列表中移除
          this.selectedRows = this.selectedRows.filter(item => item.id !== id)

          // 如果正在查看的评论被删除，关闭详情页
          if (this.detailDialogVisible && this.selectedComment && this.selectedComment.id === id) {
            this.detailDialogVisible = false
          }

          this.$message.success('删除成功')
          this.loading = false
        }, 500)
      })
    },

    // 批量通过
    batchApprove() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请先选择要通过的评论')
        return
      }

      // 过滤出待审核的评论
      const pendingComments = this.selectedRows.filter(item => item.status === 'pending')
      if (pendingComments.length === 0) {
        this.$message.warning('请选择待审核的评论')
        return
      }

      this.$confirm(`确定要通过选中的 ${pendingComments.length} 条评论吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.loading = true
        // 模拟批量通过操作
        setTimeout(() => {
          const idsToApprove = pendingComments.map(item => item.id)
          this.commentList.forEach(comment => {
            if (idsToApprove.includes(comment.id)) {
              comment.status = 'approved'
              comment.updatedTime = new Date().toLocaleString('zh-CN')

              // 添加操作日志
              if (!comment.operationLogs) comment.operationLogs = []
              comment.operationLogs.push({
                time: new Date().toLocaleString('zh-CN'),
                action: '批量审核通过',
                operator: '当前管理员'
              })
            }
          })

          // 更新选中列表
          this.selectedRows = this.selectedRows.filter(item => !idsToApprove.includes(item.id))

          this.$message.success(`成功通过 ${idsToApprove.length} 条评论`)
          this.loading = false
        }, 500)
      })
    },

    // 批量拒绝
    batchReject() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请先选择要拒绝的评论')
        return
      }

      // 过滤出待审核的评论
      const pendingComments = this.selectedRows.filter(item => item.status === 'pending')
      if (pendingComments.length === 0) {
        this.$message.warning('请选择待审核的评论')
        return
      }

      this.$confirm(`确定要拒绝选中的 ${pendingComments.length} 条评论吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }).then(() => {
        this.loading = true
        // 模拟批量拒绝操作
        setTimeout(() => {
          const idsToReject = pendingComments.map(item => item.id)
          this.commentList.forEach(comment => {
            if (idsToReject.includes(comment.id)) {
              comment.status = 'rejected'
              comment.updatedTime = new Date().toLocaleString('zh-CN')

              // 添加操作日志
              if (!comment.operationLogs) comment.operationLogs = []
              comment.operationLogs.push({
                time: new Date().toLocaleString('zh-CN'),
                action: '批量审核拒绝',
                operator: '当前管理员',
                reason: '批量操作'
              })
            }
          })

          // 更新选中列表
          this.selectedRows = this.selectedRows.filter(item => !idsToReject.includes(item.id))

          this.$message.success(`成功拒绝 ${idsToReject.length} 条评论`)
          this.loading = false
        }, 500)
      })
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

.action-buttons {
  display: flex;
  gap: 5px;
  margin-top: 5px;
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

.comment-replies-section {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.reply-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reply-item {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 14px;
}

.reply-author {
  font-weight: 500;
  color: #606266;
}

.reply-time {
  color: #909399;
  font-size: 12px;
}

.reply-content {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
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
}
</style>
