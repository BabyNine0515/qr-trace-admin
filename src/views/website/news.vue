<template>
  <div class="website-news-container">
    <div class="app-container">
      <div class="page-header">
        <h3>新闻管理</h3>
        <p class="desc">管理网站上展示的新闻和文章内容</p>
      </div>

      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>新闻列表</span>
          <el-button style="float: right; padding: 3px 0" type="primary" @click="addNews">
            <i class="el-icon-plus" /> 添加新闻
          </el-button>
        </div>

        <el-table :data="newsList" style="width: 100%">
          <el-table-column prop="id" label="序号" width="80" />
          <el-table-column prop="title" label="标题" min-width="200" />
          <el-table-column prop="publishDate" label="发布日期" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === 'published' ? 'success' : 'info'">
                {{ scope.row.status === 'published' ? '已发布' : '草稿' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button size="mini" @click="editNews(scope.row)">编辑</el-button>
              <el-button size="mini" :type="scope.row.status === 'published' ? 'warning' : 'success'" @click="toggleStatus(scope.row)">
                {{ scope.row.status === 'published' ? '下架' : '发布' }}
              </el-button>
              <el-button size="mini" type="danger" @click="deleteNews(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :current-page="currentPage"
            :page-size="pageSize"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>

      <!-- 新闻编辑对话框 -->
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px">
        <el-form label-position="top">
          <el-form-item label="标题">
            <el-input v-model="currentNews.title" placeholder="请输入新闻标题" />
          </el-form-item>
          <el-form-item label="内容">
            <el-input v-model="currentNews.content" type="textarea" rows="10" placeholder="请输入新闻内容" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNews">保存</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WebsiteNews',
  data() {
    return {
      newsList: [
        { id: 1, title: '企业年度大会顺利召开', publishDate: '2025-01-15', status: 'published' },
        { id: 2, title: '新产品发布会预告', publishDate: '2025-01-10', status: 'draft' },
        { id: 3, title: '公司获得行业优秀企业称号', publishDate: '2024-12-28', status: 'published' }
      ],
      total: 3,
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      dialogTitle: '添加新闻',
      currentNews: {
        id: '',
        title: '',
        content: '',
        publishDate: '',
        status: 'draft'
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      // 后续可对接API获取数据
      console.log('获取新闻列表')
    },
    addNews() {
      this.dialogTitle = '添加新闻'
      this.currentNews = {
        id: '',
        title: '',
        content: '',
        publishDate: new Date().toISOString().split('T')[0],
        status: 'draft'
      }
      this.dialogVisible = true
    },
    editNews(news) {
      this.dialogTitle = '编辑新闻'
      this.currentNews = { ...news }
      this.dialogVisible = true
    },
    saveNews() {
      // 后续可对接API保存数据
      console.log('保存新闻', this.currentNews)
      this.dialogVisible = false
      this.$message.success('保存成功')
    },
    toggleStatus(news) {
      // 后续可对接API更新状态
      console.log('切换状态', news)
      news.status = news.status === 'published' ? 'draft' : 'published'
      this.$message.success('状态更新成功')
    },
    deleteNews(id) {
      // 后续可对接API删除数据
      console.log('删除新闻', id)
      this.newsList = this.newsList.filter(item => item.id !== id)
      this.$message.success('删除成功')
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    }
  }
}
</script>

<style scoped>
.website-news-container {
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

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
