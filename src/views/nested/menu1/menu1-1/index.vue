<template>
  <div class="table-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>表格名称</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增表</el-button>
        <el-button icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <div class="search-header">
        <h3>请输入表名称</h3>
        <span class="sub-title">表格描述</span>
      </div>
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="业务表名称">
          <el-input
            v-model="searchForm.tableName"
            placeholder="请输入表名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="表描述">
          <el-input
            v-model="searchForm.tableDesc"
            placeholder="请输入表描述"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="表引擎">
          <el-select v-model="searchForm.engine" placeholder="请选择" clearable>
            <el-option label="InnoDB" value="InnoDB" />
            <el-option label="MyISAM" value="MyISAM" />
            <el-option label="Memory" value="Memory" />
          </el-select>
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
        :data="tableList"
        stripe
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无数据"
        @sort-change="handleSortChange"
      >
        <el-table-column type="index" label="编号" width="80" align="center" fixed />
        
        <el-table-column prop="tableName" label="业务表名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="table-name">{{ row.tableName }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="tableDesc" label="表描述" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="{ 'empty-desc': !row.tableDesc }">
              {{ row.tableDesc || '无描述' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="engine" label="表引擎" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.engine }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="version" label="版本号" width="80" align="center" />

        <el-table-column prop="charset" label="编码" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag size="small" type="info" effect="plain">{{ row.charset }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="recordCount" label="记录总数" width="100" align="center" sortable>
          <template #default="{ row }">
            <span class="record-count">{{ row.recordCount }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="dataSize" label="数据大小" width="100" align="center" sortable>
          <template #default="{ row }">
            <span class="data-size">{{ formatSize(row.dataSize) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="indexCount" label="自带索引" width="100" align="center" sortable>
          <template #default="{ row }">
            <span class="index-count">{{ row.indexCount }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="160" align="center" sortable>
          <template #default="{ row }">
            <span class="time-text">{{ row.createTime }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="updateTime" label="更新时间" width="160" align="center" sortable>
          <template #default="{ row }">
            <span class="time-text">{{ row.updateTime || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                size="mini"
                type="primary"
                link
                icon="el-icon-view"
                @click="handleView(row)"
              >
                查看
              </el-button>
              <el-button
                size="mini"
                type="warning"
                link
                icon="el-icon-edit"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="danger"
                link
                icon="el-icon-delete"
                @click="handleDelete(row)"
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

    <!-- 表详情对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="tableForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="业务表名称" prop="tableName">
          <el-input v-model="formData.tableName" placeholder="请输入业务表名称" />
        </el-form-item>
        
        <el-form-item label="表描述" prop="tableDesc">
          <el-input
            v-model="formData.tableDesc"
            type="textarea"
            :rows="3"
            placeholder="请输入表描述"
          />
        </el-form-item>
        
        <el-form-item label="表引擎" prop="engine">
          <el-select v-model="formData.engine" placeholder="请选择表引擎" style="width: 100%">
            <el-option label="InnoDB" value="InnoDB" />
            <el-option label="MyISAM" value="MyISAM" />
            <el-option label="Memory" value="Memory" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="编码" prop="charset">
          <el-select v-model="formData.charset" placeholder="请选择编码" style="width: 100%">
            <el-option label="utf8_general_ci" value="utf8_general_ci" />
            <el-option label="utf8mb4_general_ci" value="utf8mb4_general_ci" />
            <el-option label="utf8mb4_unicode_ci" value="utf8mb4_unicode_ci" />
          </el-select>
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
  name: 'TableManagement',
  data() {
    return {
      loading: false,
      dialogVisible: false,
      submitLoading: false,
      isEdit: false,
      dialogTitle: '新增表',
      searchForm: {
        tableName: '',
        tableDesc: '',
        engine: ''
      },
      formData: {
        id: null,
        tableName: '',
        tableDesc: '',
        engine: 'InnoDB',
        version: '10',
        charset: 'utf8_general_ci',
        recordCount: 0,
        dataSize: 0,
        indexCount: 0
      },
      formRules: {
        tableName: [
          { required: true, message: '请输入业务表名称', trigger: 'blur' }
        ],
        engine: [
          { required: true, message: '请选择表引擎', trigger: 'change' }
        ]
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      tableList: [
        {
          id: 1,
          tableName: '8PMTQFL_activity_order',
          tableDesc: '订单记录',
          engine: 'InnoDB',
          version: '10',
          charset: 'utf8mb4_general_ci',
          recordCount: 15,
          dataSize: 16384,
          indexCount: 16,
          createTime: '2024-11-13 11:28:02',
          updateTime: '2024-11-13 11:28:02'
        },
        {
          id: 2,
          tableName: '8PMTQFL_activity_message',
          tableDesc: '活动消息',
          engine: 'InnoDB',
          version: '10',
          charset: 'utf8_general_ci',
          recordCount: 23,
          dataSize: 49152,
          indexCount: 24,
          createTime: '2024-11-13 11:28:02',
          updateTime: '2024-11-13 11:28:02'
        },
        {
          id: 3,
          tableName: '8PMTQFL_activity_prize_category',
          tableDesc: '奖品分类',
          engine: 'InnoDB',
          version: '10',
          charset: 'utf8mb4_estonian_ci',
          recordCount: 4,
          dataSize: 16384,
          indexCount: 5,
          createTime: '2024-11-13 11:28:02',
          updateTime: '2024-11-13 11:28:02'
        },
        {
          id: 4,
          tableName: '8PMTQFL_activity_win_record',
          tableDesc: '中奖记录',
          engine: 'InnoDB',
          version: '10',
          charset: 'utf8_general_ci',
          recordCount: 325,
          dataSize: 98304,
          indexCount: 326,
          createTime: '2024-11-13 11:28:02',
          updateTime: '2024-11-13 11:28:02'
        },
        {
          id: 5,
          tableName: '8PMTQFL_activity_wheel_rule',
          tableDesc: '大转盘活动规则',
          engine: 'InnoDB',
          version: '10',
          charset: 'utf8_general_ci',
          recordCount: 0,
          dataSize: 16384,
          indexCount: 2,
          createTime: '2024-11-13 11:28:03',
          updateTime: '2024-11-13 11:28:03'
        },
        {
          id: 6,
          tableName: '8PMTQFL_activity_material',
          tableDesc: '活动素材',
          engine: 'InnoDB',
          version: '10',
          charset: 'utf8_general_ci',
          recordCount: 19,
          dataSize: 16384,
          indexCount: 39,
          createTime: '2024-11-13 11:28:03',
          updateTime: '2024-11-13 11:28:03'
        },
        {
          id: 7,
          tableName: '8PMTQFL_activity_all_material',
          tableDesc: '全部素材名称',
          engine: 'InnoDB',
          version: '10',
          charset: 'utf8_general_ci',
          recordCount: 2,
          dataSize: 16384,
          indexCount: 3,
          createTime: '2024-11-13 11:28:03',
          updateTime: '2024-11-13 11:28:03'
        },
        {
          id: 8,
          tableName: '8PMTQFL_activity_other_material',
          tableDesc: '其他素材',
          engine: 'InnoDB',
          version: '10',
          charset: 'utf8_general_ci',
          recordCount: 2,
          dataSize: 16384,
          indexCount: 3,
          createTime: '2024-11-13 11:28:03',
          updateTime: '2024-11-13 11:28:03'
        },
        {
          id: 9,
          tableName: '8PMTQFL_activity_unknown',
          tableDesc: '',
          engine: 'InnoDB',
          version: '10',
          charset: 'utf8_general_ci',
          recordCount: 2,
          dataSize: 16384,
          indexCount: 3,
          createTime: '2024-11-13 11:28:03',
          updateTime: '2024-11-13 11:28:03'
        },
        {
          id: 10,
          tableName: '8PMTQFL_activity_material_backup',
          tableDesc: '',
          engine: 'InnoDB',
          version: '10',
          charset: 'utf8_general_ci',
          recordCount: 19,
          dataSize: 16384,
          indexCount: 39,
          createTime: '2024-11-13 11:28:03',
          updateTime: '2024-11-13 11:28:03'
        }
      ]
    }
  },
  mounted() {
    this.pagination.total = this.tableList.length
  },
  methods: {
    formatSize(size) {
      if (size < 1024) {
        return size + ' B'
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(1) + ' KB'
      } else {
        return (size / (1024 * 1024)).toFixed(1) + ' MB'
      }
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
        tableName: '',
        tableDesc: '',
        engine: ''
      }
      this.$message.info('已重置搜索条件')
    },
    
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增表'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.tableForm.resetFields()
        this.formData.id = null
      })
    },
    
    handleView(row) {
      this.$message.info(`查看表: ${row.tableName}`)
      // 这里可以跳转到表详情页面
    },
    
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑表'
      this.formData = { ...row }
      this.dialogVisible = true
    },
    
    handleDelete(row) {
      this.$confirm(`确定要删除表 "${row.tableName}" 吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.tableList.findIndex(item => item.id === row.id)
        if (index !== -1) {
          this.tableList.splice(index, 1)
          this.pagination.total = this.tableList.length
          this.$message.success('删除成功')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    
    handleSubmit() {
      this.$refs.tableForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          
          // 模拟API调用
          setTimeout(() => {
            if (this.isEdit) {
              // 更新表
              const index = this.tableList.findIndex(item => item.id === this.formData.id)
              if (index !== -1) {
                this.tableList.splice(index, 1, { 
                  ...this.formData,
                  updateTime: new Date().toLocaleString('sv').replace('T', ' ').substring(0, 19)
                })
              }
              this.$message.success('修改成功')
            } else {
              // 新增表
              const newTable = {
                ...this.formData,
                id: Date.now(),
                version: '10',
                recordCount: 0,
                dataSize: 16384,
                indexCount: 0,
                createTime: new Date().toLocaleString('sv').replace('T', ' ').substring(0, 19),
                updateTime: new Date().toLocaleString('sv').replace('T', ' ').substring(0, 19)
              }
              this.tableList.unshift(newTable)
              this.pagination.total = this.tableList.length
              this.$message.success('新增成功')
            }
            
            this.submitLoading = false
            this.dialogVisible = false
          }, 1000)
        }
      })
    },
    
    handleDialogClose() {
      this.$refs.tableForm.resetFields()
    },
    
    handleRefresh() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
        this.$message.success('刷新成功')
      }, 800)
    },
    
    handleSortChange({ column, prop, order }) {
      // 处理排序
      if (order) {
        this.tableList.sort((a, b) => {
          if (order === 'ascending') {
            return a[prop] - b[prop]
          } else {
            return b[prop] - a[prop]
          }
        })
      }
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
.table-management {
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

.search-header {
  margin-bottom: 16px;
}

.search-header h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #303133;
}

.sub-title {
  font-size: 12px;
  color: #909399;
}

.search-form {
  margin-bottom: 0;
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-name {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #409eff;
}

.empty-desc {
  color: #c0c4cc;
  font-style: italic;
}

.record-count,
.data-size,
.index-count {
  font-weight: 500;
  color: #606266;
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
