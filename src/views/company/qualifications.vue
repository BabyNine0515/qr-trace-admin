<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item>公司信息管理</el-breadcrumb-item>
        <el-breadcrumb-item>公司资质管理</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 资质证书上传区域 -->
      <el-card shadow="never" class="mb-4">
        <template slot="header">
          <div class="card-header">
            <span>上传资质证书</span>
          </div>
        </template>

        <el-upload
          class="qualification-uploader"
          action="#"
          :on-success="handleUploadSuccess"
          :before-upload="beforeUpload"
          :file-list="tempFileList"
          :multiple="true"
          :limit="10"
          :on-exceed="handleExceed"
          :accept="'.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx'"
          list-type="picture-card"
          :auto-upload="false"
        >
          <i class="el-icon-plus" />
          <div class="el-upload__text">点击上传或拖拽文件到此处</div>
          <div slot="tip" class="el-upload__tip">
            支持PDF、图片和文档格式，单个文件不超过20MB，最多上传10个文件
          </div>
        </el-upload>

        <div v-if="tempFileList.length > 0" class="upload-actions">
          <el-button type="primary" @click="submitUpload">确认上传</el-button>
          <el-button @click="clearTempFiles">取消</el-button>
        </div>
      </el-card>

      <!-- 资质证书列表 -->
      <el-card shadow="never">
        <template slot="header">
          <div class="card-header">
            <span>资质证书列表 ({{ qualificationList.length }})</span>
            <el-button type="danger" size="small" :disabled="!selectedRows.length" @click="batchDelete">
              批量删除 ({{ selectedRows.length }})
            </el-button>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="qualificationList"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <el-table-column
            type="selection"
            width="55"
            align="center"
          />

          <el-table-column
            label="预览"
            width="80"
            align="center"
          >
            <template slot-scope="scope">
              <el-button type="text" @click="previewFile(scope.row)">
                预览
              </el-button>
            </template>
          </el-table-column>

          <el-table-column
            prop="name"
            label="证书名称"
            min-width="180"
            show-overflow-tooltip
          />

          <el-table-column
            prop="type"
            label="证书类型"
            width="120"
          >
            <template slot-scope="scope">
              <el-tag :type="getTypeTagType(scope.row.type)">
                {{ getTypeLabel(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="issueDate"
            label="颁发日期"
            width="120"
            sortable="custom"
          />

          <el-table-column
            prop="expiryDate"
            label="有效期至"
            width="120"
            sortable="custom"
          >
            <template slot-scope="scope">
              <span :class="{ 'expired': isExpired(scope.row.expiryDate) }">
                {{ scope.row.expiryDate || '长期有效' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column
            prop="issuingAuthority"
            label="颁发机构"
            min-width="150"
            show-overflow-tooltip
          />

          <el-table-column
            prop="status"
            label="状态"
            width="80"
          >
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                {{ scope.row.status === 'active' ? '有效' : '失效' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="sortOrder"
            label="排序"
            width="80"
            sortable="custom"
          >
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.sortOrder"
                :min="1"
                :max="qualificationList.length"
                @change="updateSortOrder(scope.row)"
              />
            </template>
          </el-table-column>

          <el-table-column
            prop="description"
            label="备注"
            min-width="200"
            show-overflow-tooltip
          />

          <el-table-column
            fixed="right"
            label="操作"
            width="180"
          >
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                @click="editQualification(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="mini"
                @click="deleteQualification(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 编辑资质证书对话框 -->
      <el-dialog
        :visible.sync="editDialogVisible"
        title="编辑资质证书"
        :width="'600px'"
      >
        <el-form
          ref="editForm"
          :model="editingItem"
          :rules="editRules"
          label-width="100px"
        >
          <el-form-item label="证书名称" prop="name">
            <el-input
              v-model="editingItem.name"
              placeholder="请输入证书名称"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="证书类型" prop="type">
            <el-select
              v-model="editingItem.type"
              placeholder="请选择证书类型"
            >
              <el-option
                v-for="type in qualificationTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="颁发日期" prop="issueDate">
            <el-date-picker
              v-model="editingItem.issueDate"
              type="date"
              placeholder="请选择颁发日期"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>

          <el-form-item label="有效期至" prop="expiryDate">
            <el-date-picker
              v-model="editingItem.expiryDate"
              type="date"
              placeholder="请选择有效期至"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>

          <el-form-item label="颁发机构" prop="issuingAuthority">
            <el-input
              v-model="editingItem.issuingAuthority"
              placeholder="请输入颁发机构"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="证书状态" prop="status">
            <el-radio-group v-model="editingItem.status">
              <el-radio label="active">有效</el-radio>
              <el-radio label="inactive">失效</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="备注" prop="description">
            <el-input
              v-model="editingItem.description"
              type="textarea"
              placeholder="请输入备注信息"
              :rows="3"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </div>
      </el-dialog>

      <!-- 预览对话框 -->
      <el-dialog
        :visible.sync="previewDialogVisible"
        :title="previewItem.name || '预览资质证书'"
        width="800px"
      >
        <div class="preview-container">
          <template v-if="previewItem.fileType.includes('image')">
            <el-image :src="previewItem.url" fit="contain" style="width: 100%; height: 600px;" />
          </template>
          <template v-else-if="previewItem.fileType.includes('pdf')">
            <div class="pdf-placeholder">
              <i class="el-icon-document" />
              <p>PDF文件预览</p>
              <el-button type="primary" @click="downloadFile(previewItem)">下载文件</el-button>
            </div>
          </template>
          <template v-else>
            <div class="file-placeholder">
              <i class="el-icon-document" />
              <p>{{ previewItem.name }}</p>
              <p class="file-info">文件大小: {{ formatFileSize(previewItem.size) }}</p>
              <p class="file-info">文件类型: {{ previewItem.fileType }}</p>
              <el-button type="primary" @click="downloadFile(previewItem)">下载文件</el-button>
            </div>
          </template>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CompanyQualifications',
  data() {
    return {
      loading: false,
      tempFileList: [],
      qualificationList: [],
      selectedRows: [],
      qualificationTypes: [
        { label: '营业执照', value: 'business_license' },
        { label: '食品经营许可证', value: 'food_license' },
        { label: 'ISO认证', value: 'iso_certification' },
        { label: '有机认证', value: 'organic_certification' },
        { label: '绿色食品认证', value: 'green_food_certification' },
        { label: 'HACCP认证', value: 'haccp_certification' },
        { label: '其他资质', value: 'other' }
      ],
      editDialogVisible: false,
      previewDialogVisible: false,
      editingItem: {
        id: '',
        name: '',
        type: '',
        issueDate: '',
        expiryDate: '',
        issuingAuthority: '',
        status: 'active',
        description: ''
      },
      previewItem: {},
      editRules: {
        name: [
          { required: true, message: '请输入证书名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择证书类型', trigger: 'change' }
        ],
        issueDate: [
          { required: true, message: '请选择颁发日期', trigger: 'change' }
        ],
        issuingAuthority: [
          { required: true, message: '请输入颁发机构', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchQualifications()
  },
  methods: {
    // 获取资质列表
    fetchQualifications() {
      this.loading = true
      // 模拟API请求
      setTimeout(() => {
        this.qualificationList = [
          {
            id: '1',
            name: '营业执照',
            type: 'business_license',
            url: 'https://via.placeholder.com/800x600?text=Business+License',
            fileType: 'image/jpeg',
            size: 2048000,
            issueDate: '2018-06-15',
            expiryDate: '',
            issuingAuthority: '长沙市工商行政管理局',
            status: 'active',
            sortOrder: 1,
            description: '营业执照正副本'
          },
          {
            id: '2',
            name: '食品经营许可证',
            type: 'food_license',
            url: 'https://via.placeholder.com/800x600?text=Food+License',
            fileType: 'image/png',
            size: 1536000,
            issueDate: '2018-07-20',
            expiryDate: '2023-07-19',
            issuingAuthority: '长沙市食品药品监督管理局',
            status: 'active',
            sortOrder: 2,
            description: '食品经营许可证'
          },
          {
            id: '3',
            name: 'ISO9001质量管理体系认证',
            type: 'iso_certification',
            url: 'https://via.placeholder.com/800x600?text=ISO+Certification',
            fileType: 'application/pdf',
            size: 3072000,
            issueDate: '2019-03-10',
            expiryDate: '2022-03-09',
            issuingAuthority: '中国质量认证中心',
            status: 'inactive',
            sortOrder: 3,
            description: 'ISO9001:2015认证证书'
          }
        ]
        this.loading = false
      }, 1000)
    },

    // 上传前检查
    beforeUpload(file) {
      const isAllowedType = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'].includes(
        '.' + file.name.split('.').pop().toLowerCase()
      )
      const isLt20M = file.size / 1024 / 1024 < 20

      if (!isAllowedType) {
        this.$message.error('上传文件只能是 PDF、图片和文档格式!')
      }
      if (!isLt20M) {
        this.$message.error('上传文件大小不能超过 20MB!')
      }
      return isAllowedType && isLt20M
    },

    // 处理文件超出限制
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制最多上传10个文件`)
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

      this.loading = true
      // 模拟上传处理
      setTimeout(() => {
        const newQualifications = this.tempFileList.map((file, index) => ({
          id: Date.now() + index.toString(),
          name: file.name,
          type: 'other',
          url: URL.createObjectURL(file.raw) || file.url,
          fileType: file.raw ? file.raw.type : 'application/octet-stream',
          size: file.size || 0,
          issueDate: '',
          expiryDate: '',
          issuingAuthority: '',
          status: 'active',
          sortOrder: this.qualificationList.length + index + 1,
          description: ''
        }))

        this.qualificationList = [...this.qualificationList, ...newQualifications]
        this.tempFileList = []
        this.loading = false
        this.$message.success(`成功上传 ${newQualifications.length} 个资质证书`)
      }, 2000)
    },

    // 清空临时文件
    clearTempFiles() {
      this.tempFileList = []
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 处理排序变化
    handleSortChange({ prop, order }) {
      if (order === 'ascending') {
        this.qualificationList.sort((a, b) => a[prop] > b[prop] ? 1 : -1)
      } else if (order === 'descending') {
        this.qualificationList.sort((a, b) => a[prop] < b[prop] ? 1 : -1)
      }
    },

    // 获取证书类型标签类型
    getTypeTagType(type) {
      const typeMap = {
        'business_license': 'primary',
        'food_license': 'success',
        'iso_certification': 'warning',
        'organic_certification': 'info',
        'green_food_certification': 'success',
        'haccp_certification': 'warning',
        'other': 'default'
      }
      return typeMap[type] || 'default'
    },

    // 获取证书类型标签
    getTypeLabel(type) {
      const typeObj = this.qualificationTypes.find(t => t.value === type)
      return typeObj ? typeObj.label : '未知类型'
    },

    // 判断是否过期
    isExpired(expiryDate) {
      if (!expiryDate) return false
      return new Date(expiryDate) < new Date()
    },

    // 更新排序
    updateSortOrder(row) {
      // 这里可以实现排序逻辑
      this.$message.success('排序已更新')
    },

    // 编辑资质
    editQualification(row) {
      this.editingItem = { ...row }
      this.editDialogVisible = true
    },

    // 保存编辑
    saveEdit() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          // 模拟保存
          setTimeout(() => {
            const index = this.qualificationList.findIndex(item => item.id === this.editingItem.id)
            if (index > -1) {
              this.qualificationList.splice(index, 1, { ...this.editingItem })
            }
            this.editDialogVisible = false
            this.$message.success('保存成功')
          }, 1000)
        }
      })
    },

    // 删除资质
    deleteQualification(id) {
      this.$confirm('确定要删除这个资质证书吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟删除
        setTimeout(() => {
          this.qualificationList = this.qualificationList.filter(item => item.id !== id)
          this.$message.success('删除成功')
        }, 500)
      })
    },

    // 批量删除
    batchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的资质证书')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 个资质证书吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟删除
        setTimeout(() => {
          const idsToDelete = this.selectedRows.map(item => item.id)
          this.qualificationList = this.qualificationList.filter(item => !idsToDelete.includes(item.id))
          this.selectedRows = []
          this.$message.success(`成功删除 ${idsToDelete.length} 个资质证书`)
        }, 500)
      })
    },

    // 预览文件
    previewFile(item) {
      this.previewItem = { ...item }
      this.previewDialogVisible = true
    },

    // 下载文件
    downloadFile(item) {
      this.$message({ type: 'info', message: '文件下载功能开发中...' })
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

.upload-actions {
  margin-top: 20px;
  text-align: right;
}

.qualification-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  padding: 20px;
  background-color: #fafafa;
}

.expired {
  color: #f56c6c;
  font-weight: 500;
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

.pdf-placeholder,
.file-placeholder {
  text-align: center;
  padding: 40px;
}

.pdf-placeholder i,
.file-placeholder i {
  font-size: 64px;
  color: #409eff;
  margin-bottom: 20px;
}

.file-info {
  color: #909399;
  margin-top: 10px;
}
</style>
