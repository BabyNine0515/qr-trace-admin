<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item><router-link to="/product/list">产品列表</router-link></el-breadcrumb-item>
        <el-breadcrumb-item>产品发布/下架管理</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="search-container">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索产品名称或批次"
          prefix-icon="el-icon-search"
          style="width: 300px;"
        />
        <el-select
          v-model="searchForm.status"
          placeholder="产品状态"
          style="width: 150px; margin-left: 10px;"
        >
          <el-option label="全部" value="" />
          <el-option label="已上架" value="on_sale" />
          <el-option label="已下架" value="off_sale" />
          <el-option label="审核中" value="pending" />
        </el-select>
        <el-button type="primary" style="margin-left: 10px;" @click="handleSearch">搜索</el-button>
        <el-button style="margin-left: 10px;" @click="resetSearch">重置</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="productList"
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="产品ID" width="100" />
        <el-table-column prop="name" label="产品名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <div class="product-name">
              <img v-if="scope.row.coverImage" :src="scope.row.coverImage" alt="产品图片" class="product-thumb">
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="batch" label="产品批次" width="120" />
        <el-table-column prop="category" label="产品分类" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.category === 'meat'">肉类</el-tag>
            <el-tag v-else-if="scope.row.category === 'vegetable'" type="success">蔬菜类</el-tag>
            <el-tag v-else-if="scope.row.category === 'fruit'" type="warning">水果类</el-tag>
            <el-tag v-else type="info">其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="brand" label="品牌" width="120" />
        <el-table-column prop="origin" label="产地" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 'on_sale'" type="success">已上架</el-tag>
            <el-tag v-else-if="scope.row.status === 'off_sale'" type="danger">已下架</el-tag>
            <el-tag v-else type="warning">审核中</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="launchDate" label="上市日期" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.status === 'off_sale' || scope.row.status === 'pending'"
              type="primary"
              size="small"
              @click="handlePublish(scope.row)"
            >
              上架
            </el-button>
            <el-button
              v-else
              type="danger"
              size="small"
              @click="handleUnpublish(scope.row)"
            >
              下架
            </el-button>
            <el-button
              type="info"
              size="small"
              style="margin-left: 5px;"
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next, jumper, sizes, total"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 批量操作工具栏 -->
      <div v-if="selectedProducts.length > 0" class="batch-actions">
        <el-button type="primary" size="small" @click="batchPublish">
          批量上架 ({{ selectedProducts.length }})
        </el-button>
        <el-button type="danger" size="small" @click="batchUnpublish">
          批量下架 ({{ selectedProducts.length }})
        </el-button>
        <el-button size="small" @click="clearSelection">取消选择</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getProductList, publishProduct, unpublishProduct, batchPublishProducts, batchUnpublishProducts } from '@/api/product'

export default {
  name: 'ProductStatus',
  data() {
    return {
      loading: false,
      productList: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      selectedProducts: [],
      searchForm: {
        keyword: '',
        status: ''
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取数据
    async fetchData() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.searchForm.keyword,
          status: this.searchForm.status
        }
        
        const response = await getProductList(params)
        const { data, total } = response
        
        this.productList = data || []
        this.total = total || 0
      } catch (error) {
        this.$message.error('获取产品列表失败: ' + (error.message || '未知错误'))
        console.error('获取产品列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch() {
      this.currentPage = 1
      this.fetchData()
    },

    // 重置搜索
    resetSearch() {
      this.searchForm = {
        keyword: '',
        status: ''
      }
      this.currentPage = 1
      this.fetchData()
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.selectedProducts = selection
    },

    // 取消选择
    clearSelection() {
      this.$refs.productTable.clearSelection()
      this.selectedProducts = []
    },

    // 单产品上架
    async handlePublish(row) {
      try {
        await this.$confirm('确定要上架该产品吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await publishProduct(row.id)
        row.status = 'on_sale'
        this.$message({ type: 'success', message: '上架成功' })
      } catch (error) {
        // 如果是用户取消，不显示错误信息
        if (error !== 'cancel') {
          this.$message.error('上架失败: ' + (error.message || '未知错误'))
        }
      }
    },

    // 单产品下架
    async handleUnpublish(row) {
      try {
        await this.$confirm('确定要下架该产品吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await unpublishProduct(row.id)
        row.status = 'off_sale'
        this.$message({ type: 'success', message: '下架成功' })
      } catch (error) {
        // 如果是用户取消，不显示错误信息
        if (error !== 'cancel') {
          this.$message.error('下架失败: ' + (error.message || '未知错误'))
        }
      }
    },

    // 批量上架
    async batchPublish() {
      try {
        await this.$confirm(`确定要上架选中的${this.selectedProducts.length}个产品吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const ids = this.selectedProducts.map(item => item.id)
        await batchPublishProducts(ids)
        
        this.selectedProducts.forEach(item => {
          item.status = 'on_sale'
        })
        
        this.$message({ type: 'success', message: '批量上架成功' })
        this.clearSelection()
      } catch (error) {
        // 如果是用户取消，不显示错误信息
        if (error !== 'cancel') {
          this.$message.error('批量上架失败: ' + (error.message || '未知错误'))
        }
      }
    },

    // 批量下架
    async batchUnpublish() {
      try {
        await this.$confirm(`确定要下架选中的${this.selectedProducts.length}个产品吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const ids = this.selectedProducts.map(item => item.id)
        await batchUnpublishProducts(ids)
        
        this.selectedProducts.forEach(item => {
          item.status = 'off_sale'
        })
        
        this.$message({ type: 'success', message: '批量下架成功' })
        this.clearSelection()
      } catch (error) {
        // 如果是用户取消，不显示错误信息
        if (error !== 'cancel') {
          this.$message.error('批量下架失败: ' + (error.message || '未知错误'))
        }
      }
    },

    // 查看产品详情
    handleView(row) {
      this.$router.push({ path: '/product/edit', query: { id: row.id, view: true }})
    },

    // 分页大小变化
    handleSizeChange(size) {
      this.pageSize = size
      this.fetchData()
    },

    // 页码变化
    handleCurrentChange(current) {
      this.currentPage = current
      this.fetchData()
    }
  }
}
</script>

<style scoped>
.search-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.batch-actions {
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  gap: 10px;
}

.product-name {
  display: flex;
  align-items: center;
}

.product-thumb {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 4px;
}
</style>
