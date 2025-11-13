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

      // 模拟后端API调用，实际项目中应该调用真实的API
      // 这里我们直接生成一个模拟的二维码URL和溯源链接
      const baseUrl = window.location.origin
      const traceabilityPath = '/public/traceability/verify'
      this.traceabilityLink = `${baseUrl}${traceabilityPath}?productId=${this.searchForm.productId}`

      // 使用qrserver生成二维码，实际项目中可能由后端生成
      this.qrcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.traceabilityLink)}`

      this.linkDescription = `该二维码链接指向溯源码验证页面，用户扫描后会跳转到溯源码管理的前端客户端应用，前端会通过链接中携带的productId=${this.searchForm.productId}参数获取相应的产品信息。${this.searchForm.productName ? `产品名称：${this.searchForm.productName}` : ''}`

      // 将新生成的二维码添加到列表中
      const newQRCode = {
        id: Date.now(),
        productId: this.searchForm.productId,
        qrcodeUrl: this.qrcodeUrl,
        traceabilityLink: this.traceabilityLink,
        createTime: new Date().toLocaleString()
      }

      // 模拟添加到后端数据库，实际项目中应该调用API保存
      this.qrcodeList.unshift(newQRCode)
      this.total++

      this.$message.success('二维码生成成功')
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
      // 模拟后端API调用，获取已生成的二维码列表
      // 实际项目中应该调用真实的API
      this.qrcodeList = [
        {
          id: 1,
          productId: 'PROD001',
          qrcodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}/public/traceability/verify?productId=PROD001`)}`,
          traceabilityLink: `${window.location.origin}/public/traceability/verify?productId=PROD001`,
          createTime: '2024-01-15 10:30:00'
        },
        {
          id: 2,
          productId: 'PROD002',
          qrcodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}/public/traceability/verify?productId=PROD002`)}`,
          traceabilityLink: `${window.location.origin}/public/traceability/verify?productId=PROD002`,
          createTime: '2024-01-15 11:45:00'
        },
        {
          id: 3,
          productId: 'PROD003',
          qrcodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}/public/traceability/verify?productId=PROD003`)}`,
          traceabilityLink: `${window.location.origin}/public/traceability/verify?productId=PROD003`,
          createTime: '2024-01-15 14:20:00'
        }
      ]
      this.total = this.qrcodeList.length
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
        // 模拟删除操作，实际项目中应该调用API删除
        this.qrcodeList = this.qrcodeList.filter(item => item.id !== id)
        this.total--
        this.$message.success('删除成功')
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
