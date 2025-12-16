<template>
  <div class="app-container">
    <el-card>
      <!-- 搜索筛选区域 -->
      <el-form :inline="true" :model="searchForm" class="mb-4">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="商户ID">
          <el-input v-model="searchForm.merchant_id" placeholder="请输入商户ID" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 工具栏 -->
      <div class="toolbar mb-4">
        <el-button type="primary" @click="handleCreate">新增商品</el-button>
        <!-- <el-button :disabled="multipleSelection.length === 0" @click="handleBatchDelete">批量删除</el-button> -->
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="productList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="商品ID" width="80" align="center" />
        <el-table-column prop="name" label="产品名称" align="center" />
        <el-table-column prop="name_ch" label="中文名称" align="center" />
        <el-table-column prop="name_en" label="英文名称" align="center" />
        <el-table-column prop="merchant_id" label="商户ID" width="120" align="center" />
        <el-table-column prop="brand" label="品牌" align="center" />
        <el-table-column prop="place_of_origin" label="产地" align="center" />
        <el-table-column prop="specifications" label="规格" align="center" />
        <el-table-column prop="release_date" label="上市时间" align="center">
          <template slot-scope="scope">
            {{ new Date(scope.row.release_date).toLocaleDateString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
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
import { getProductList, deleteProduct } from '@/api/product'

export default {
  name: 'ProductList',
  data() {
    return {
      loading: false,
      searchForm: {
        name: '',
        merchant_id: ''
      },
      productList: [],
      multipleSelection: [],
      currentPage: 1,
      pageSize: 10,
      total: 0
    }
  },
  activated() {
    this.getProductList()
  },
  mounted() {
    this.getProductList()
  },
  methods: {
    // 获取商品列表
    getProductList() {
      this.loading = true

      const params = {
        page: this.currentPage,
        size: this.pageSize,
        merchant_id: this.searchForm.merchant_id
      }

      // 只有在搜索框有值时才添加name参数
      if (this.searchForm.name) {
        params.name = this.searchForm.name
      }

      getProductList(params)
        .then(response => {
          this.productList = response.data.goods_record || []
          this.total = response.data.count || 0
        })
        .catch(error => {
          console.error('获取产品列表失败:', error)
          this.$message.error('获取数据失败，请稍后重试')
          // 保留之前的数据，避免分页组件消失
          // this.productList = []
          // this.total = this.productList.length
        })
        .finally(() => {
          this.loading = false
        })
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
        merchant_id: ''
      }
      this.getProductList()
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.multipleSelection = selection
    },

    // 新增商品
    handleCreate() {
      this.$router.push('/product/edit')
    },

    // 编辑商品
    handleEdit(row) {
      // 传递完整的商品数据到编辑页面，包括id
      this.$router.push({
        path: '/product/edit',
        query: {
          id: row.id,
          // 使用JSON.stringify将对象转为字符串传递
          productData: JSON.stringify(row)
        }
      })
    },

    // 删除商品
    handleDelete(row) {
      this.$confirm(`确定要删除商品「${row.name}」吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$loading({
          lock: true,
          text: '正在删除...',
          spinner: 'el-icon-loading'
        })

        deleteProduct(row.id)
          .then(() => {
            this.$message({ type: 'success', message: '删除成功' })
            this.getProductList()
          })
          .catch(error => {
            console.error('删除失败:', error)
            this.$message.error('删除失败，请稍后重试')
          })
          .finally(() => {
            this.$loading().close()
          })
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' })
      })
    },

    // 批量删除 - 新API未明确支持，改为逐个删除
    handleBatchDelete() {
      this.$confirm(`确定要删除选中的${this.multipleSelection.length}个商品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.$loading({
          lock: true,
          text: '正在批量删除...',
          spinner: 'el-icon-loading'
        })

        try {
          const ids = this.multipleSelection.map(item => item.id)
          for (const id of ids) {
            await deleteProduct(id)
          }
          this.$message({ type: 'success', message: '批量删除成功' })
          this.getProductList()
          this.multipleSelection = []
        } catch (error) {
          console.error('批量删除失败:', error)
          this.$message.error('批量删除失败，请稍后重试')
        } finally {
          this.$loading().close()
        }
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' })
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
