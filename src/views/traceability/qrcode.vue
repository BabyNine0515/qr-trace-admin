<template>
  <div class="traceability-qrcode-container">
    <div class="app-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>溯源码管理</el-breadcrumb-item>
        <el-breadcrumb-item>溯源码二维码</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 操作区 -->
      <el-card class="search-card">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="产品ID:">
            <el-input v-model="searchForm.productId" placeholder="请输入产品ID" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="generateQRCode">生成二维码</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 二维码展示区 -->
      <el-card v-if="qrcodeUrl" class="qrcode-card">
        <div class="qrcode-content">
          <div class="qrcode-display">
            <img :src="qrcodeUrl" alt="溯源码二维码" class="qrcode-image">
            <div v-if="searchForm.productName" class="qrcode-product-name">{{ searchForm.productName }}</div>
            <div class="qrcode-desc">扫描二维码查看产品溯源信息</div>
          </div>

          <div class="qrcode-actions">
            <el-button type="primary" @click="downloadQRCode">下载二维码</el-button>
            <el-button @click="copyLink">复制链接</el-button>
            <el-button @click="previewLink">预览链接</el-button>
          </div>

          <div class="link-info">
            <el-form-item label="溯源链接:">
              <el-input v-model="traceabilityLink" readonly :prefix-icon="'el-icon-link'" />
            </el-form-item>
            <el-form-item label="链接说明:">
              <el-input v-model="linkDescription" type="textarea" :rows="4" readonly />
            </el-form-item>
          </div>
        </div>
      </el-card>

      <!-- 二维码列表 -->
      <el-card class="list-card">
        <div slot="header" class="clearfix">
          <span>已生成的二维码列表</span>
        </div>
        <el-table :data="qrcodeList" style="width: 100%">
          <el-table-column prop="id" label="序号" width="80" />
          <el-table-column prop="productId" label="产品ID" width="150" />
          <el-table-column prop="productName" label="产品名称" width="180" />
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="二维码" width="120">
            <template slot-scope="scope">
              <img :src="scope.row.qrcodeUrl" alt="二维码" class="small-qrcode" @click="showQRCodeDialog(scope.row)">
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button size="mini" @click="downloadSingleQRCode(scope.row)">下载</el-button>
              <el-button size="mini" @click="copySingleLink(scope.row)">复制链接</el-button>
              <el-button size="mini" type="danger" @click="deleteQRCode(scope.row.id)">删除</el-button>
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
    </div>

    <!-- 二维码预览对话框 -->
    <el-dialog title="二维码预览" :visible.sync="dialogVisible" width="400px">
      <div class="dialog-qrcode-content">
        <img :src="dialogQRCodeUrl" alt="二维码" class="dialog-qrcode-image">
        <div class="dialog-qrcode-desc">扫描二维码查看产品溯源信息</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { generateQRCode, getQRCodeList, deleteQRCode } from '@/api/traceability'

export default {
  name: 'TraceabilityQRCode',
  data() {
    return {
      searchForm: {
        productId: '',
        productName: ''
      },
      qrcodeUrl: '',
      traceabilityLink: '',
      linkDescription: '',
      qrcodeList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      dialogQRCodeUrl: ''
    }
  },
  created() {
    this.fetchQRCodeList()
  },
  methods: {
    // 生成二维码
    generateQRCode() {
      if (!this.searchForm.productId) {
        this.$message.warning('请输入产品ID')
        return
      }

      const params = {
        productId: this.searchForm.productId,
        productName: this.searchForm.productName
      }

      this.$loading({
        lock: true,
        text: '正在生成二维码...',
        spinner: 'el-icon-loading'
      })

      generateQRCode(params)
        .then(response => {
          const { qrcodeUrl, traceabilityLink } = response.data
          this.qrcodeUrl = qrcodeUrl
          this.traceabilityLink = traceabilityLink

          this.linkDescription = `该二维码链接指向溯源码验证页面，用户扫描后会跳转到溯源码H5页面，前端会通过链接中携带的productId=${this.searchForm.productId}参数获取相应的产品信息。${this.searchForm.productName ? `产品名称：${this.searchForm.productName}` : ''}`

          this.$message.success('二维码生成成功')
          // 重新获取列表以显示最新生成的二维码
          this.fetchQRCodeList()
        })
        .catch(error => {
          console.error('生成二维码失败:', error)
          this.$message.error('生成二维码失败，请稍后重试')
        })
        .finally(() => {
          this.$loading().close()
        })
    },

    // 下载二维码
    downloadQRCode() {
      if (!this.qrcodeUrl) {
        this.$message.warning('请先生成二维码')
        return
      }

      const link = document.createElement('a')
      link.href = this.qrcodeUrl
      link.download = `traceability-qrcode-${this.searchForm.productId}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    // 复制链接
    copyLink() {
      if (!this.traceabilityLink) {
        this.$message.warning('请先生成二维码')
        return
      }

      const textarea = document.createElement('textarea')
      textarea.value = this.traceabilityLink
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)

      this.$message.success('链接复制成功')
    },

    // 预览链接
    previewLink() {
      if (!this.traceabilityLink) {
        this.$message.warning('请先生成二维码')
        return
      }

      window.open(this.traceabilityLink, '_blank')
    },

    // 获取二维码列表
    fetchQRCodeList() {
      const params = {
        page: this.currentPage,
        pageSize: this.pageSize
      }

      this.$loading({
        lock: true,
        text: '正在加载数据...',
        spinner: 'el-icon-loading'
      })

      getQRCodeList(params)
        .then(response => {
          this.qrcodeList = response.data.list
          this.total = response.data.total
        })
        .catch(error => {
          console.error('获取二维码列表失败:', error)
          this.$message.error('获取数据失败，请稍后重试')
          // 如果API调用失败，使用模拟数据显示
          this.qrcodeList = [
            {
              id: 1,
              productId: '374643833609',
              qrcodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://h5.xiangtaihou-food.com/verify?productId=374643833609')}`,
              traceabilityLink: 'https://h5.xiangtaihou-food.com/verify?productId=374643833609',
              createTime: '2024-01-15 10:30:00'
            }
          ]
          this.total = this.qrcodeList.length
        })
        .finally(() => {
          this.$loading().close()
        })
    },

    // 分页处理
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchQRCodeList()
    },

    // 显示二维码对话框
    showQRCodeDialog(item) {
      this.dialogQRCodeUrl = item.qrcodeUrl
      this.dialogVisible = true
    },

    // 下载单个二维码
    downloadSingleQRCode(item) {
      const link = document.createElement('a')
      link.href = item.qrcodeUrl.replace('size=100x100', 'size=200x200')
      link.download = `traceability-qrcode-${item.productId}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    // 复制单个链接
    copySingleLink(item) {
      const textarea = document.createElement('textarea')
      textarea.value = item.traceabilityLink
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)

      this.$message.success('链接复制成功')
    },

    // 删除二维码
    deleteQRCode(id) {
      this.$confirm('确定要删除这个二维码吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$loading({
          lock: true,
          text: '正在删除...',
          spinner: 'el-icon-loading'
        })

        deleteQRCode(id)
          .then(() => {
            this.qrcodeList = this.qrcodeList.filter(item => item.id !== id)
            this.total--
            this.$message.success('删除成功')
          })
          .catch(error => {
            console.error('删除二维码失败:', error)
            this.$message.error('删除失败，请稍后重试')
          })
          .finally(() => {
            this.$loading().close()
          })
      }).catch(() => {
        // 取消删除
      })
    }
  }
}
</script>

<style scoped>
.traceability-qrcode-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
}

.qrcode-card {
  margin-bottom: 20px;
}

.qrcode-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-display {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-image {
  width: 250px;
  height: 250px;
  border: 1px solid #e0e0e0;
  padding: 10px;
}

.qrcode-desc {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}

.qrcode-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.link-info {
  width: 100%;
}

.list-card {
  margin-top: 20px;
}

.small-qrcode {
  width: 60px;
  height: 60px;
  cursor: pointer;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-qrcode-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.dialog-qrcode-image {
  width: 200px;
  height: 200px;
}

.dialog-qrcode-desc {
  margin-top: 15px;
  font-size: 14px;
  color: #606266;
}
</style>
