<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4" style="margin-bottom: 20px;">
        <el-breadcrumb-item>生产信息管理</el-breadcrumb-item>
        <el-breadcrumb-item>品牌故事管理</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 操作按钮 -->
      <div class="operation-bar mb-4">
        <el-button type="primary" @click="addBrandStory">添加品牌故事</el-button>
        <!-- <el-button type="danger" :disabled="selectedRows.length === 0" @click="batchDelete">
          批量删除 ({{ selectedRows.length }})
        </el-button> -->
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="brandStoryList"
        style="width: 100%"
        row-key="id"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="150" />
        <el-table-column prop="image" label="品牌图片" width="120" align="center">
          <template slot-scope="scope">
            <el-image
              :src="getFullImageUrl(scope.row.image)"
              fit="cover"
              style="width: 80px; height: 60px;"
            />
          </template>
        </el-table-column>
        <el-table-column prop="text" label="品牌故事" min-width="300">
          <template slot-scope="scope">
            <div class="story-text">{{ scope.row.text }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column prop="updated_at" label="更新时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewBrandStory(scope.row)">查看</el-button>
            <el-button size="mini" type="primary" @click="editBrandStory(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteBrandStory(scope.row.id)">删除</el-button>
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

    <!-- 添加/编辑品牌故事对话框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="isEditing ? '编辑品牌故事' : '添加品牌故事'"
      :width="'800px'"
    >
      <el-form
        ref="brandStoryForm"
        :model="brandStoryForm"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="所属商户" prop="merchant_id">
          <el-select v-model="brandStoryForm.merchant_id" placeholder="请选择商户" style="width: 100%;">
            <el-option
              v-for="merchant in merchantList"
              :key="merchant.id"
              :label="merchant.name"
              :value="merchant.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="品牌图片" prop="image">
          <el-upload
            class="image-uploader"
            action="#"
            list-type="picture-card"
            :file-list="imageFileList"
            :on-preview="handleImagePreview"
            :on-remove="handleImageRemove"
            :on-change="handleImageChange"
            :limit="1"
            accept="image/jpeg,image/png,image/webp"
            :before-upload="beforeImageUpload"
            :auto-upload="false"
          >
            <i class="el-icon-plus" />
          </el-upload>
          <div class="el-upload__tip">支持jpg、jpeg、png、webp格式图片，单张不超过800KB</div>
        </el-form-item>

        <el-dialog :visible.sync="dialogVisibleImage" append-to-body>
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>

        <el-form-item label="品牌故事" prop="text">
          <el-input
            v-model="brandStoryForm.text"
            type="textarea"
            :rows="6"
            placeholder="请输入品牌故事内容"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="brandStoryForm.sort" :min="0" :max="100" placeholder="请输入排序值" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBrandStory">保存</el-button>
      </div>
    </el-dialog>

    <!-- 查看品牌故事对话框 -->
    <el-dialog
      :visible.sync="viewDialogVisible"
      title="查看品牌故事"
      :width="'800px'"
    >
      <el-descriptions border :column="2">
        <el-descriptions-item label="ID">{{ viewingBrandStory.id }}</el-descriptions-item>
        <el-descriptions-item label="商⼾ID">{{ viewingBrandStory.merchant_id }}</el-descriptions-item>
        <el-descriptions-item label="品牌图片">
          <el-image :src="getFullImageUrl(viewingBrandStory.image)" fit="cover" style="width: 200px; height: 150px;" />
        </el-descriptions-item>
        <el-descriptions-item label="排序">{{ viewingBrandStory.sort }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewingBrandStory.created_at || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ viewingBrandStory.updated_at || '-' }}</el-descriptions-item>
        <el-descriptions-item label="品牌故事" :span="2">{{ viewingBrandStory.text || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div slot="footer" class="dialog-footer">
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createBrandStory, getBrandStoryList, updateBrandStory, deleteBrandStory } from '@/api/production'
import { uploadImage } from '@/api/media'
import { getMerchantList } from '@/api/company'

export default {
  name: 'BrandStoryManagement',
  data() {
    return {
      // 品牌故事列表
      brandStoryList: [],
      // 商户列表
      merchantList: [],
      // 选中的行
      selectedRows: [],
      // 分页参数
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      // 加载状态
      loading: false,
      // 对话框状态
      dialogVisible: false,
      isEditing: false,
      // 表单数据
      brandStoryForm: {
        id: '',
        merchant_id: undefined,
        image: '',
        text: '',
        sort: 0
      },
      // 表单验证规则
      formRules: {
        merchant_id: [
          { required: true, message: '请选择商⼾', trigger: 'change' }
        ],
        image: [
          { required: false, message: '请上传品牌图片', trigger: 'change' }
        ],
        text: [
          { required: false, message: '请输入品牌故事内容', trigger: 'blur' }
        ],
        sort: [
          { required: false, message: '请输入排序值', trigger: 'blur' }
        ]
      },
      // 查看对话框数据
      viewDialogVisible: false,
      viewingBrandStory: {},
      // 图片相关数据
      imageFileList: [],
      dialogVisibleImage: false,
      dialogImageUrl: ''
    }
  },
  created() {
    this.fetchBrandStoryList()
  },
  mounted() {
    getMerchantList({ merchant_type: 1 }).then(res => {
      this.merchantList = res.data.merchant_record || []
    })
  },
  methods: {
    // 获取品牌故事列表
    fetchBrandStoryList() {
      this.loading = true
      const params = {
        page: this.currentPage,
        size: this.pageSize
      }
      getBrandStoryList(params).then(response => {
        if (response.code === 200) {
          this.brandStoryList = response.data.brandStory_record || []
          this.totalCount = response.data.count || 0
        } else {
          this.$message.error('获取品牌故事列表失败')
        }
        this.loading = false
      }).catch(error => {
        this.$message.error('获取品牌故事列表失败: ' + (error.message || '未知错误'))
        this.loading = false
      })
    },

    // 处理选择变化
    handleSelectionChange(val) {
      this.selectedRows = val
    },

    // 处理行点击
    handleRowClick(row) {
      this.$refs['upstreamTable'].toggleRowSelection(row)
    },

    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchBrandStoryList()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchBrandStoryList()
    },

    // 添加品牌故事
    addBrandStory() {
      this.isEditing = false
      this.brandStoryForm = {
        // id: '',
        merchant_id: undefined,
        image: '',
        text: '',
        sort: 0
      }
      // 清空图片文件列表
      this.imageFileList = []
      this.dialogVisible = true
    },

    // 编辑品牌故事
    editBrandStory(row) {
      this.isEditing = true
      this.brandStoryForm = JSON.parse(JSON.stringify(row))
      // 处理品牌图片
      this.imageFileList = []
      if (row.image) {
        // 检查图片是完整URL还是cid
        let cid, fullUrl
        if (row.image.startsWith('http')) {
          fullUrl = row.image
          cid = row.image.split('/').pop()
        } else {
          cid = row.image
          fullUrl = `https://dev.xiangtaihou-food.com/ipfs/${cid}`
        }
        this.imageFileList.push({
          name: `品牌图片${Math.random().toString(36).substr(2, 9)}`,
          url: fullUrl,
          cid: cid,
          status: 'success',
          uid: Date.now() + Math.random().toString(36).substr(2, 9)
        })
      }
      this.dialogVisible = true
    },

    // 图片预览
    handleImagePreview(file) {
      let previewUrl = file.url
      // 如果文件有cid属性，构造完整的IPFS路径
      if (file.cid) {
        previewUrl = `https://dev.xiangtaihou-food.com/ipfs/${file.cid}`
      } else if (file.response && file.response.data && file.response.data.cid) {
        // 处理已上传但可能url属性未更新的情况
        previewUrl = `https://dev.xiangtaihou-food.com/ipfs/${file.response.data.cid}`
      }
      this.dialogImageUrl = previewUrl
      this.dialogVisibleImage = true
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

    // 图片删除处理
    handleImageRemove(file, fileList) {
      this.imageFileList = fileList
      this.brandStoryForm.image = ''
      // 手动触发表单验证更新
      this.$refs['brandStoryForm'].validateField('image')
    },

    // 图片上传处理
    async handleImageChange(file, fileList) {
      // 只处理用户新选择的文件（status为ready且有raw文件），防止重复上传
      if (file.raw && file.status === 'ready' && !file.uploading) {
        try {
          // 限制只上传一张图片，清理之前的图片
          this.imageFileList = []

          // 标记文件正在上传，防止重复上传
          const uploadingFile = Object.assign({}, file, { uploading: true })
          this.imageFileList.push(uploadingFile)

          // 验证图片格式和大小
          const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png' || file.raw.type === 'image/webp'
          const isLt800K = file.raw.size / 1024 < 800

          if (!isImage || !isLt800K) {
            this.$message.error(isImage ? '上传图片大小不能超过 800KB!' : '只能上传JPG、PNG或WEBP格式的图片!')
            // 移除不符合要求的文件
            this.imageFileList = []
            this.brandStoryForm.image = ''
            return
          }

          // 创建FormData并上传图片
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('type', 'brandImage')

          // 调用上传接口
          const response = await uploadImage(formData)

          // 检查响应数据结构
          if (!response || !response.data || !response.data.cid) {
            throw new Error('上传接口返回数据格式不正确')
          }
          // 获取上传成功返回的cid
          const cid = response.data.cid

          // 构造完整的预览URL
          const previewUrl = `https://dev.xiangtaihou-food.com/ipfs/${cid}`

          // 更新文件对象，添加cid和预览URL
          const updatedFile = Object.assign({}, file, {
            url: previewUrl,
            cid: cid,
            status: 'success',
            uploading: false
          })

          // 更新文件列表，只保留当前上传的图片
          this.imageFileList = [updatedFile]
          // 更新表单数据，使用cid作为image值
          this.brandStoryForm.image = cid
          // 手动触发表单验证更新
          this.$refs['brandStoryForm'].validateField('image')
          this.$message.success('图片上传成功')
        } catch (error) {
          console.error('图片上传失败:', error)
          this.$message.error('图片上传失败: ' + (error.message || '未知错误'))
          // 移除上传失败的文件
          this.imageFileList = []
          this.brandStoryForm.image = ''
        }
      } else if (file.status !== 'ready') {
        // 更新文件列表（处理删除等操作，但跳过ready状态的文件以避免重复上传）
        this.imageFileList = fileList
        // 如果删除了图片，清空image字段
        if (fileList.length === 0) {
          this.brandStoryForm.image = ''
          this.$refs['brandStoryForm'].validateField('image')
        }
      }
    },

    // 查看品牌故事
    viewBrandStory(row) {
      this.viewingBrandStory = JSON.parse(JSON.stringify(row))
      this.viewDialogVisible = true
    },

    // 获取完整的图片URL
    getFullImageUrl(image) {
      if (!image) {
        return ''
      }
      // 如果已经是完整的URL，直接返回
      if (image.startsWith('http')) {
        return image
      }
      // 如果是CID，拼接完整的IPFS URL
      return `https://dev.xiangtaihou-food.com/ipfs/${image}`
    },

    // 保存品牌故事
    saveBrandStory() {
      this.$refs.brandStoryForm.validate((valid) => {
        if (valid) {
          this.loading = true
          const requestData = {
            ...this.brandStoryForm
          }

          const savePromise = this.isEditing
            ? updateBrandStory(requestData)
            : createBrandStory(requestData)

          savePromise.then(response => {
            if (response.code === 200) {
              this.$message.success(this.isEditing ? '编辑成功' : '添加成功')
              this.dialogVisible = false
              this.fetchBrandStoryList()
            } else {
              this.$message.error(this.isEditing ? '编辑失败' : '添加失败')
            }
            this.loading = false
          }).catch(error => {
            this.$message.error(this.isEditing ? '编辑失败' : '添加失败' + (error.message || '未知错误'))
            this.loading = false
          })
        }
      })
    },

    // 删除品牌故事
    deleteBrandStory(id) {
      this.$confirm('确定要删除这条品牌故事吗？删除后将无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        deleteBrandStory({ id }).then(response => {
          if (response.code === 200) {
            this.$message.success('删除成功')
            this.fetchBrandStoryList()
            // 从选中列表中移除
            this.selectedRows = this.selectedRows.filter(item => item.id !== id)
          } else {
            this.$message.error('删除失败')
          }
          this.loading = false
        }).catch(error => {
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
          this.loading = false
        })
      }).catch(() => {
        // 用户取消操作，不做处理
      })
    },

    // 批量删除
    batchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请先选择要删除的记录')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 条品牌故事吗？删除后将无法恢复`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        // 批量删除需要多次调用删除接口
        const deletePromises = this.selectedRows.map(row => deleteBrandStory({ id: row.id }))

        Promise.all(deletePromises).then(results => {
          // 检查是否有删除失败的记录
          const failedResults = results.filter(result => result.code !== 200)
          if (failedResults.length === 0) {
            this.$message.success(`成功删除 ${this.selectedRows.length} 条品牌故事`)
          } else {
            this.$message.warning(`删除完成，但有 ${failedResults.length} 条记录删除失败`)
          }
          this.fetchBrandStoryList()
          this.selectedRows = []
          this.loading = false
        }).catch(error => {
          this.$message.error('批量删除失败: ' + (error.message || '未知错误'))
          this.loading = false
        })
      }).catch(() => {
        // 用户取消操作，不做处理
      })
    }
  }
}
</script>

<style scoped>
.image-uploader {
  margin-bottom: 10px;
}

.image-preview {
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.story-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
