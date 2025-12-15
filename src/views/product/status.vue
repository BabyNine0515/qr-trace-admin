<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4" style="margin-bottom: 20px;">
        <el-breadcrumb-item><router-link to="/product/list">产品批次</router-link></el-breadcrumb-item>
      </el-breadcrumb>

      <div class="search-container">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索产品名称或批次"
          prefix-icon="el-icon-search"
          style="width: 300px;"
        />
        <!-- <el-select
          v-model="searchForm.status"
          placeholder="产品状态"
          style="width: 150px; margin-left: 10px;"
        >
          <el-option label="全部" value="" />
          <el-option label="已上架" value="on_sale" />
          <el-option label="已下架" value="off_sale" />
          <el-option label="审核中" value="pending" />
        </el-select> -->
        <el-button type="primary" style="margin-left: 10px;" @click="handleSearch">搜索</el-button>
        <el-button style="margin-left: 10px;" @click="resetSearch">重置</el-button>
        <el-button type="primary" style="margin-left: 10px;" @click="showCreateBatchForm">创建批次</el-button>
      </div>

      <el-table
        v-loading="batchLoading"
        :data="batchList"
        style="width: 100%;"
      >
        <el-table-column prop="id" label="批次ID" width="120" />
        <el-table-column prop="goods_id" label="商品ID" width="120" />
        <el-table-column prop="manufacturer_id" label="生产方ID" width="120" />
        <el-table-column prop="suppliers_id" label="原材料提供方ID" width="150" />
        <el-table-column label="创建时间" width="180">
          <template slot-scope="scope">
            {{ new Date(scope.row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="small"
              @click="editBatch(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              style="margin-left: 5px;"
              @click="deleteBatch(scope.row)"
            >
              删除
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

      <!-- 批次表单弹窗 -->
      <el-dialog
        :visible.sync="batchFormVisible"
        :title="batchForm.id ? '编辑批次' : '创建批次'"
        width="600px"
        :close-on-click-modal="false"
      >
        <el-form :model="batchForm" label-width="120px">
          <el-form-item label="商品" required>
            <el-select
              v-model="batchForm.goods_id"
              placeholder="请选择商品"
              filterable
              clearable
              :loading="goodsLoading"
            >
              <el-option
                v-for="goods in goodsList"
                :key="goods.id"
                :label="goods.name"
                :value="goods.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="生产方" required>
            <el-select
              v-model="batchForm.manufacturer_id"
              placeholder="请选择生产方"
              filterable
              clearable
              :loading="manufacturerLoading"
            >
              <el-option
                v-for="manufacturer in manufacturerList"
                :key="manufacturer.id"
                :label="manufacturer.name"
                :value="manufacturer.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="原材料提供方" required>
            <el-select
              v-model="batchForm.suppliers_id"
              placeholder="请选择原材料提供方"
              filterable
              clearable
              :loading="supplierLoading"
            >
              <el-option
                v-for="supplier in supplierList"
                :key="supplier.id"
                :label="supplier.name"
                :value="supplier.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="batchFormVisible = false">取消</el-button>
          <el-button type="primary" @click="saveBatch">确定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { getProductList, publishProduct, getBatchList, createBatch, updateBatch, deleteBatch } from '@/api/product'
import { getManufacturerList, getSupplierList } from '@/api/company'

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
      },
      // 批次管理相关
      batchListVisible: false,
      batchFormVisible: false,
      batchLoading: false,
      batchList: [], // 产品的批次列表
      batchTotal: 0,
      batchCurrentPage: 1,
      batchPageSize: 10,
      currentProduct: null,
      // 批次表单相关数据
      batchForm: {
        id: null,
        goods_id: null,
        manufacturer_id: '',
        suppliers_id: ''
      },
      // 下拉菜单数据
      goodsList: [], // 商品列表
      manufacturerList: [], // 生产方列表
      supplierList: [], // 原材料提供方列表
      // 下拉菜单加载状态
      goodsLoading: false,
      manufacturerLoading: false,
      supplierLoading: false
    }
  },
  created() {
    this.fetchBatchList()
  },
  methods: {
    // 显示批次列表
    showBatchList(product) {
      this.currentProduct = product
      this.batchListVisible = true
      this.fetchBatchList()
    },

    // 获取批次列表
    async fetchBatchList() {
      this.batchLoading = true
      try {
        const params = {
          page: this.batchCurrentPage,
          size: this.batchPageSize
        }

        const response = await getBatchList(params)

        this.batchList = response.data.goods_batch_record || []
        this.total = response.data.count || 0
      } catch (error) {
        this.$message.error('获取批次列表失败: ' + (error.message || '未知错误'))
        console.error('获取批次列表失败:', error)
      } finally {
        this.batchLoading = false
      }
    },

    // 批次分页大小变化
    handleBatchSizeChange(size) {
      this.batchPageSize = size
      this.batchCurrentPage = 1
      this.fetchBatchList()
    },

    // 批次页码变化
    handleBatchCurrentChange(current) {
      this.batchCurrentPage = current
      this.fetchBatchList()
    },

    // 获取商品列表
    async fetchGoodsList() {
      this.goodsLoading = true
      try {
        const params = {
          page: 1,
          size: 1000 // 假设最大1000条
        }
        const response = await getProductList(params)
        this.goodsList = response.data.goods_record || []
      } catch (error) {
        this.$message.error('获取商品列表失败: ' + (error.message || '未知错误'))
        console.error('获取商品列表失败:', error)
      } finally {
        this.goodsLoading = false
      }
    },

    // 获取生产方列表
    async fetchManufacturerList() {
      this.manufacturerLoading = true
      try {
        const response = await getManufacturerList({ merchant_type: 2 })
        this.manufacturerList = response.data.merchant_record || []
      } catch (error) {
        this.$message.error('获取生产方列表失败: ' + (error.message || '未知错误'))
        console.error('获取生产方列表失败:', error)
      } finally {
        this.manufacturerLoading = false
      }
    },

    // 获取原材料提供方列表
    async fetchSupplierList() {
      this.supplierLoading = true
      try {
        const response = await getSupplierList({ merchant_type: 3 })
        this.supplierList = response.data.merchant_record || []
      } catch (error) {
        this.$message.error('获取原材料提供方列表失败: ' + (error.message || '未知错误'))
        console.error('获取原材料提供方列表失败:', error)
      } finally {
        this.supplierLoading = false
      }
    },

    // 显示批次表单
    showBatchForm() {
      this.batchForm = {
        id: null,
        goods_id: this.currentProduct ? this.currentProduct.id : null,
        manufacturer_id: '',
        suppliers_id: ''
      }
      // 先显示弹窗
      this.batchFormVisible = true
      // 异步加载下拉菜单数据，不影响弹窗显示
      this.$nextTick(() => {
        this.fetchGoodsList()
        this.fetchManufacturerList()
        this.fetchSupplierList()
      })
    },

    // 编辑批次
    editBatch(row) {
      this.batchForm = {
        id: row.id,
        goods_id: row.goods_id,
        manufacturer_id: row.manufacturer_id,
        suppliers_id: row.suppliers_id
      }
      // 先显示弹窗
      this.batchFormVisible = true
      // 异步加载下拉菜单数据，不影响弹窗显示
      this.$nextTick(() => {
        this.fetchGoodsList()
        this.fetchManufacturerList()
        this.fetchSupplierList()
      })
    },

    // 保存批次
    async saveBatch() {
      try {
        if (!this.batchForm.goods_id || !this.batchForm.manufacturer_id || !this.batchForm.suppliers_id) {
          this.$message.error('请填写所有必填字段')
          return
        }

        const formData = {
          goods_id: this.batchForm.goods_id,
          manufacturer_id: parseInt(this.batchForm.manufacturer_id),
          suppliers_id: parseInt(this.batchForm.suppliers_id)
        }

        if (this.batchForm.id) {
          formData.id = this.batchForm.id
          await updateBatch(formData)
          this.$message.success('批次更新成功')
        } else {
          await createBatch(formData)
          this.$message.success('批次创建成功')
        }

        this.batchFormVisible = false
        this.fetchBatchList() // 更新当前显示的批次列表
      } catch (error) {
        this.$message.error('保存批次失败: ' + (error.message || '未知错误'))
        console.error('保存批次失败:', error)
      }
    },

    // 删除批次
    async deleteBatch(row) {
      try {
        await this.$confirm('确定要删除该批次吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await deleteBatch(row.id)
        this.$message.success('批次删除成功')
        this.fetchBatchList() // 更新当前显示的批次列表
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除批次失败: ' + (error.message || '未知错误'))
          console.error('删除批次失败:', error)
        }
      }
    },
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

    // 显示创建批次表单（从主页面直接创建）
    showCreateBatchForm() {
      // 使用选中的产品（如果有）
      const selectedProduct = this.selectedProducts.length > 0 ? this.selectedProducts[0] : null
      this.currentProduct = selectedProduct

      this.batchForm = {
        id: null,
        goods_id: selectedProduct ? selectedProduct.id : null,
        manufacturer_id: '',
        suppliers_id: ''
      }
      // 先显示弹窗
      this.batchFormVisible = true
      console.log('1111111111111111', this.batchFormVisible)

      // 异步加载下拉菜单数据，不影响弹窗显示
      this.$nextTick(() => {
        this.fetchGoodsList()
        this.fetchManufacturerList()
        this.fetchSupplierList()
      })
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
        // 使用新变量避免竞态条件
        const updatedRow = row
        updatedRow.status = 'on_sale'
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

        await publishProduct(row.id, { status: 'unpublished' })
        // 使用新变量避免竞态条件
        const updatedRow = row
        updatedRow.status = 'off_sale'
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
        // 逐个发布产品
        for (const id of ids) {
          await publishProduct(id, { status: 'published' })
        }

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
        // 逐个下架产品
        for (const id of ids) {
          await publishProduct(id, { status: 'unpublished' })
        }

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

/* 批次管理样式 */
.batch-list-header {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
}

.batch-pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
