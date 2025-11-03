<template>
  <div class="user-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>用户服务</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增用户</el-button>
        <el-button icon="el-icon-download" @click="handleExport">导出数据</el-button>
      </div>
    </div>

    <!-- 用户列表 -->
    <el-card class="table-card">
      <el-table
        :data="userList"
        stripe
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无数据"
      >
        <!-- 编号 -->
        <el-table-column type="index" label="编号" width="80" align="center" />
        
        <!-- 用户昵称和手机号 -->
        <el-table-column label="用户昵称" min-width="150">
          <template #default="{ row }">
            <div class="user-info">
              <div class="username">{{ row.username }}</div>
              <div class="phone">{{ row.phone }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 用户头像 -->
        <el-table-column label="用户头像" width="120" align="center">
          <template #default="{ row }">
            <div class="avatar-container">
              <el-avatar
                :size="50"
                :src="row.avatar"
                :key="row.id"
                @error="() => handleAvatarError(row)"
              >
                <i class="el-icon-user-solid avatar-fallback"></i>
              </el-avatar>
              <div class="avatar-status" :class="{ 'load-failed': !row.avatarLoaded }">
                {{ row.avatarLoaded ? '加载成功' : '加载失败' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 余额 -->
        <el-table-column prop="balance" label="余额" width="120" align="center">
          <template #default="{ row }">
            <span class="balance">¥{{ row.balance }}</span>
          </template>
        </el-table-column>

        <!-- 积分 -->
        <el-table-column prop="points" label="积分" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.points }}</el-tag>
          </template>
        </el-table-column>

        <!-- 用户等级 -->
        <el-table-column prop="level" label="用户等级" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getLevelType(row.level)"
              effect="plain"
              size="small"
            >
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                size="mini"
                type="info"
                plain
                icon="el-icon-printer"
                @click="handlePrint(row)"
                class="print-btn"
              >
                打印员
              </el-button>
              <el-button
                size="mini"
                type="primary"
                plain
                icon="el-icon-edit"
                @click="handleEdit(row)"
              >
                修改
              </el-button>
              <el-button
                size="mini"
                type="danger"
                plain
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

    <!-- 编辑用户对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="userForm"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="用户昵称" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户昵称" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="用户等级" prop="level">
          <el-select v-model="formData.level" placeholder="请选择用户等级" style="width: 100%">
            <el-option label="普通用户" value="normal" />
            <el-option label="VIP用户" value="vip" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="余额" prop="balance">
          <el-input-number 
            v-model="formData.balance" 
            :min="0" 
            :precision="2"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="积分" prop="points">
          <el-input-number 
            v-model="formData.points" 
            :min="0" 
            controls-position="right"
            style="width: 100%"
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
  name: 'UserManagement',
  data() {
    return {
      loading: false,
      dialogVisible: false,
      submitLoading: false,
      isEdit: false,
      dialogTitle: '新增用户',
      formData: {
        id: null,
        username: '',
        phone: '',
        balance: 0,
        points: 0,
        level: 'normal',
        avatar: ''
      },
      formRules: {
        username: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' }
        ]
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      userList: [
        {
          id: 1,
          username: '包容的大象',
          phone: '138****1234',
          avatar: '',
          avatarLoaded: false,
          balance: '0.00',
          points: 0,
          level: 'normal'
        },
        {
          id: 2,
          username: '传统的繁荣',
          phone: '139****5678',
          avatar: '',
          avatarLoaded: false,
          balance: '0.00',
          points: 0,
          level: 'normal'
        },
        {
          id: 3,
          username: '高高的朋友',
          phone: '137****9012',
          avatar: '',
          avatarLoaded: false,
          balance: '0.00',
          points: 0,
          level: 'normal'
        },
        {
          id: 4,
          username: '大意的菊花',
          phone: '136****3456',
          avatar: '',
          avatarLoaded: false,
          balance: '0.00',
          points: 0,
          level: 'normal'
        },
        {
          id: 5,
          username: '想人指的雨',
          phone: '135****7890',
          avatar: '',
          avatarLoaded: false,
          balance: '0.00',
          points: 0,
          level: 'normal'
        },
        {
          id: 6,
          username: '幽默的衬衫',
          phone: '134****2345',
          avatar: '',
          avatarLoaded: false,
          balance: '0.00',
          points: 0,
          level: 'normal'
        },
        {
          id: 7,
          username: '淡淡的黑夜',
          phone: '133****6789',
          avatar: '',
          avatarLoaded: false,
          balance: '0.00',
          points: 0,
          level: 'normal'
        },
        {
          id: 8,
          username: '忧伤的小狗圈',
          phone: '132****0123',
          avatar: '',
          avatarLoaded: false,
          balance: '0.00',
          points: 0,
          level: 'normal'
        },
        {
          id: 9,
          username: '斯文的飞机',
          phone: '131****4567',
          avatar: '',
          avatarLoaded: false,
          balance: '0.00',
          points: 0,
          level: 'normal'
        }
      ]
    }
  },
  mounted() {
    this.pagination.total = this.userList.length
  },
  methods: {
    getLevelText(level) {
      const levelMap = {
        normal: '普通用户',
        vip: 'VIP用户',
        admin: '管理员'
      }
      return levelMap[level] || '普通用户'
    },
    
    getLevelType(level) {
      const typeMap = {
        normal: '',
        vip: 'success',
        admin: 'warning'
      }
      return typeMap[level] || ''
    },
    
    handleAvatarError(row) {
      row.avatarLoaded = false
    },
    
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增用户'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm.resetFields()
        this.formData.id = null
      })
    },
    
    handleEdit(user) {
      this.isEdit = true
      this.dialogTitle = '修改用户'
      this.formData = { ...user }
      this.dialogVisible = true
    },
    
    handlePrint(user) {
      this.$message.info(`准备打印用户: ${user.username}`)
      // 这里可以调用打印API
    },
    
    handleDelete(user) {
      this.$confirm(`确定要删除用户 "${user.username}" 吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.userList.findIndex(item => item.id === user.id)
        if (index !== -1) {
          this.userList.splice(index, 1)
          this.pagination.total = this.userList.length
          this.$message.success('删除成功')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    
    handleSubmit() {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          
          // 模拟API调用
          setTimeout(() => {
            if (this.isEdit) {
              // 更新用户
              const index = this.userList.findIndex(item => item.id === this.formData.id)
              if (index !== -1) {
                this.userList.splice(index, 1, { ...this.formData })
              }
              this.$message.success('修改成功')
            } else {
              // 新增用户
              const newUser = {
                ...this.formData,
                id: Date.now(),
                avatarLoaded: false
              }
              this.userList.unshift(newUser)
              this.pagination.total = this.userList.length
              this.$message.success('新增成功')
            }
            
            this.submitLoading = false
            this.dialogVisible = false
          }, 1000)
        }
      })
    },
    
    handleDialogClose() {
      this.$refs.userForm.resetFields()
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
.user-management {
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

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.user-info {
  text-align: left;
}

.username {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  font-size: 14px;
}

.phone {
  font-size: 12px;
  color: #909399;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.avatar-fallback {
  color: #c0c4cc;
  font-size: 24px;
}

.avatar-status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  background: #f0f9ff;
  color: #409eff;
}

.avatar-status.load-failed {
  background: #fef0f0;
  color: #f56c6c;
}

.balance {
  color: #e6a23c;
  font-weight: 500;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.print-btn {
  border-color: #909399;
  color: #909399;
}

.print-btn:hover {
  background: #909399;
  border-color: #909399;
  color: #fff;
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
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .action-buttons .el-button {
    margin: 2px 0;
  }
}

/* 表格行悬停效果 */
::v-deep .el-table--enable-row-hover .el-table__body tr:hover>td {
  background-color: #f5f7fa !important;
}

::v-deep .el-table .cell {
  padding: 8px 12px;
}
</style>