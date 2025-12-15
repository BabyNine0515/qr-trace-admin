<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4" style="margin-bottom: 20px;">
        <el-breadcrumb-item>评论互动管理</el-breadcrumb-item>
        <el-breadcrumb-item>评论列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 操作按钮 -->
      <div class="operation-bar mb-4">
        <el-button type="primary" @click="openAddComment">添加评论</el-button>
        <!-- <el-button type="danger" :disabled="selectedRows.length === 0" @click="batchDelete">
          批量删除 ({{ selectedRows.length }})
        </el-button> -->
        <el-button @click="refreshList">刷新列表</el-button>
      </div>

      <!-- 搜索和筛选 -->
      <el-form :inline="true" class="search-form mb-4">
        <el-form-item label="商户ID">
          <el-input v-model="searchParams.merchant_id" placeholder="请输入商户ID" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="批次ID">
          <el-input v-model="searchParams.batch_id" placeholder="请输入批次ID" style="width: 200px;" />
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
        :data="commentList"
        style="width: 100%"
        row-key="id"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="评论ID" width="150" />
        <el-table-column prop="batch_id" label="批次ID" width="180" />
        <el-table-column prop="quality" label="品质评分" width="100" align="center">
          <template slot-scope="scope">
            <el-rate
              v-model="scope.row.quality"
              :max="5"
              disabled
              allow-half
            />
            <span class="ml-2">{{ scope.row.quality }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="texture" label="口感评分" width="100" align="center">
          <template slot-scope="scope">
            <el-rate
              v-model="scope.row.texture"
              :max="5"
              disabled
              allow-half
            />
            <span class="ml-2">{{ scope.row.texture }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="is_recommend" label="是否推荐" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.is_recommend === 1 ? 'success' : 'danger'">
              {{ scope.row.is_recommend === 1 ? '推荐' : '不推荐' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="comment_text" label="评论内容" min-width="300">
          <template slot-scope="scope">
            <div class="comment-content">
              <p v-html="formatContent(scope.row.comment_test)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="200" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.images && scope.row.images.length > 0" class="comment-images">
              <div
                v-for="(media, index) in scope.row.images.slice(0, 1)"
                :key="index"
                class="media-thumbnail"
                @click.stop
              >
                <!-- 图片显示 -->
                <el-image
                  v-if="isImage(media)"
                  :src="trimMediaUrl(media)"
                  :preview-src-list="scope.row.images.filter(img => isImage(img)).map(img => trimMediaUrl(img))"
                  fit="cover"
                  class="image-thumbnail"
                />
                <!-- 视频显示 -->
                <div v-else-if="isVideo(media)" class="video-thumbnail">
                  <video
                    :src="trimMediaUrl(media)"
                    class="video-preview"
                    controls
                    preload="metadata"
                  />
                </div>
              </div>
              <span v-if="scope.row.images.length > 3" class="more-images" @click.stop="previewAllImages(scope.row.images)">+{{ scope.row.images.length - 3 }}</span>
            </div>
            <span v-else class="no-media">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="opinion" label="建议" min-width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.opinion || '无' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column prop="updated_at" label="更新时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="openEditComment(scope.row)">修改</el-button>
            <el-button size="mini" type="danger" @click="deleteComment(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :total="totalCount"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :current-page="currentPage"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 评论详情/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="800px"
      center
    >
      <div v-if="currentComment" class="comment-detail">
        <el-form ref="commentForm" :model="currentComment" label-width="120px">
          <el-form-item label="批次ID" prop="batch_id">
            <el-input v-model="currentComment.batch_id" placeholder="请输入批次ID" />
          </el-form-item>
          <el-form-item label="品质评分" prop="quality">
            <el-rate
              v-model="currentComment.quality"
              :max="5"
              show-score
              score-template="{value}"
            />
          </el-form-item>
          <el-form-item label="口感评分" prop="texture">
            <el-rate
              v-model="currentComment.texture"
              :max="5"
              show-score
              score-template="{value}"
            />
          </el-form-item>
          <el-form-item label="是否推荐" prop="is_recommend">
            <el-switch
              v-model="currentComment.is_recommend"
              active-value="1"
              inactive-value="0"
              active-text="推荐"
              inactive-text="不推荐"
            />
          </el-form-item>
          <el-form-item label="评论内容" prop="comment_test">
            <el-input
              v-model="currentComment.comment_test"
              type="textarea"
              :rows="4"
              placeholder="请输入评论内容"
            />
          </el-form-item>
          <el-form-item label="建议" prop="opinion">
            <el-input
              v-model="currentComment.opinion"
              type="textarea"
              :rows="3"
              placeholder="请输入建议"
            />
          </el-form-item>
          <el-form-item label="图片/视频">
            <div class="media-uploader">
              <el-upload
                action="#"
                list-type="picture-card"
                :file-list="imageFileList"
                :on-preview="previewMedia"
                :on-remove="handleImageRemove"
                :on-change="handleImageChange"
                :limit="8"
                accept="image/jpeg,image/png,image/webp"
                :before-upload="beforeImageUpload"
                :auto-upload="false"
              >
                <i class="el-icon-plus" />
              </el-upload>
              <div class="el-form-item__help">jpg/png/webp格式，≤800KB</div>
            </div>
          </el-form-item>
        </el-form>
        <div class="detail-actions">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submittingComment" @click="saveComment">保存</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 媒体预览对话框 -->
    <el-dialog
      :visible.sync="previewMediaVisible"
      :title="previewMediaType === 'image' ? '预览图片' : '预览视频'"
      width="800px"
    >
      <div class="preview-container">
        <!-- 图片预览 -->
        <div v-if="previewMediaType === 'image'" class="multi-image-preview">
          <el-image
            :src="previewMediaUrl"
            :preview-src-list="previewMediaUrls"
            fit="contain"
            style="width: 100%; height: 500px;"
          />
          <div class="image-navigator">
            <el-button
              type="text"
              :disabled="previewMediaUrls.indexOf(previewMediaUrl) === 0"
              @click="previewPreviousImage"
            >上一张</el-button>
            <span>{{ previewMediaUrls.indexOf(previewMediaUrl) + 1 }} / {{ previewMediaUrls.length }}</span>
            <el-button
              type="text"
              :disabled="previewMediaUrls.indexOf(previewMediaUrl) === previewMediaUrls.length - 1"
              @click="previewNextImage"
            >下一张</el-button>
          </div>
        </div>
        <!-- 视频预览 -->
        <video
          v-else-if="previewMediaType === 'video'"
          :src="previewMediaUrl"
          class="video-preview"
          controls
          autoplay
          style="width: 100%; height: 500px;"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCommentList, createComment, updateComment, deleteComment } from '@/api/comment'
import { uploadImage } from '@/api/media'

export default {
  name: 'CommentList',
  data() {
    return {
      // 评论列表
      commentList: [],
      // 选中的行
      selectedRows: [],
      // 搜索参数
      searchParams: {
        merchant_id: '',
        batch_id: ''
      },
      // 分页参数
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      // 加载状态
      loading: false,
      // 详情对话框状态
      dialogVisible: false,
      dialogTitle: '评论详情',
      currentComment: null,
      // 预览对话框状态
      previewMediaVisible: false,
      previewMediaUrl: '',
      previewMediaUrls: [],
      previewMediaType: 'image',
      // 图片上传相关
      imageFileList: [],
      submittingComment: false
    }
  },
  created() {
    this.fetchCommentList()
  },
  methods: {
    // 获取评论列表
    async fetchCommentList() {
      this.loading = true
      try {
        const params = {
          ...this.searchParams,
          page: this.currentPage,
          size: this.pageSize
        }

        const response = await getCommentList(params)
        if (response.code === 200) {
          // 处理评论列表数据
          this.commentList = (response.data.comment_record || []).map(item => {
            // 确保images是数组格式
            let images = []
            if (item.images) {
              if (typeof item.images === 'string') {
                // 如果是字符串，尝试按逗号分割
                images = item.images.split(',').filter(img => img.trim())
              } else if (Array.isArray(item.images)) {
                // 如果已经是数组，直接使用
                images = item.images
              }
            }
            return {
              ...item,
              images: images
            }
          })
          // 确保totalCount不为0，除非API明确返回0
          // 防止切换页码时totalCount被错误设置为0导致分页组件显示异常
          this.totalCount = response.data.count !== undefined ? response.data.count : this.totalCount
        } else {
          this.$message.error('获取评论列表失败: ' + (response.message || '未知错误'))
          // API请求失败时，保留原有的totalCount，防止分页组件显示异常
        }
      } catch (error) {
        this.$message.error('获取评论列表失败: ' + (error.message || '未知错误'))
        console.error('获取评论列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 搜索
    search() {
      this.currentPage = 1 // 重置到第一页
      this.fetchCommentList()
    },

    // 重置搜索
    resetSearch() {
      this.searchParams = {
        merchant_id: '',
        batch_id: ''
      }
      this.currentPage = 1
      this.fetchCommentList()
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
      this.fetchCommentList()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchCommentList()
    },

    // 格式化评论内容（将换行符转换为HTML换行）
    formatContent(content) {
      if (!content) return ''
      return content.replace(/\n/g, '<br/>')
    },

    // 处理媒体URL，确保正确拼接IPFS前缀
    trimMediaUrl(url) {
      if (!url) return ''
      const trimmedUrl = url.trim().replace(/`/g, '')
      // 如果已经是完整URL，直接返回
      if (trimmedUrl.startsWith('http')) {
        return trimmedUrl
      }
      // 否则拼接IPFS前缀
      return `https://dev.xiangtaihou-food.com/ipfs/${trimmedUrl}`
    },

    // 判断是否为图片
    isImage(url) {
      if (!url) return false
      const trimmedUrl = this.trimMediaUrl(url)
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
      return imageExtensions.some(ext => trimmedUrl.toLowerCase().endsWith(ext))
    },

    // 判断是否为视频
    isVideo(url) {
      if (!url) return false
      const trimmedUrl = this.trimMediaUrl(url)
      const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
      return videoExtensions.some(ext => trimmedUrl.toLowerCase().endsWith(ext))
    },

    // 预览媒体（图片/视频）
    previewMedia(url) {
      const trimmedUrl = this.trimMediaUrl(url)
      this.previewMediaUrl = trimmedUrl
      this.previewMediaUrls = [trimmedUrl] // 单张图片预览也设置为数组，统一处理
      if (this.isImage(url)) {
        this.previewMediaType = 'image'
      } else if (this.isVideo(url)) {
        this.previewMediaType = 'video'
      }
      this.previewMediaVisible = true
    },

    // 预览所有图片
    previewAllImages(images) {
      // 转换所有图片URL为完整URL
      const fullUrls = images.filter(image => this.isImage(image)).map(image => this.trimMediaUrl(image))
      if (fullUrls.length > 0) {
        this.previewMediaUrls = fullUrls
        this.previewMediaUrl = fullUrls[0]
        this.previewMediaType = 'image'
        this.previewMediaVisible = true
      }
    },

    // 预览上一张图片
    previewPreviousImage() {
      const currentIndex = this.previewMediaUrls.indexOf(this.previewMediaUrl)
      if (currentIndex > 0) {
        this.previewMediaUrl = this.previewMediaUrls[currentIndex - 1]
      }
    },

    // 预览下一张图片
    previewNextImage() {
      const currentIndex = this.previewMediaUrls.indexOf(this.previewMediaUrl)
      if (currentIndex < this.previewMediaUrls.length - 1) {
        this.previewMediaUrl = this.previewMediaUrls[currentIndex + 1]
      }
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
        await deleteComment({ id })

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
    batchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请先选择要删除的评论')
        return
      }

      // 批量删除需要逐个调用删除接口，因为新API不支持批量删除
      const deletePromises = this.selectedRows.map(row => deleteComment({ id: row.id }))

      this.$confirm('确定要批量删除选中的评论吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        Promise.all(deletePromises)
          .then(() => {
            this.$message.success('批量删除成功')
            this.fetchCommentList()
            this.$refs['commentTable']?.clearSelection()
          })
          .catch(error => {
            this.$message.error(error.message || '批量删除失败')
          })
      }).catch(() => {
        // 用户取消操作
      })
    },

    // 打开添加评论对话框
    openAddComment() {
      this.currentComment = {
        batch_id: '',
        quality: 5,
        texture: 5,
        is_recommend: 1,
        comment_test: '',
        images: [],
        opinion: ''
      }
      this.imageFileList = []
      this.dialogTitle = '添加评论'
      this.dialogVisible = true
    },

    // 打开编辑评论对话框
    openEditComment(comment) {
      this.currentComment = JSON.parse(JSON.stringify(comment))
      // 将图片URL转换为文件列表格式，确保URL格式正确
      this.imageFileList = (comment.images || []).map((item, index) => {
        // 检查item是cid还是完整URL
        let cid, fullUrl
        if (item.startsWith('http')) {
          // 如果是完整URL，提取cid
          fullUrl = item
          cid = item.split('/').pop()
        } else {
          // 如果是cid，构造完整URL
          cid = item
          fullUrl = `https://dev.xiangtaihou-food.com/ipfs/${cid}`
        }
        return {
          name: `image-${index}`,
          url: fullUrl, // 预览使用完整URL
          cid: cid, // 保存cid以便后续使用
          status: 'success', // 设置状态为success，表示已上传
          uid: Date.now() + index // 添加唯一标识
        }
      })
      this.dialogTitle = '编辑评论'
      this.dialogVisible = true
    },

    // 保存评论
    saveComment() {
      this.$refs.commentForm.validate(valid => {
        if (valid) {
          this.submittingComment = true
          // 准备提交数据，确保URL格式正确
          const commentData = {
            batch_id: this.currentComment.batch_id,
            quality: this.currentComment.quality,
            texture: this.currentComment.texture,
            is_recommend: this.currentComment.is_recommend,
            comment_test: this.currentComment.comment_test,
            images: this.imageFileList
              .filter(file => file.status === 'success')
              .map(file => {
                if (file.cid) {
                  // 如果有cid，优先使用cid
                  return file.cid
                } else if (file.url) {
                  // 否则使用url
                  return file.url
                }
                return ''
              })
              .filter(url => url),
            opinion: this.currentComment.opinion
          }

          let apiPromise
          if (this.currentComment.id) {
            // 更新评论
            apiPromise = updateComment({
              id: this.currentComment.id,
              ...commentData
            })
          } else {
            // 创建评论
            apiPromise = createComment(commentData)
          }

          apiPromise
            .then(() => {
              this.$message.success(this.currentComment.id ? '更新成功' : '创建成功')
              this.dialogVisible = false
              this.fetchCommentList()
            })
            .catch(error => {
              this.$message.error(error.message || (this.currentComment.id ? '更新失败' : '创建失败'))
            })
            .finally(() => {
              this.submittingComment = false
            })
        }
      })
    },

    // 图片预览
    previewUploadedFile(file) {
      // 确保使用正确的图片URL格式
      let previewUrl = file.url
      // 如果文件有cid属性，构造完整的IPFS路径
      if (file.cid) {
        previewUrl = `https://dev.xiangtaihou-food.com/ipfs/${file.cid}`
      } else if (file.response && file.response.data && file.response.data.cid) {
        // 处理已上传但可能url属性未更新的情况
        previewUrl = `https://dev.xiangtaihou-food.com/ipfs/${file.response.data.cid}`
      }
      this.previewMediaUrl = previewUrl
      this.previewMediaType = 'image'
      this.previewMediaVisible = true
    },

    // 图片上传前验证
    async beforeImageUpload(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
      const isLt800K = file.size / 1024 < 800

      if (!isImage) {
        this.$message.error('只能上传JPG、PNG或WEBP格式的图片!')
      }
      if (!isLt800K) {
        this.$message.error('上传图片大小不能超过 800KB!')
      }
      return isImage && isLt800K
    },

    // 图片上传处理
    async handleImageChange(file, fileList) {
      // 只处理用户新选择的文件（status为ready且有raw文件），防止重复上传
      if (file.raw && file.status === 'ready' && !file.uploading) {
        try {
          // 标记文件正在上传，防止重复上传
          const uploadingFile = Object.assign({}, file, { uploading: true })
          const tempFileList = [...fileList]
          const index = tempFileList.findIndex(f => f.uid === file.uid)
          if (index !== -1) {
            tempFileList[index] = uploadingFile
          }
          this.imageFileList = tempFileList

          // 验证图片格式和大小
          const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png' || file.raw.type === 'image/webp'
          const isLt800K = file.raw.size / 1024 < 800

          if (!isImage || !isLt800K) {
            this.$message.error(isImage ? '上传图片大小不能超过 800KB!' : '只能上传JPG、PNG或WEBP格式的图片!')
            // 移除不符合要求的文件
            this.imageFileList = fileList.filter(f => f.uid !== file.uid)
            return
          }

          // 准备上传数据
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('type', 'commentImage')

          try {
            // 调用上传API
            const response = await uploadImage(formData)

            // 检查响应数据结构
            if (!response) {
              throw new Error('上传请求失败，未获取到响应')
            }
            if (response.code !== 200) {
              throw new Error(response.message || '上传失败')
            }
            if (!response.data) {
              throw new Error('上传请求失败，响应数据为空')
            }

            let cid, url
            if (response.data.cid) {
              // IPFS存储返回cid
              cid = response.data.cid
              url = `https://dev.xiangtaihou-food.com/ipfs/${cid}`
            } else if (response.data.url) {
              // 传统存储返回url
              url = response.data.url
              cid = url.split('/').pop()
            } else {
              throw new Error('上传接口返回数据格式不正确，缺少cid或url字段')
            }

            // 更新文件对象，添加cid和预览URL
            const updatedFile = Object.assign({}, file, {
              url: url, // 使用完整的URL进行预览
              cid: cid, // 存储cid用于后续表单提交
              status: 'success',
              uploading: false
            })

            // 更新文件列表
            const updatedFileList = [...fileList]
            const updateIndex = updatedFileList.findIndex(f => f.uid === file.uid)
            if (updateIndex !== -1) {
              updatedFileList[updateIndex] = updatedFile
            }

            this.imageFileList = updatedFileList
            this.$message.success('图片上传成功')
          } catch (error) {
            console.error('媒体上传失败:', error)
            this.$message.error('图片上传失败: ' + (error.message || '未知错误'))
            // 移除上传失败的文件
            this.imageFileList = fileList.filter(f => f.uid !== file.uid)
          }
        } catch (error) {
          console.error('图片上传失败:', error)
          this.$message.error('图片上传失败: ' + (error.message || '未知错误'))
          // 移除上传失败的文件
          this.imageFileList = fileList.filter(f => f.uid !== file.uid)
        }
      } else if (file.status !== 'ready') {
        // 更新文件列表（处理删除等操作，但跳过ready状态的文件以避免重复上传）
        this.imageFileList = fileList
      }
    },

    // 处理图片移除
    handleImageRemove(file, fileList) {
      this.imageFileList = fileList
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
}

.media-thumbnail {
  display: inline-block;
  margin-right: 8px;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  width: 80px;
  height: 80px;
  vertical-align: top;
}

.image-thumbnail {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-uploader .el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: 100px;
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

  .no-media {
    color: #909399;
    font-size: 12px;
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
