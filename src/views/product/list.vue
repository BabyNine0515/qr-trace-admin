<template>
  <div class="app-container">
    <el-card>
      <!-- 搜索筛选区域 -->
      <el-form :inline="true" :model="searchForm" class="mb-4">
        <el-form-item label="产品名称">
          <el-input v-model="searchForm.name" placeholder="请输入产品名称" clearable />
        </el-form-item>
        <el-form-item label="产品批次">
          <el-input v-model="searchForm.batch" placeholder="请输入产品批次" clearable />
        </el-form-item>
        <el-form-item label="产品状态">
          <el-select v-model="searchForm.status" placeholder="请选择产品状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="已上架" value="online" />
            <el-option label="已下架" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择产品分类" clearable>
            <el-option label="全部" value="" />
            <el-option label="肉类" value="meat" />
            <el-option label="蔬菜类" value="vegetable" />
            <el-option label="水果类" value="fruit" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 工具栏 -->
      <div class="toolbar mb-4">
        <el-button type="primary" @click="handleCreate">新增产品</el-button>
        <el-button :disabled="multipleSelection.length === 0" @click="handleBatchDelete">批量删除</el-button>
        <el-button :disabled="multipleSelection.length === 0" @click="handleBatchPublish">批量上架</el-button>
        <el-button :disabled="multipleSelection.length === 0" @click="handleBatchOffline">批量下架</el-button>
        <el-button type="info" @click="handleExport">导出数据</el-button>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="productList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="产品ID" width="80" align="center" />
        <el-table-column prop="name" label="产品名称" align="center" />
        <el-table-column prop="batch" label="产品批次" align="center" />
        <el-table-column prop="category" label="分类" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.category === 'meat'">肉类</el-tag>
            <el-tag v-else-if="scope.row.category === 'vegetable'">蔬菜类</el-tag>
            <el-tag v-else-if="scope.row.category === 'fruit'">水果类</el-tag>
            <el-tag v-else>其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="productionDate" label="生产日期" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 'online'" type="success">已上架</el-tag>
            <el-tag v-else-if="scope.row.status === 'offline'" type="danger">已下架</el-tag>
            <el-tag v-else>未发布</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-if="scope.row.status !== 'online'" type="success" size="mini" @click="handlePublish(scope.row)">上架</el-button>
            <el-button v-else type="danger" size="mini" @click="handleOffline(scope.row)">下架</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-show="total > 0"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ProductList',
  data() {
    return {
      loading: false,
      searchForm: {
        name: '',
        batch: '',
        status: '',
        category: ''
      },
      productList: [],
      multipleSelection: [],
      currentPage: 1,
      pageSize: 10,
      total: 0
    }
  },
  created() {
    this.getProductList()
  },
  methods: {
    // 获取产品列表
    getProductList() {
      this.loading = true
      // 模拟API调用
      setTimeout(() => {
        this.productList = [
          {
            id: 1,
            name: '八公山酱牛肉',
            batch: '20251101',
            category: 'meat',
            productionDate: '2025-11-01',
            status: 'online'
          },
          {
            id: 2,
            name: '新鲜蔬菜礼盒',
            batch: '20251102',
            category: 'vegetable',
            productionDate: '2025-11-02',
            status: 'online'
          },
          {
            id: 3,
            name: '有机水果拼盘',
            batch: '20251103',
            category: 'fruit',
            productionDate: '2025-11-03',
            status: 'offline'
          }
        ]
        this.total = this.productList.length
        this.loading = false
      }, 500)
    },

    // 搜索
    handleSearch() {
      this.currentPage = 1
      this.getProductList()
    },

    // 重置
    resetForm() {
      this.searchForm = {
        name: '',
        batch: '',
        status: '',
        category: ''
      }
      this.getProductList()
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.multipleSelection = selection
    },

    // 新增产品
    handleCreate() {
      this.$router.push('/product/edit')
    },

    // 编辑产品
    handleEdit(row) {
      this.$router.push(`/product/edit?id=${row.id}`)
    },

    // 删除产品
    handleDelete(row) {
      this.$confirm(`确定要删除产品「${row.name}」吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟删除操作
        setTimeout(() => {
          this.$message({ type: 'success', message: '删除成功' })
          this.getProductList()
        }, 500)
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' })
      })
    },

    // 批量删除
    handleBatchDelete() {
      this.$confirm(`确定要删除选中的${this.multipleSelection.length}个产品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟删除操作
        setTimeout(() => {
          this.$message({ type: 'success', message: '删除成功' })
          this.getProductList()
          this.multipleSelection = []
        }, 500)
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' })
      })
    },

    // 上架产品
    handlePublish(row) {
      this.$confirm(`确定要上架产品「${row.name}」吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟上架操作
        setTimeout(() => {
          this.$message({ type: 'success', message: '上架成功' })
          this.getProductList()
        }, 500)
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消上架' })
      })
    },

    // 下架产品
    handleOffline(row) {
      this.$confirm(`确定要下架产品「${row.name}」吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟下架操作
        setTimeout(() => {
          this.$message({ type: 'success', message: '下架成功' })
          this.getProductList()
        }, 500)
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消下架' })
      })
    },

    // 批量上架
    handleBatchPublish() {
      this.$confirm(`确定要上架选中的${this.multipleSelection.length}个产品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟上架操作
        setTimeout(() => {
          this.$message({ type: 'success', message: '上架成功' })
          this.getProductList()
          this.multipleSelection = []
        }, 500)
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消上架' })
      })
    },

    // 批量下架
    handleBatchOffline() {
      this.$confirm(`确定要下架选中的${this.multipleSelection.length}个产品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟下架操作
        setTimeout(() => {
          this.$message({ type: 'success', message: '下架成功' })
          this.getProductList()
          this.multipleSelection = []
        }, 500)
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消下架' })
      })
    },

    // 导出数据
    handleExport() {
      this.$message({ type: 'info', message: '导出功能开发中...' })
    },

    // 分页变化
    handleCurrentChange(val) {
      this.currentPage = val
      this.getProductList()
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.getProductList()
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
