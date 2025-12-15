<template>
  <div class="user-permission-container">
    <el-card shadow="never">
      <div class="card-header">
        <el-button type="primary" @click="handleAddUser">
          <i class="el-icon-plus" />
          添加管理员
        </el-button>
      </div>

      <div class="search-container">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="searchForm.role" placeholder="请选择角色">
              <el-option label="全部" value="" />
              <el-option label="超级管理员" value="admin" />
              <el-option label="编辑" value="editor" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="tableData" style="width: 100%" stripe>
        <el-table-column prop="id" label="id" width="80" />
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="is_deleted" label="状态" width="100">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.is_deleted"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="1"
              :inactive-value="0"
              :disabled="scope.row.isCurrentUser"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column prop="updated_at" label="更新时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="small"
              :disabled="scope.row.isCurrentUser"
              @click="handleEditUser(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              :disabled="scope.row.isCurrentUser || scope.row.role === 'admin'"
              @click="handleDeleteUser(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model="currentPage"
          background
          layout="prev, pager, next, jumper, sizes, total"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" :disabled="isEdit" placeholder="请输入用户名" />
        </el-form-item>
        <!-- <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item> -->
        <el-form-item label="密码" :required="!isEdit" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            :show-password="true"
            :placeholder="isEdit ? '留空表示不修改密码' : '请输入密码'"
          />
        </el-form-item>
        <!-- <el-form-item label="角色" prop="role" :disabled="isSystemAdmin">
          <el-radio-group v-model="formData.role">
            <el-radio label="admin">超级管理员</el-radio>
            <el-radio label="editor">编辑</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <el-form-item label="状态" prop="is_deleted">
          <el-switch
            v-model="formData.is_deleted"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 权限设置对话框 -->
    <el-dialog
      title="设置权限"
      :visible.sync="permissionDialogVisible"
      width="600px"
      @close="handlePermissionDialogClose"
    >
      <div class="permission-container">
        <el-checkbox-group v-model="selectedPermissions" @change="handlePermissionChange">
          <el-checkbox
            v-for="permission in permissions"
            :key="permission.key"
            :label="permission.key"
          >
            {{ permission.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePermissionSubmit">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserList, createUser, deleteUser, updateUser } from '@/api/system'
export default {
  name: 'UserPermission',
  data() {
    return {
      searchForm: {
        username: '',
        role: ''
      },
      userData: [],
      total: 0,
      permissions: [
        { key: 'product_manage', name: '商品管理' },
        { key: 'media_manage', name: '媒体资源管理' },
        { key: 'company_manage', name: '公司信息管理' },
        { key: 'production_manage', name: '生产信息管理' },
        { key: 'quality_manage', name: '质量信息管理' },
        { key: 'comment_manage', name: '评论互动管理' },
        { key: 'system_manage', name: '系统设置' },
        { key: 'traceability_manage', name: '溯源码管理' }
      ],
      selectedPermissions: [],
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      permissionDialogVisible: false,
      dialogTitle: '添加管理员',
      isEdit: false,
      isSystemAdmin: false,
      formData: {
        id: null,
        username: '',
        nickname: '',
        password: '',
        role: 'editor',
        is_deleted: 1
      },
      formRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        // nickname: [
        //   { required: true, message: '请输入昵称', trigger: 'blur' },
        //   { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        // ],
        password: [
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 直接使用 userData 作为表格数据源，因为筛选和分页现在由后端处理
    tableData() {
      return this.userData
    }
  },
  created() {
    // 组件加载时获取管理员列表
    this.fetchUserList()
  },
  methods: {
    // 获取管理员列表
    async fetchUserList() {
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          username: this.searchForm.username,
          role: this.searchForm.role
        }
        const response = await getUserList(params)
        if (response.code === 200) {
          this.userData = response.data.admin_record || []
          this.total = response.data.count || 0
        } else {
          this.$message.error('获取管理员列表失败')
        }
      } catch (error) {
        console.error('获取管理员列表出错:', error)
        this.$message.error('获取管理员列表失败')
      }
    },
    // 搜索
    handleSearch() {
      this.currentPage = 1
      this.fetchUserList()
    },
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        username: '',
        role: ''
      }
      this.currentPage = 1
      this.fetchUserList()
    },
    // 页码大小变化
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchUserList()
    },
    // 页码变化
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchUserList()
    },
    // 添加用户
    handleAddUser() {
      this.dialogTitle = '添加管理员'
      this.isEdit = false
      this.isSystemAdmin = false
      this.formData = {
        id: null,
        username: '',
        nickname: '',
        password: '',
        role: 'editor',
        is_deleted: 1
      }
      this.dialogVisible = true
    },
    // 编辑用户
    handleEditUser(row) {
      this.dialogTitle = '编辑管理员'
      this.isEdit = true
      this.isSystemAdmin = row.role === 'admin'
      this.formData = {
        id: row.id,
        username: row.username,
        password: '',
        is_deleted: row.is_deleted
      }
      this.dialogVisible = true
    },
    // 删除用户
    async handleDeleteUser(row) {
      this.$confirm('确定要删除这个管理员吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await deleteUser(row.id)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          // 重新获取管理员列表
          this.fetchUserList()
        } catch (error) {
          console.error('删除用户失败:', error)
          this.$message({
            type: 'error',
            message: '删除失败'
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 改变用户状态
    async handleStatusChange(row) {
      try {
        await updateUser(row.id, { is_deleted: row.is_deleted })
        this.$message({
          type: 'success',
          message: `状态更新为${row.is_deleted ? '启用' : '禁用'}`
        })
        // 重新获取管理员列表
        this.fetchUserList()
      } catch (error) {
        console.error('更新用户状态失败:', error)
        this.$message({
          type: 'error',
          message: '状态更新失败'
        })
        // 如果更新失败，恢复原来的状态
        const index = this.userData.findIndex(item => item.id === row.id)
        if (index > -1) {
          this.userData[index].is_deleted = row.is_deleted === 1 ? 0 : 1
        }
      }
    },
    // 提交表单
    async handleSubmit() {
      this.$refs.formRef.validate(async(valid) => {
        if (valid) {
          try {
            const formData = { ...this.formData }
            // 如果密码为空，则不更新密码
            if (!formData.password) {
              delete formData.password
            }

            if (this.isEdit) {
              // 编辑用户
              await updateUser(this.formData.id, formData)
              this.$message({
                type: 'success',
                message: '编辑成功'
              })
            } else {
              // 添加用户
              await createUser(formData)
              this.$message({
                type: 'success',
                message: '添加成功'
              })
            }

            // 重新获取管理员列表
            this.fetchUserList()
            // 关闭对话框
            this.dialogVisible = false
          } catch (error) {
            console.error('保存用户失败:', error)
            this.$message({
              type: 'error',
              message: '保存失败'
            })
          }
        } else {
          return false
        }
      })
    },
    // 关闭对话框
    handleDialogClose() {
      this.$refs.formRef.resetFields()
    },
    // 打开权限设置对话框
    handleOpenPermissionDialog(row) {
      this.selectedPermissions = []
      // 在实际应用中，这里应该根据用户ID获取用户的权限
      // 这里使用模拟数据
      if (row.role === 'admin') {
        this.selectedPermissions = this.permissions.map(p => p.key)
      } else {
        // 编辑权限示例
        this.selectedPermissions = ['product_manage', 'media_manage']
      }
      this.permissionDialogVisible = true
    },
    // 权限变化处理
    handlePermissionChange() {
      // 权限变化时的处理逻辑
    },
    // 提交权限设置
    handlePermissionSubmit() {
      // 在实际应用中，这里应该调用API保存用户权限
      this.$message({
        type: 'success',
        message: '权限设置成功'
      })
      this.permissionDialogVisible = false
    },
    // 关闭权限对话框
    handlePermissionDialogClose() {
      // 权限对话框关闭时的处理逻辑
    }
  }
}
</script>

<style scoped>
.user-permission-container {
  padding: 20px;
}

.card-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.search-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.permission-container {
  max-height: 300px;
  overflow-y: auto;
}

.el-checkbox {
  display: block;
  margin-bottom: 10px;
}
</style>
