<template>
  <div class="website-contact-container">
    <div class="app-container">
      <div class="page-header">
        <h3>联系我们配置</h3>
        <p class="desc">配置官网联系我们页面的各种信息</p>
      </div>

      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>联系信息配置</span>
        </div>

        <el-form label-position="top">
          <el-form-item label="公司名称">
            <el-input v-model="contactInfo.companyName" placeholder="请输入公司名称" />
          </el-form-item>

          <el-form-item label="联系电话">
            <el-input v-model="contactInfo.phone" placeholder="请输入联系电话" />
          </el-form-item>

          <el-form-item label="电子邮箱">
            <el-input v-model="contactInfo.email" placeholder="请输入电子邮箱" />
          </el-form-item>

          <el-form-item label="联系地址">
            <el-input v-model="contactInfo.address" type="textarea" rows="3" placeholder="请输入联系地址" />
          </el-form-item>

          <el-form-item label="地图位置">
            <div class="map-placeholder">
              <p>地图预览区域</p>
              <p>后续可集成地图组件</p>
            </div>
            <el-input v-model="contactInfo.mapUrl" placeholder="请输入地图链接" />
          </el-form-item>

          <el-form-item label="公司简介">
            <el-input v-model="contactInfo.introduction" type="textarea" rows="5" placeholder="请输入公司简介" />
          </el-form-item>

          <el-form-item label="工作时间">
            <el-input v-model="contactInfo.workHours" placeholder="请输入工作时间，如：周一至周五 9:00-18:00" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="saveContactInfo">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="box-card" style="margin-top: 20px;">
        <div slot="header" class="clearfix">
          <span>社交媒体配置</span>
        </div>

        <el-form label-position="top">
          <el-form-item label="微信公众号">
            <el-upload
              class="avatar-uploader"
              action=""
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
            >
              <img v-if="contactInfo.wechatQrcode" :src="contactInfo.wechatQrcode" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon" />
            </el-upload>
            <div class="form-tip">上传微信公众号二维码图片</div>
          </el-form-item>

          <el-form-item label="官方网站">
            <el-input v-model="contactInfo.officialWebsite" placeholder="请输入官方网站地址" />
          </el-form-item>

          <el-form-item label="微博地址">
            <el-input v-model="contactInfo.weibo" placeholder="请输入微博地址" />
          </el-form-item>

          <el-form-item label="抖音账号">
            <el-input v-model="contactInfo.douyin" placeholder="请输入抖音账号" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="saveSocialMedia">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WebsiteContact',
  data() {
    return {
      contactInfo: {
        companyName: '示例科技有限公司',
        phone: '020-12345678',
        email: 'contact@example.com',
        address: '广东省广州市天河区天河路385号',
        mapUrl: 'https://maps.google.com/',
        introduction: '公司致力于提供高质量的产品和服务...',
        workHours: '周一至周五 9:00-18:00',
        wechatQrcode: '',
        officialWebsite: 'https://www.example.com',
        weibo: 'https://weibo.com/example',
        douyin: '@example'
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      // 后续可对接API获取数据
      console.log('获取联系信息数据')
    },
    saveContactInfo() {
      // 后续可对接API保存数据
      console.log('保存联系信息', this.contactInfo)
      this.$message.success('配置保存成功')
    },
    saveSocialMedia() {
      // 后续可对接API保存数据
      console.log('保存社交媒体配置', this.contactInfo)
      this.$message.success('配置保存成功')
    },
    handleAvatarSuccess(res, file) {
      // 后续可对接文件上传API
      this.contactInfo.wechatQrcode = URL.createObjectURL(file.raw)
    }
  }
}
</script>

<style scoped>
.website-contact-container {
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

.map-placeholder {
  width: 100%;
  height: 200px;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.map-placeholder p {
  margin: 5px 0;
  color: #909399;
}

.avatar-uploader .el-upload {
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 150px;
  height: 150px;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 150px;
  height: 150px;
  line-height: 150px;
  text-align: center;
}

.avatar {
  width: 150px;
  height: 150px;
  display: block;
}

.form-tip {
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
}
</style>
