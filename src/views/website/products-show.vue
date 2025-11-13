<template>
  <div class="website-products-container">
    <div class="app-container">
      <div class="page-header">
        <h3>产品展示配置</h3>
        <p class="desc">配置官网产品展示页面的内容和布局</p>
      </div>

      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>产品分类管理</span>
          <el-button style="float: right; padding: 3px 0" type="primary" @click="addCategory">
            <i class="el-icon-plus" /> 添加分类
          </el-button>
        </div>

        <el-table :data="categories" style="width: 100%">
          <el-table-column prop="id" label="序号" width="80" />
          <el-table-column prop="name" label="分类名称" width="180" />
          <el-table-column prop="order" label="排序" width="80" />
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.status" @change="updateCategoryStatus(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <el-button size="mini" @click="editCategory(scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="deleteCategory(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="box-card" style="margin-top: 20px;">
        <div slot="header" class="clearfix">
          <span>产品展示设置</span>
        </div>

        <el-form label-position="top">
          <el-form-item label="展示风格">
            <el-radio-group v-model="displayStyle">
              <el-radio label="grid">网格布局</el-radio>
              <el-radio label="list">列表布局</el-radio>
              <el-radio label="carousel">轮播展示</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="每页显示数量">
            <el-input-number v-model="pageSize" :min="1" :max="50" label="每页显示数量" />
          </el-form-item>

          <el-form-item label="是否显示分类筛选">
            <el-switch v-model="showCategoryFilter" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="saveSettings">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 分类编辑对话框 -->
      <el-dialog :title="categoryDialogTitle" :visible.sync="categoryDialogVisible" width="500px">
        <el-form label-position="top">
          <el-form-item label="分类名称">
            <el-input v-model="currentCategory.name" placeholder="请输入分类名称" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="currentCategory.order" :min="1" label="排序" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="categoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCategory">保存</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WebsiteProductsShow',
  data() {
    return {
      categories: [
        { id: 1, name: '新品展示', order: 1, status: true },
        { id: 2, name: '热销产品', order: 2, status: true },
        { id: 3, name: '特色产品', order: 3, status: true }
      ],
      displayStyle: 'grid',
      pageSize: 12,
      showCategoryFilter: true,
      categoryDialogVisible: false,
      categoryDialogTitle: '添加分类',
      currentCategory: {
        id: '',
        name: '',
        order: 1,
        status: true
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      // 后续可对接API获取数据
      console.log('获取产品展示配置数据')
    },
    addCategory() {
      this.categoryDialogTitle = '添加分类'
      this.currentCategory = {
        id: '',
        name: '',
        order: this.categories.length + 1,
        status: true
      }
      this.categoryDialogVisible = true
    },
    editCategory(category) {
      this.categoryDialogTitle = '编辑分类'
      this.currentCategory = { ...category }
      this.categoryDialogVisible = true
    },
    saveCategory() {
      // 后续可对接API保存数据
      console.log('保存分类', this.currentCategory)
      if (!this.currentCategory.id) {
        this.currentCategory.id = this.categories.length + 1
        this.categories.push(this.currentCategory)
      } else {
        const index = this.categories.findIndex(item => item.id === this.currentCategory.id)
        if (index !== -1) {
          this.categories[index] = { ...this.currentCategory }
        }
      }
      this.categoryDialogVisible = false
      this.$message.success('保存成功')
    },
    updateCategoryStatus(category) {
      // 后续可对接API更新状态
      console.log('更新分类状态', category)
      this.$message.success('状态更新成功')
    },
    deleteCategory(id) {
      // 后续可对接API删除数据
      console.log('删除分类', id)
      this.categories = this.categories.filter(item => item.id !== id)
      this.$message.success('删除成功')
    },
    saveSettings() {
      // 后续可对接API保存设置
      console.log('保存产品展示设置')
      this.$message.success('设置保存成功')
    }
  }
}
</script>

<style scoped>
.website-products-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 500;
}

.desc {
  color: #909399;
  margin: 0;
}
</style>
