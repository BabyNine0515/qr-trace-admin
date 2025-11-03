<template>
  <div class="product-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>商品管理</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增商品</el-button>
        <el-button icon="el-icon-download" @click="handleExport">导出数据</el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="商品编号">
          <el-input
            v-model="searchForm.productId"
            placeholder="请输入商品编号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入商品名称"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="品牌">
          <el-select v-model="searchForm.brand" placeholder="请选择品牌" clearable>
            <el-option label="Ree" value="Ree" />
            <el-option label="Nike" value="Nike" />
            <el-option label="Adidas" value="Adidas" />
          </el-select>
        </el-form-item>
        <el-form-item label="产地">
          <el-select v-model="searchForm.origin" placeholder="请选择产地" clearable>
            <el-option label="山东" value="山东" />
            <el-option label="广东" value="广东" />
            <el-option label="浙江" value="浙江" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="BE" value="BE" />
            <el-option label="CE" value="CE" />
            <el-option label="DE" value="DE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 商品列表 -->
    <el-card class="table-card">
      <el-table
        :data="productList"
        stripe
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无数据"
      >
        <!-- 商品编号 -->
        <el-table-column prop="id" label="商品编号" width="100" align="center" fixed />
        
        <!-- 商品图片 -->
        <el-table-column label="商品图片" width="120" align="center">
          <template #default="{ row }">
            <div class="product-image">
              <el-image
                :src="row.image"
                :preview-src-list="[row.image]"
                fit="cover"
                class="product-img"
                @error="handleImageError(row)"
              >
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </div>
          </template>
        </el-table-column>

        <!-- 商品名称 -->
        <el-table-column label="商品名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-name">{{ row.name }}</div>
              <div class="product-desc">{{ row.description }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 生产企业 -->
        <el-table-column prop="manufacturer" label="生产企业" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="manufacturer">{{ row.manufacturer }}</span>
          </template>
        </el-table-column>

        <!-- 品牌 -->
        <el-table-column prop="brand" label="品牌" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.brand }}</el-tag>
          </template>
        </el-table-column>

        <!-- 产地 -->
        <el-table-column prop="origin" label="产地" width="100" align="center">
          <template #default="{ row }">
            <span class="origin">{{ row.origin }}</span>
          </template>
        </el-table-column>

        <!-- 类型 -->
        <el-table-column prop="type" label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.type }}</el-tag>
          </template>
        </el-table-column>

        <!-- 规格 -->
        <el-table-column prop="specification" label="规格" width="100" align="center">
          <template #default="{ row }">
            <span class="specification">{{ row.specification }}</span>
          </template>
        </el-table-column>

        <!-- 排序 -->
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" sortable>
          <template #default="{ row }">
            <span class="sort-order">{{ row.sortOrder }}</span>
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
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                size="mini"
                type="primary"
                link
                icon="el-icon-edit"
                @click="handleEdit(row)"
                class="edit-btn"
              >
                修改
              </el-button>
              <el-button
                size="mini"
                type="danger"
                link
                icon="el-icon-delete"
                @click="handleDelete(row)"
                class="delete-btn"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 商品编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="productForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入商品名称" />
        </el-form-item>
        
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="请输入商品描述"
          />
        </el-form-item>
        
        <el-form-item label="生产企业" prop="manufacturer">
          <el-input v-model="formData.manufacturer" placeholder="请输入生产企业" />
        </el-form-item>
        
        <el-form-item label="品牌" prop="brand">
          <el-select v-model="formData.brand" placeholder="请选择品牌" style="width: 100%">
            <el-option label="Ree" value="Ree" />
            <el-option label="Nike" value="Nike" />
            <el-option label="Adidas" value="Adidas" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="产地" prop="origin">
          <el-select v-model="formData.origin" placeholder="请选择产地" style="width: 100%">
            <el-option label="山东" value="山东" />
            <el-option label="广东" value="广东" />
            <el-option label="浙江" value="浙江" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="BE" value="BE" />
            <el-option label="CE" value="CE" />
            <el-option label="DE" value="DE" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="规格" prop="specification">
          <el-input v-model="formData.specification" placeholder="请输入规格" />
        </el-form-item>
        
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number 
            v-model="formData.sortOrder" 
            :min="0" 
            :max="999"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="商品图片">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <el-image v-if="formData.image" :src="formData.image" class="avatar" fit="cover" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
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
  name: 'ProductManagement',
  data() {
    return {
      loading: false,
      dialogVisible: false,
      submitLoading: false,
      isEdit: false,
      dialogTitle: '新增商品',
      searchForm: {
        productId: '',
        productName: '',
        brand: '',
        origin: '',
        type: ''
      },
      formData: {
        id: null,
        name: '',
        description: '',
        image: '',
        manufacturer: '',
        brand: 'Ree',
        origin: '山东',
        type: 'BE',
        specification: '',
        sortOrder: 100,
        createTime: '',
        updateTime: ''
      },
      formRules: {
        name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        manufacturer: [
          { required: true, message: '请输入生产企业', trigger: 'blur' }
        ],
        brand: [
          { required: true, message: '请选择品牌', trigger: 'change' }
        ]
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      productList: [
        {
          id: 1,
          name: 'ae 42°84.',
          description: '168590663, aheene. she',
          image: '',
          manufacturer: '168590663, aheene. she',
          brand: 'Ree',
          origin: '山东',
          type: 'BE',
          specification: 'BE',
          sortOrder: 100,
          createTime: '2024-05-08 16:06:46',
          updateTime: '2024-05-10 16:32:06'
        },
        {
          id: 2,
          name: 'Nike Air Max',
          description: '运动鞋系列',
          image: '',
          manufacturer: '耐克体育有限公司',
          brand: 'Nike',
          origin: '广东',
          type: 'CE',
          specification: '42码',
          sortOrder: 95,
          createTime: '2024-05-07 10:20:30',
          updateTime: '2024-05-09 14:15:20'
        },
        {
          id: 3,
          name: 'Adidas Ultraboost',
          description: '跑步鞋系列',
          image: '',
          manufacturer: '阿迪达斯中国',
          brand: 'Adidas',
          origin: '浙江',
          type: 'DE',
          specification: '41码',
          sortOrder: 90,
          createTime: '2024-05-06 09:15:25',
          updateTime: '2024-05-08 11:30:45'
        }
      ]
    }
  },
  mounted() {
    this.pagination.total = this.productList.length
  },
  methods: {
    handleImageError(row) {
      row.image = ''
    },
    
    handleUploadSuccess(response) {
      this.formData.image = response.url
    },
    
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    
    handleSearch() {
      this.loading = true
      // 模拟搜索
      setTimeout(() => {
        this.loading = false
        this.$message.success('查询完成')
      }, 500)
    },
    
    handleReset() {
      this.searchForm = {
        productId: '',
        productName: '',
        brand: '',
        origin: '',
        type: ''
      }
      this.$message.info('已重置搜索条件')
    },
    
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增商品'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.productForm.resetFields()
        this.formData.id = null
        this.formData.sortOrder = 100
      })
    },
    
    handleEdit(product) {
      this.isEdit = true
      this.dialogTitle = '修改商品'
      this.formData = { ...product }
      this.dialogVisible = true
    },
    
    handleDelete(product) {
      this.$confirm(`确定要删除商品 "${product.name}" 吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.productList.findIndex(item => item.id === product.id)
        if (index !== -1) {
          this.productList.splice(index, 1)
          this.pagination.total = this.productList.length
          this.$message.success('删除成功')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    
    handleSubmit() {
      this.$refs.productForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          
          // 模拟API调用
          setTimeout(() => {
            if (this.isEdit) {
              // 更新商品
              const index = this.productList.findIndex(item => item.id === this.formData.id)
              if (index !== -1) {
                this.productList.splice(index, 1, { 
                  ...this.formData,
                  updateTime: new Date().toLocaleString('sv').replace('T', ' ').substring(0, 19)
                })
              }
              this.$message.success('修改成功')
            } else {
              // 新增商品
              const newProduct = {
                ...this.formData,
                id: Date.now(),
                createTime: new Date().toLocaleString('sv').replace('T', ' ').substring(0, 19),
                updateTime: new Date().toLocaleString('sv').replace('T', ' ').substring(0, 19)
              }
              this.productList.unshift(newProduct)
              this.pagination.total = this.productList.length
              this.$message.success('新增成功')
            }
            
            this.submitLoading = false
            this.dialogVisible = false
          }, 1000)
        }
      })
    },
    
    handleDialogClose() {
      this.$refs.productForm.resetFields()
    },
    
    handleExport() {
      this.$message.success('导出功能开发中...')
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
.product-management {
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

.product-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-img {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.image-slot {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  color: #c0c4cc;
  font-size: 24px;
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

.product-desc {
  font-size: 12px;
  color: #909399;
}

.manufacturer,
.origin,
.specification {
  color: #606266;
  font-size: 13px;
}

.sort-order {
  color: #e6a23c;
  font-weight: 500;
}

.time-text {
  font-size: 12px;
  color: #909399;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.edit-btn {
  color: #409eff;
}

.delete-btn {
  color: #f56c6c;
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

/* 图片上传样式 */
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
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