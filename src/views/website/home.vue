<template>
  <div class="website-home-container">
    <div class="app-container">
      <div class="page-header">
        <h3>首页配置</h3>
        <p class="desc">配置官网首页的各种展示内容</p>
      </div>

      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>首页基本信息</span>
        </div>

        <el-form label-position="top" label-width="100px">
          <el-form-item label="网站标题">
            <el-input v-model="siteTitle" placeholder="请输入网站标题" />
          </el-form-item>

          <el-form-item label="首页轮播图">
            <el-upload
              class="upload-demo"
              drag
              action=""
              multiple
            >
              <i class="el-icon-upload" />
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div slot="tip" class="el-upload__tip">支持jpg、png、gif格式，建议尺寸：1920x500px</div>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <el-button type="primary">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WebsiteHome',
  data() {
    return {
      siteTitle: '企业官网',
      banners: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      // 后续可对接API获取数据
      console.log('获取首页配置数据')
    },
    saveConfig() {
      // 后续可对接API保存数据
      console.log('保存首页配置')
      this.$message.success('配置保存成功')
    }
  }
}
</script>

<style scoped>
.website-home-container {
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
