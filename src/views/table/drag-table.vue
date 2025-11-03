<template>
  <div class="anti-fake-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>防伪二维码管理</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增防伪码</el-button>
        <el-button type="success" icon="el-icon-download" @click="handleBatchDownload">
          批量下载外箱二维码
        </el-button>
        <el-button icon="el-icon-printer" @click="handlePrint">打印二维码</el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="商品编号">
          <el-input
            v-model="searchForm.productCode"
            placeholder="请输入商品编号"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入商品名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="防伪码">
          <el-input
            v-model="searchForm.antiFakeCode"
            placeholder="请输入防伪码"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="生产时间">
          <el-date-picker
            v-model="searchForm.productionTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        :data="qrCodeList"
        stripe
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无数据"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        
        <el-table-column type="index" label="序号" width="80" align="center" />
        
        <!-- 内盖二维码 -->
        <el-table-column label="内盖二维码" width="200" align="center">
          <template #default="{ row }">
            <div class="qr-code-container" @click="handleQrCodePreview(row)">
              <div class="qr-code-image">
                <!-- 模拟二维码图片 -->
                <div class="qr-code-preview">
                  <div class="qr-code-content">
                    <div class="qr-pattern">
                      <div class="qr-corner top-left"></div>
                      <div class="qr-corner top-right"></div>
                      <div class="qr-corner bottom-left"></div>
                      <div class="qr-dots">
                        <div v-for="i in 25" :key="i" class="qr-dot" :class="{ filled: Math.random() > 0.3 }"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="qr-code-text">证由硒42"新防伪内招{{ row.innerCode }}</div>
              </div>
              <div class="qr-code-label">点击查看二维码</div>
            </div>
          </template>
        </el-table-column>

        <!-- 商品编号 -->
        <el-table-column prop="productCode" label="商品编号" width="140" align="center">
          <template #default="{ row }">
            <span class="product-code">{{ row.productCode }}</span>
          </template>
        </el-table-column>

        <!-- 商品名称 -->
        <el-table-column label="商品名称" min-width="180">
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-name">{{ row.productName }}</div>
              <div class="product-spec">{{ row.specification }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 生产时间 -->
        <el-table-column prop="productionTime" label="生产时间" width="160" align="center">
          <template #default="{ row }">
            <span class="time-text">{{ row.productionTime || '未设置' }}</span>
          </template>
        </el-table-column>

        <!-- 出库时间 -->
        <el-table-column prop="outboundTime" label="出库时间" width="160" align="center">
          <template #default="{ row }">
            <span class="time-text">{{ row.outboundTime || '未出库' }}</span>
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column prop="createTime" label="创建时间" width="160" align="center" sortable>
          <template #default="{ row }">
            <span class="time-text">{{ row.createTime }}</span>
          </template>
        </el-table-column>

        <!-- 更新时间 -->
        <el-table-column prop="updateTime" label="更新时间" width="160" align="center" sortable>
          <template #default="{ row }">
            <span class="time-text">{{ row.updateTime }}</span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="handleEdit(row)"
              >
                修改
              </el-button>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div class="batch-actions" v-if="multipleSelection.length > 0">
        <span class="batch-count">已选择 {{ multipleSelection.length }} 项</span>
        <el-button size="small" type="success" @click="handleBatchDownloadSelected">
          下载选中二维码
        </el-button>
        <el-button size="small" type="danger" @click="handleBatchDelete">
          批量删除
        </el-button>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 二维码预览对话框 -->
    <el-dialog
      title="二维码预览"
      :visible.sync="qrPreviewVisible"
      width="400px"
      center
    >
      <div class="qr-preview-container">
        <div class="qr-preview-image">
          <div class="qr-large-pattern">
            <div class="qr-large-corner top-left"></div>
            <div class="qr-large-corner top-right"></div>
            <div class="qr-large-corner bottom-left"></div>
            <div class="qr-large-dots">
              <div v-for="i in 49" :key="i" class="qr-large-dot" :class="{ filled: Math.random() > 0.3 }"></div>
            </div>
          </div>
        </div>
        <div class="qr-preview-info">
          <div class="preview-title">防伪二维码信息</div>
          <div class="preview-detail">
            <p><strong>商品编号：</strong>{{ currentQrCode.productCode }}</p>
            <p><strong>商品名称：</strong>{{ currentQrCode.productName }}</p>
            <p><strong>防伪码：</strong>{{ currentQrCode.innerCode }}</p>
            <p><strong>创建时间：</strong>{{ currentQrCode.createTime }}</p>
          </div>
        </div>
        <div class="preview-actions">
          <el-button type="primary" @click="downloadQrCode(currentQrCode)">下载二维码</el-button>
          <el-button @click="qrPreviewVisible = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="qrCodeForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="商品编号" prop="productCode">
          <el-input v-model="formData.productCode" placeholder="请输入商品编号" />
        </el-form-item>
        
        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="formData.productName" placeholder="请输入商品名称" />
        </el-form-item>
        
        <el-form-item label="防伪码" prop="innerCode">
          <el-input v-model="formData.innerCode" placeholder="请输入防伪码" />
        </el-form-item>
        
        <el-form-item label="规格" prop="specification">
          <el-input v-model="formData.specification" placeholder="请输入规格" />
        </el-form-item>
        
        <el-form-item label="生产时间">
          <el-date-picker
            v-model="formData.productionTime"
            type="datetime"
            placeholder="选择生产时间"
            style="width: 100%"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        
        <el-form-item label="出库时间">
          <el-date-picker
            v-model="formData.outboundTime"
            type="datetime"
            placeholder="选择出库时间"
            style="width: 100%"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AntiFakeManagement',
  data() {
    return {
      loading: false,
      dialogVisible: false,
      qrPreviewVisible: false,
      submitLoading: false,
      isEdit: false,
      dialogTitle: '新增防伪码',
      multipleSelection: [],
      currentQrCode: {},
      searchForm: {
        productCode: '',
        productName: '',
        antiFakeCode: '',
        productionTime: ''
      },
      formData: {
        id: null,
        productCode: '',
        productName: '',
        innerCode: '',
        specification: '',
        productionTime: '',
        outboundTime: '',
        createTime: '',
        updateTime: ''
      },
      formRules: {
        productCode: [
          { required: true, message: '请输入商品编号', trigger: 'blur' }
        ],
        productName: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        innerCode: [
          { required: true, message: '请输入防伪码', trigger: 'blur' }
        ]
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      qrCodeList: [
        {
          id: 1,
          productCode: '162161029',
          productName: '古贝春 42*新防伪F',
          innerCode: '51110988B',
          specification: '42度 500ml',
          productionTime: '2025-09-10 08:00:00',
          outboundTime: '2025-09-12 14:30:00',
          createTime: '2025-09-13 01:04:33',
          updateTime: '2025-09-13 01:04:33'
        },
        {
          id: 2,
          productCode: '153736061',
          productName: '古贝春 42*新防伪F',
          innerCode: '51110988B',
          specification: '42度 500ml',
          productionTime: '2025-09-10 09:00:00',
          outboundTime: '2025-09-12 15:00:00',
          createTime: '2025-09-13 01:04:33',
          updateTime: '2025-09-13 01:04:33'
        },
        {
          id: 3,
          productCode: '140779217',
          productName: '古贝春 42*新防伪F',
          innerCode: '51110988B',
          specification: '42度 500ml',
          productionTime: '2025-09-10 10:00:00',
          outboundTime: '2025-09-12 16:00:00',
          createTime: '2025-09-13 01:04:33',
          updateTime: '2025-09-13 01:04:33'
        }
      ]
    }
  },
  mounted() {
    this.pagination.total = this.qrCodeList.length
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    
    handleQrCodePreview(row) {
      this.currentQrCode = row
      this.qrPreviewVisible = true
    },
    
    downloadQrCode(row) {
      this.$message.success(`开始下载 ${row.productCode} 的二维码`)
      // 实际项目中这里会调用下载API
    },
    
    handleSearch() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
        this.$message.success('查询完成')
      }, 500)
    },
    
    handleReset() {
      this.searchForm = {
        productCode: '',
        productName: '',
        antiFakeCode: '',
        productionTime: ''
      }
      this.$message.info('已重置搜索条件')
    },
    
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增防伪码'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.qrCodeForm.resetFields()
        this.formData.id = null
      })
    },
    
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '修改防伪码'
      this.formData = { ...row }
      this.dialogVisible = true
    },
    
    handleDelete(row) {
      this.$confirm(`确定要删除防伪码 "${row.productCode}" 吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.qrCodeList.findIndex(item => item.id === row.id)
        if (index !== -1) {
          this.qrCodeList.splice(index, 1)
          this.pagination.total = this.qrCodeList.length
          this.$message.success('删除成功')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    
    handleBatchDownload() {
      this.$message.success('批量下载外箱二维码功能开发中...')
    },
    
    handleBatchDownloadSelected() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请先选择要下载的二维码')
        return
      }
      const codes = this.multipleSelection.map(item => item.productCode).join(', ')
      this.$message.success(`开始下载选中的二维码: ${codes}`)
    },
    
    handleBatchDelete() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请先选择要删除的二维码')
        return
      }
      this.$confirm(`确定要删除选中的 ${this.multipleSelection.length} 个防伪码吗？`, '批量删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.multipleSelection.map(item => item.id)
        this.qrCodeList = this.qrCodeList.filter(item => !ids.includes(item.id))
        this.pagination.total = this.qrCodeList.length
        this.multipleSelection = []
        this.$message.success('批量删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    
    handlePrint() {
      this.$message.info('打印功能开发中...')
    },
    
    handleSubmit() {
      this.$refs.qrCodeForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          
          setTimeout(() => {
            if (this.isEdit) {
              const index = this.qrCodeList.findIndex(item => item.id === this.formData.id)
              if (index !== -1) {
                this.qrCodeList.splice(index, 1, { 
                  ...this.formData,
                  updateTime: new Date().toLocaleString('sv').replace('T', ' ').substring(0, 19)
                })
              }
              this.$message.success('修改成功')
            } else {
              const newQrCode = {
                ...this.formData,
                id: Date.now(),
                createTime: new Date().toLocaleString('sv').replace('T', ' ').substring(0, 19),
                updateTime: new Date().toLocaleString('sv').replace('T', ' ').substring(0, 19)
              }
              this.qrCodeList.unshift(newQrCode)
              this.pagination.total = this.qrCodeList.length
              this.$message.success('新增成功')
            }
            
            this.submitLoading = false
            this.dialogVisible = false
          }, 1000)
        }
      })
    },
    
    handleDialogClose() {
      this.$refs.qrCodeForm.resetFields()
    },
    
    handleSizeChange(newSize) {
      this.pagination.pageSize = newSize
      this.pagination.currentPage = 1
    },
    
    handleCurrentChange(newPage) {
      this.pagination.currentPage = newPage
    }
  }
}
</script>

<style scoped>
.anti-fake-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  color: #303133;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.search-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.search-form {
  margin-bottom: 0;
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 二维码样式 */
.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  padding: 8px;
  border-radius: 4px;
}

.qr-code-container:hover {
  background-color: #f0f9ff;
  transform: translateY(-2px);
}

.qr-code-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.qr-code-preview {
  width: 80px;
  height: 80px;
  border: 2px solid #409eff;
  border-radius: 8px;
  padding: 4px;
  background: white;
  position: relative;
}

.qr-code-content {
  width: 100%;
  height: 100%;
  background: white;
  position: relative;
}

.qr-pattern {
  position: relative;
  width: 100%;
  height: 100%;
}

.qr-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid #000;
}

.qr-corner.top-left {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.qr-corner.top-right {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.qr-corner.bottom-left {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.qr-dots {
  position: absolute;
  top: 16px;
  left: 16px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  width: calc(100% - 32px);
  height: calc(100% - 32px);
}

.qr-dot {
  width: 4px;
  height: 4px;
  background: #f0f0f0;
  border-radius: 1px;
  transition: all 0.3s;
}

.qr-dot.filled {
  background: #000;
}

.qr-code-text {
  font-size: 10px;
  color: #409eff;
  text-align: center;
  line-height: 1.2;
  font-weight: 500;
}

.qr-code-label {
  font-size: 11px;
  color: #909399;
  font-style: italic;
}

/* 二维码预览大图样式 */
.qr-preview-container {
  text-align: center;
  padding: 20px;
}

.qr-preview-image {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.qr-large-pattern {
  width: 200px;
  height: 200px;
  border: 3px solid #409eff;
  border-radius: 12px;
  padding: 10px;
  background: white;
  position: relative;
}

.qr-large-corner {
  position: absolute;
  width: 25px;
  height: 25px;
  border: 3px solid #000;
}

.qr-large-corner.top-left {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.qr-large-corner.top-right {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.qr-large-corner.bottom-left {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.qr-large-dots {
  position: absolute;
  top: 35px;
  left: 35px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  width: calc(100% - 70px);
  height: calc(100% - 70px);
}

.qr-large-dot {
  width: 8px;
  height: 8px;
  background: #f0f0f0;
  border-radius: 2px;
}

.qr-large-dot.filled {
  background: #000;
}

.qr-preview-info {
  margin-bottom: 20px;
  text-align: left;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
}

.preview-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
  text-align: center;
}

.preview-detail p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
}

.preview-detail strong {
  color: #303133;
}

.preview-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 其他样式 */
.product-code {
  font-family: 'Courier New', monospace;
  color: #409eff;
  font-weight: 500;
  font-size: 14px;
}

.product-info {
  text-align: left;
}

.product-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  font-size: 14px;
}

.product-spec {
  font-size: 12px;
  color: #909399;
}

.time-text {
  font-size: 12px;
  color: #909399;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.batch-actions {
  margin-top: 16px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 4px;
  border: 1px solid #e1f3ff;
  display: flex;
  align-items: center;
  gap: 12px;
}

.batch-count {
  color: #409eff;
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-form .el-form-item {
    margin-bottom: 12px;
  }
}

/* 表格样式优化 */
::v-deep .el-table .cell {
  padding: 8px 12px;
  line-height: 1.4;
}

::v-deep .el-table--enable-row-hover .el-table__body tr:hover>td {
  background-color: #f5f7fa !important;
}
</style>