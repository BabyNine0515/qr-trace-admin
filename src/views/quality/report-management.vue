<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4" style="margin-bottom: 20px;">
        <el-breadcrumb-item>质量信息管理</el-breadcrumb-item>
        <el-breadcrumb-item>检验报告管理</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 操作按钮 -->
      <div class="operation-bar mb-4">
        <el-button type="primary" @click="openAddDialog">上传检验报告</el-button>
        <!-- <el-button type="danger" :disabled="selectedReports.length === 0" @click="batchDelete">
          批量删除 ({{ selectedReports.length }})
        </el-button>
        <el-button @click="exportReportList">导出报告列表</el-button> -->
      </div>

      <!-- 搜索和筛选 -->
      <el-form :inline="true" class="search-form mb-4">
        <el-form-item label="批次ID">
          <el-input v-model="searchForm.batch_id" placeholder="请输入批次ID" style="width: 200px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        ref="reportTable"
        v-loading="loading"
        :data="reportList"
        style="width: 100%"
        row-key="id"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="报告ID" width="180" />
        <el-table-column prop="batch_id" label="批次ID" width="180" />
        <el-table-column prop="report_img" label="报告图片" width="200">
          <template slot-scope="scope">
            <el-image
              :src="getFullImageUrl(scope.row.report_img)"
              :preview-src-list="[getFullImageUrl(scope.row.report_img)]"
              style="width: 100px; height: 100px;"
              fit="contain"
            />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column prop="updated_at" label="更新时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteReport(scope.row.id)">删除</el-button>
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

    <!-- 报告对话框（用于添加和编辑） -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="isEditing ? '编辑检验报告' : '上传检验报告'"
      :width="'600px'"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="批次ID" prop="batch_id">
          <el-select v-model="form.batch_id" placeholder="请选择批次ID" style="width: 100%;">
            <el-option
              v-for="batch in batchList"
              :key="batch.id"
              :label="batch.id"
              :value="batch.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="报告图片" prop="report_img">
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
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveReport">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getInspectionReportList, createInspectionReport, updateInspectionReport, deleteInspectionReport } from '@/api/quality.js'
import { uploadImage } from '@/api/media'
import { getBatchList } from '@/api/product.js'

export default {
  name: 'ReportManagement',
  data() {
    return {
      // 报告列表
      reportList: [],
      // 总记录数
      totalCount: 0,
      // 搜索参数
      searchForm: {
        batch_id: ''
      },
      // 分页参数
      currentPage: 1,
      pageSize: 10,
      // 选中的行
      selectedReports: [],
      // 对话框表单
      form: {
        batch_id: '',
        report_img: ''
      },
      // 表单验证规则
      formRules: {
        batch_id: [{ required: true, message: '请选择批次ID', trigger: 'change' }],
        report_img: [{ required: true, message: '请上传报告图片', trigger: 'change' }]
      },
      // 对话框状态
      dialogVisible: false,
      isEditing: false,
      // 加载状态
      loading: false,
      // 批次列表
      batchList: [],
      batchLoading: false,
      // 图片相关数据
      imageFileList: [],
      dialogVisibleImage: false,
      dialogImageUrl: ''
    }
  },
  created() {
    this.fetchReportList()
    this.fetchBatchList()
  },

  methods: {
    // 获取报告列表
    fetchReportList() {
      this.loading = true
      getInspectionReportList({
        page: this.currentPage,
        size: this.pageSize
        // batch_id: this.searchForm.batch_id
      })
        .then(response => {
          if (response.code === 200) {
            this.reportList = response.data.inspection_report_record
            this.totalCount = response.data.count
          } else {
            this.$message.error('获取检验报告列表失败：' + response.message)
          }
        })
        .catch(error => {
          this.$message.error('获取检验报告列表失败：' + error.message)
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 获取批次列表
    fetchBatchList() {
      this.batchLoading = true
      getBatchList({
        page: 1,
        size: 1000 // 获取足够多的批次，满足下拉选择需求
      })
        .then(response => {
          if (response.code === 200) {
            this.batchList = response.data.goods_batch_record || []
          } else {
            this.$message.error('获取批次列表失败：' + response.message)
          }
        })
        .catch(error => {
          this.$message.error('获取批次列表失败：' + error.message)
        })
        .finally(() => {
          this.batchLoading = false
        })
    },

    // 搜索
    search() {
      this.currentPage = 1 // 重置到第一页
      this.fetchReportList()
    },

    // 重置搜索
    resetSearch() {
      this.searchForm = {
        batch_id: ''
      }
      this.currentPage = 1
      this.fetchReportList()
    },

    // 处理选择变化
    handleSelectionChange(val) {
      this.selectedReports = val
    },

    // 处理行点击
    handleRowClick(row) {
      this.$refs['reportTable']?.toggleRowSelection(row)
    },

    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchReportList()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchReportList()
    },

    // 打开添加报告对话框
    openAddDialog() {
      this.isEditing = false
      this.dialogVisible = true
      this.form = {
        batch_id: '',
        report_img: ''
      }
      // 清空图片文件列表
      this.imageFileList = []
      this.$nextTick(() => {
        this.$refs.form.resetFields()
      })
    },

    // 打开编辑报告对话框
    openEditDialog(row) {
      this.isEditing = true
      this.dialogVisible = true
      this.form = {
        ...row
      }
      // 处理报告图片
      this.imageFileList = []
      if (row.report_img) {
        // 检查图片是完整URL还是cid
        let cid, fullUrl
        if (row.report_img.startsWith('http')) {
          fullUrl = row.report_img
          cid = row.report_img.split('/').pop()
        } else {
          cid = row.report_img
          fullUrl = `https://h5.xiangtaihou-food.com/ipfs/${cid}`
        }
        this.imageFileList.push({
          name: `报告图片${Math.random().toString(36).substr(2, 9)}`,
          url: fullUrl,
          cid: cid,
          status: 'success',
          uid: Date.now() + Math.random().toString(36).substr(2, 9)
        })
      }
    },

    // 图片预览
    handleImagePreview(file) {
      let previewUrl = file.url
      // 如果文件有cid属性，构造完整的IPFS路径
      if (file.cid) {
        previewUrl = `https://h5.xiangtaihou-food.com/ipfs/${file.cid}`
      } else if (file.response && file.response.data && file.response.data.cid) {
        // 处理已上传但可能url属性未更新的情况
        previewUrl = `https://h5.xiangtaihou-food.com/ipfs/${file.response.data.cid}`
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
      this.form.report_img = ''
      // 手动触发表单验证更新
      this.$refs.form.validateField('report_img')
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
            this.form.report_img = ''
            return
          }

          // 创建FormData并上传图片
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('type', 'qualityReport')

          // 调用上传接口
          const response = await uploadImage(formData)

          // 检查响应数据结构
          if (!response || !response.data) {
            throw new Error('上传接口返回数据格式不正确')
          }

          // 获取上传成功返回的URL或cid
          const imageUrl = response.data.url || `https://h5.xiangtaihou-food.com/ipfs/${response.data.cid}`
          const cid = response.data.cid || imageUrl.split('/').pop()

          // 更新文件对象，添加cid和预览URL
          const updatedFile = Object.assign({}, file, {
            url: imageUrl,
            cid: cid,
            status: 'success',
            uploading: false
          })

          // 更新文件列表，只保留当前上传的图片
          this.imageFileList = [updatedFile]
          // 更新表单数据
          this.form.report_img = response.data.url || cid
          // 手动触发表单验证更新
          this.$refs.form.validateField('report_img')
          this.$message.success('图片上传成功')
        } catch (error) {
          console.error('图片上传失败:', error)
          this.$message.error('图片上传失败: ' + (error.message || '未知错误'))
          // 移除上传失败的文件
          this.imageFileList = []
          this.form.report_img = ''
        }
      } else if (file.status !== 'ready') {
        // 更新文件列表（处理删除等操作，但跳过ready状态的文件以避免重复上传）
        this.imageFileList = fileList
        // 如果删除了图片，清空image字段
        if (fileList.length === 0) {
          this.form.report_img = ''
          this.$refs.form.validateField('report_img')
        }
      }
    },

    // 保存报告
    saveReport() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true
          if (this.isEditing) {
            // 更新报告
            updateInspectionReport(this.form)
              .then(response => {
                if (response.code === 200) {
                  this.$message.success('报告编辑成功')
                  this.dialogVisible = false
                  this.fetchReportList()
                } else {
                  this.$message.error('报告编辑失败：' + response.message)
                }
              })
              .catch(error => {
                this.$message.error('报告编辑失败：' + error.message)
              })
              .finally(() => {
                this.loading = false
              })
          } else {
            // 创建报告
            createInspectionReport(this.form)
              .then(response => {
                if (response.code === 200) {
                  this.$message.success('报告上传成功')
                  this.dialogVisible = false
                  this.fetchReportList()
                } else {
                  this.$message.error('报告上传失败：' + response.message)
                }
              })
              .catch(error => {
                this.$message.error('报告上传失败：' + error.message)
              })
              .finally(() => {
                this.loading = false
              })
          }
        }
      })
    },

    // 删除报告
    deleteReport(id) {
      this.$confirm('确定要删除这个检验报告吗？删除后将无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        deleteInspectionReport(id)
          .then(response => {
            if (response.code === 200) {
              this.$message.success('删除成功')
              this.fetchReportList()
            } else {
              this.$message.error('删除失败：' + response.message)
            }
          })
          .catch(error => {
            this.$message.error('删除失败：' + error.message)
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    // 批量删除
    batchDelete() {
      if (this.selectedReports.length === 0) {
        this.$message.warning('请先选择要删除的记录')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedReports.length} 个检验报告吗？删除后将无法恢复`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        // 逐个删除，或调用批量删除API
        Promise.all(this.selectedReports.map(item => deleteInspectionReport(item.id)))
          .then(() => {
            this.$message.success(`成功删除 ${this.selectedReports.length} 个检验报告`)
            this.selectedReports = []
            this.fetchReportList()
          })
          .catch(error => {
            this.$message.error('批量删除失败：' + error.message)
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    // 导出报告列表
    exportReportList() {
      this.$message.info('导出功能开发中...')
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
      return `https://h5.xiangtaihou-food.com/ipfs/${image}`
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
  margin-bottom: 15px;
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

@media (max-width: 768px) {
  .operation-bar {
    flex-wrap: wrap;
  }

  .search-form {
    padding: 10px;
  }
}
</style>
