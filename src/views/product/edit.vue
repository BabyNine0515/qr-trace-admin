<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item><router-link to="/product/list">产品列表</router-link></el-breadcrumb-item>
        <el-breadcrumb-item>{{ isEdit ? '编辑产品' : '新增产品' }}</el-breadcrumb-item>
      </el-breadcrumb>

      <el-form ref="productForm" :model="productForm" :rules="rules" label-width="120px">
        <!-- 产品基本信息 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>产品基本信息</span>
            </div>
          </template>

          <!-- <el-form-item label="产品码" prop="productCode">
            <el-input v-model="productForm.productCode" placeholder="请输入产品码（厂家码+品类码+日期+流水）" />
            <div class="el-form-item__help">必填，≤32字符，唯一索引</div>
          </el-form-item> -->

          <!-- 产品名称（多语言） -->
          <el-form-item label="产品名称" prop="productName">
            <el-tabs type="border-card">
              <el-tab-pane label="中文">
                <el-input v-model="productForm.productName.zh" placeholder="请输入产品中文名称" maxlength="30" show-word-limit />
              </el-tab-pane>
              <el-tab-pane label="英文">
                <el-input v-model="productForm.productName.en" placeholder="请输入产品英文名称" maxlength="30" show-word-limit />
              </el-tab-pane>
            </el-tabs>
            <div class="el-form-item__help">必填，每语言≤30字</div>
          </el-form-item>

          <!-- 产品副标题（多语言） -->
          <el-form-item label="产品副标题" prop="productSubTitle">
            <el-tabs type="border-card">
              <el-tab-pane label="中文">
                <el-input v-model="productForm.productSubTitle.zh" placeholder="请输入产品中文副标题" maxlength="60" show-word-limit />
              </el-tab-pane>
              <el-tab-pane label="英文">
                <el-input v-model="productForm.productSubTitle.en" placeholder="请输入产品英文副标题" maxlength="60" show-word-limit />
              </el-tab-pane>
            </el-tabs>
            <div class="el-form-item__help">选填，每语言≤60字</div>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <!-- 保质期（多语言） -->
              <el-form-item label="保质期" prop="shelfLife">
                <el-tabs type="border-card" class="mini-tabs">
                  <el-tab-pane label="中文">
                    <el-input v-model="productForm.shelfLife.zh" placeholder="例如：270天" maxlength="20" show-word-limit />
                  </el-tab-pane>
                  <el-tab-pane label="英文">
                    <el-input v-model="productForm.shelfLife.en" placeholder="例如：270 days" maxlength="20" show-word-limit />
                  </el-tab-pane>
                </el-tabs>
                <div class="el-form-item__help">必填，每语言≤20字</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <!-- 净含量（多语言） -->
              <el-form-item label="净含量" prop="netWeight">
                <el-tabs type="border-card" class="mini-tabs">
                  <el-tab-pane label="中文">
                    <el-input v-model="productForm.netWeight.zh" placeholder="例如：150g/袋" maxlength="20" show-word-limit />
                  </el-tab-pane>
                  <el-tab-pane label="英文">
                    <el-input v-model="productForm.netWeight.en" placeholder="例如：150g/bag" maxlength="20" show-word-limit />
                  </el-tab-pane>
                </el-tabs>
                <div class="el-form-item__help">必填，每语言≤20字</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 产品图片管理 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>产品图片管理</span>
            </div>
          </template>

          <!-- 产品主图 -->
          <el-form-item label="产品主图" prop="productImage">
            <el-upload
              action="#"
              list-type="picture-card"
              :file-list="productImageList"
              :on-preview="handleImagePreview"
              :on-remove="handleProductImageRemove"
              :on-change="handleProductImageChange"
              :limit="1"
              accept="image/jpeg,image/png,image/webp"
              :before-upload="beforeProductImageUpload"
              :auto-upload="false"
            >
              <i class="el-icon-plus" />
            </el-upload>
            <div class="el-form-item__help">必填，jpg/png/webp格式，≤800KB，建议比例4:3</div>
          </el-form-item>

          <!-- 产品图库 -->
          <el-form-item label="产品图库" prop="productGallery">
            <el-upload
              action="#"
              list-type="picture-card"
              :file-list="productGalleryList"
              :on-preview="handleImagePreview"
              :on-remove="handleGalleryImageRemove"
              :on-change="handleGalleryImageChange"
              :limit="6"
              accept="image/jpeg,image/png,image/webp"
              :before-upload="beforeGalleryImageUpload"
              :auto-upload="false"
            >
              <i class="el-icon-plus" />
            </el-upload>
            <div class="el-form-item__help">必填，2~6张，单张≤500KB</div>
          </el-form-item>

          <el-dialog :visible.sync="dialogVisible" append-to-body>
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
        </el-card>

        <!-- 产品详情网格 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>产品基础信息网格</span>
              <el-button type="primary" size="small" @click="addProductDetail">添加信息项</el-button>
            </div>
          </template>

          <div v-if="productForm.productDetails.length === 0" class="empty-tip">暂无信息项，请点击上方按钮添加</div>

          <div v-for="(detail, index) in productForm.productDetails" :key="index" class="detail-item">
            <el-divider>信息项 {{ index + 1 }}</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="标签（中文）">
                  <el-input v-model="detail.labelKey.zh" placeholder="请输入标签中文名称" maxlength="20" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="标签（英文）">
                  <el-input v-model="detail.labelKey.en" placeholder="请输入标签英文名称" maxlength="20" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="值（中文）">
                  <el-input v-model="detail.value.zh" placeholder="请输入值中文内容" maxlength="50" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="值（英文）">
                  <el-input v-model="detail.value.en" placeholder="请输入值英文内容" maxlength="50" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="点击类型">
              <el-select v-model="detail.clickType" placeholder="请选择点击类型">
                <el-option label="无" value="none" />
                <el-option label="报告" value="report" />
              </el-select>
            </el-form-item>
            <el-button type="danger" size="small" @click="removeProductDetail(index)">删除信息项</el-button>
          </div>
          <div class="el-form-item__help">必填，最多添加12个信息项</div>
        </el-card>

        <!-- 检验报告 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>检验报告</span>
            </div>
          </template>

          <el-upload
            action="#"
            list-type="picture-card"
            :file-list="inspectionReportsList"
            :on-preview="handleReportPreview"
            :on-remove="handleReportRemove"
            :on-change="handleReportChange"
            :limit="8"
            accept="image/jpeg,image/png,image/pdf"
            :before-upload="beforeReportUpload"
            :auto-upload="false"
          >
            <i class="el-icon-plus" />
          </el-upload>
          <div class="el-form-item__help">必填，2~8张，单张≤600KB，建议统一命名为report_1.jpg等</div>
        </el-card>

        <!-- 公司信息 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>公司信息</span>
            </div>
          </template>

          <!-- 公司名称（多语言） -->
          <el-form-item label="公司名称" prop="companyName">
            <el-tabs type="border-card">
              <el-tab-pane label="中文">
                <el-input v-model="productForm.companyName.zh" placeholder="请输入公司中文名称" maxlength="50" show-word-limit />
              </el-tab-pane>
              <el-tab-pane label="英文">
                <el-input v-model="productForm.companyName.en" placeholder="请输入公司英文名称" maxlength="50" show-word-limit />
              </el-tab-pane>
            </el-tabs>
            <div class="el-form-item__help">必填，与营业执照一致</div>
          </el-form-item>

          <el-form-item label="统一社会信用码" prop="socialCreditCode">
            <el-input v-model="productForm.socialCreditCode" placeholder="请输入18位统一社会信用码" />
            <div class="el-form-item__help">必填，18位，需正则校验</div>
          </el-form-item>

          <el-form-item label="法定代表人" prop="legalRepresentative">
            <el-input v-model="productForm.legalRepresentative" placeholder="请输入法定代表人姓名" maxlength="20" show-word-limit />
            <div class="el-form-item__help">选填，≤20字</div>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="联系电话" prop="companyPhone">
                <el-input v-model="productForm.companyPhone" placeholder="请输入联系电话，多段用/分隔" maxlength="40" show-word-limit />
                <div class="el-form-item__help">必填，≤40字</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="官网" prop="companyWebsite">
                <el-input v-model="productForm.companyWebsite" placeholder="请输入官网域名，不含http://" maxlength="100" show-word-limit />
                <div class="el-form-item__help">选填，例：www.xxx.com</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="邮箱" prop="companyEmail">
            <el-input v-model="productForm.companyEmail" placeholder="请输入邮箱，多个用;分隔" maxlength="200" show-word-limit />
            <div class="el-form-item__help">选填，例：a@xx.com;b@xx.com</div>
          </el-form-item>
        </el-card>

        <!-- 企业资质 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>企业资质</span>
            </div>
          </template>

          <el-upload
            action="#"
            list-type="picture-card"
            :file-list="companyQualificationsList"
            :on-preview="handleQualificationPreview"
            :on-remove="handleQualificationRemove"
            :on-change="handleQualificationChange"
            :limit="6"
            accept="image/jpeg,image/png,image/pdf"
            :before-upload="beforeQualificationUpload"
            :auto-upload="false"
          >
            <i class="el-icon-plus" />
          </el-upload>
          <div class="el-form-item__help">必填，1~6张，单张≤500KB，建议命名为qual_1.jpg等</div>
        </el-card>

        <!-- 上游生产信息 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>上游生产信息</span>
              <el-button type="primary" size="small" @click="addUpstreamInfo">添加信息项</el-button>
            </div>
          </template>

          <div v-if="productForm.upstreamInfo.length === 0" class="empty-tip">暂无信息项，请点击上方按钮添加</div>

          <div v-for="(info, index) in productForm.upstreamInfo" :key="index" class="detail-item">
            <el-divider>信息项 {{ index + 1 }}</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="标签（中文）">
                  <el-input v-model="info.labelKey.zh" placeholder="请输入标签中文名称" maxlength="20" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="标签（英文）">
                  <el-input v-model="info.labelKey.en" placeholder="请输入标签英文名称" maxlength="20" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="值（中文）">
                  <el-input v-model="info.value.zh" placeholder="请输入值中文内容" maxlength="50" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="值（英文）">
                  <el-input v-model="info.value.en" placeholder="请输入值英文内容" maxlength="50" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="点击类型">
              <el-select v-model="info.clickType" placeholder="请选择点击类型">
                <el-option label="无" value="none" />
                <el-option label="报告" value="report" />
              </el-select>
            </el-form-item>
            <el-button type="danger" size="small" @click="removeUpstreamInfo(index)">删除信息项</el-button>
          </div>
          <div class="el-form-item__help">必填，格式与产品详情网格相同</div>
        </el-card>

        <!-- 产品视频 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>产品视频</span>
            </div>
          </template>

          <div v-if="productForm.videoUrl" class="video-preview mb-4">
            <video :src="productForm.videoUrl" controls style="max-width: 100%;" />
            <el-button type="danger" size="small" class="mt-2" @click="removeVideo">删除视频</el-button>
          </div>

          <el-upload
            action="#"
            :before-upload="beforeVideoUpload"
            :on-change="handleVideoChange"
            accept="video/mp4"
            :limit="1"
            :on-exceed="handleVideoExceed"
            :auto-upload="false"
          >
            <el-button size="small" type="primary">上传视频</el-button>
            <div slot="tip" class="el-upload__tip">
              请上传MP4格式的视频文件，大小不超过30MB，分辨率≤1080p，时长≤60秒
            </div>
          </el-upload>
        </el-card>

        <!-- 公司宣传媒体 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>公司宣传媒体</span>
            </div>
          </template>

          <el-form-item label="媒体类型" prop="companyMediaType">
            <el-radio-group v-model="productForm.companyMediaType">
              <el-radio label="video">视频</el-radio>
              <el-radio label="image">图片</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="productForm.companyMediaType === 'video' ? '宣传视频' : '宣传图片'" prop="companyMediaUrl">
            <div v-if="productForm.companyMediaUrl" class="company-media-preview mb-4">
              <video v-if="productForm.companyMediaType === 'video'" :src="productForm.companyMediaUrl" controls style="max-width: 100%;" />
              <img v-else :src="productForm.companyMediaUrl" style="max-width: 100%;">
              <el-button type="danger" size="small" class="mt-2" @click="removeCompanyMedia">删除媒体</el-button>
            </div>

            <el-upload
              action="#"
              :before-upload="beforeCompanyMediaUpload"
              :on-change="handleCompanyMediaChange"
              :accept="productForm.companyMediaType === 'video' ? 'video/mp4' : 'image/jpeg,image/png,image/webp'"
              :limit="1"
              :auto-upload="false"
            >
              <el-button size="small" type="primary">上传{{ productForm.companyMediaType === 'video' ? '视频' : '图片' }}</el-button>
              <div slot="tip" class="el-upload__tip">
                {{ productForm.companyMediaType === 'video' ? '请上传MP4格式的视频文件，大小不超过20MB' : '请上传图片文件，大小不超过800KB' }}
              </div>
            </el-upload>
          </el-form-item>

          <el-form-item v-if="productForm.companyMediaType === 'video'" label="视频封面" prop="companyMediaPoster">
            <div v-if="productForm.companyMediaPoster" class="poster-preview mb-4">
              <img :src="productForm.companyMediaPoster" style="max-width: 200px;">
              <el-button type="danger" size="small" class="mt-2" @click="removeCompanyMediaPoster">删除封面</el-button>
            </div>

            <el-upload
              action="#"
              :before-upload="beforeCompanyMediaPosterUpload"
              :on-change="handleCompanyMediaPosterChange"
              accept="image/jpeg,image/png,image/webp"
              :auto-upload="false"
              :limit="1"
            >
              <el-button size="small" type="primary">上传封面</el-button>
              <div slot="tip" class="el-upload__tip">
                请上传图片文件，大小不超过300KB
              </div>
            </el-upload>
          </el-form-item>
        </el-card>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getProductDetail, createProduct, updateProduct } from '@/api/product'
import { uploadImage, uploadVideo, uploadFile } from '@/api/media'

export default {
  name: 'ProductEdit',
  data() {
    return {
      isEdit: false,
      productId: null,
      productForm: {
        productCode: '',
        productName: {
          zh: '',
          en: ''
        },
        productSubTitle: {
          zh: '',
          en: ''
        },
        shelfLife: {
          zh: '',
          en: ''
        },
        netWeight: {
          zh: '',
          en: ''
        },
        productDetails: [],
        companyName: {
          zh: '',
          en: ''
        },
        socialCreditCode: '',
        legalRepresentative: '',
        companyPhone: '',
        companyWebsite: '',
        companyEmail: '',
        upstreamInfo: [],
        videoUrl: '',
        companyMediaType: 'image',
        companyMediaUrl: '',
        companyMediaPoster: ''
      },
      rules: {
        productCode: [
          { required: true, message: '请输入产品码', trigger: 'blur' },
          { max: 32, message: '产品码长度不能超过32个字符', trigger: 'blur' }
        ],
        productName: [
          { required: true, validator: this.validateI18nRequired, trigger: 'blur' }
        ],
        shelfLife: [
          { required: true, validator: this.validateI18nRequired, trigger: 'blur' }
        ],
        netWeight: [
          { required: true, validator: this.validateI18nRequired, trigger: 'blur' }
        ],
        companyName: [
          { required: true, validator: this.validateI18nRequired, trigger: 'blur' }
        ],
        socialCreditCode: [
          { required: true, message: '请输入统一社会信用码', trigger: 'blur' },
          { pattern: /^[A-Z0-9]{18}$/, message: '统一社会信用码格式不正确', trigger: 'blur' }
        ],
        companyPhone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { max: 40, message: '联系电话长度不能超过40个字符', trigger: 'blur' }
        ]
      },
      loading: false,
      productImageList: [],
      productGalleryList: [],
      inspectionReportsList: [],
      companyQualificationsList: [],
      dialogVisible: false,
      dialogImageUrl: ''
    }
  },
  created() {
    // 获取URL参数，判断是新增还是编辑
    const id = this.$route.query.id
    if (id) {
      this.isEdit = true
      this.productId = id
      this.loadProductData()
    }
  },
  methods: {
    // 验证i18n对象是否至少有一个语言必填
    validateI18nRequired(rule, value, callback) {
      if (!value || (!value.zh && !value.en)) {
        callback(new Error('请至少填写一个语言版本'))
      } else {
        callback()
      }
    },

    // 验证图片数量
    validateImageCount(rule, value, callback) {
      if (value && value.length < 2) {
        callback(new Error('至少上传2张图片'))
      } else {
        callback()
      }
    },

    // 加载产品数据
    async loadProductData() {
      try {
        this.loading = true
        const response = await getProductDetail(this.productId)
        const { data } = response

        this.productForm = {
          productCode: data.productCode,
          productName: data.productName || { zh: '', en: '' },
          productSubTitle: data.productSubTitle || { zh: '', en: '' },
          shelfLife: data.shelfLife || { zh: '', en: '' },
          netWeight: data.netWeight || { zh: '', en: '' },
          productDetails: data.productDetails || [],
          companyName: data.companyName || { zh: '', en: '' },
          socialCreditCode: data.socialCreditCode,
          legalRepresentative: data.legalRepresentative || '',
          companyPhone: data.companyPhone,
          companyWebsite: data.companyWebsite || '',
          companyEmail: data.companyEmail || '',
          upstreamInfo: data.upstreamInfo || [],
          videoUrl: data.videoUrl || '',
          companyMediaType: data.companyMediaType || 'image',
          companyMediaUrl: data.companyMediaUrl || '',
          companyMediaPoster: data.companyMediaPoster || ''
        }

        // 加载产品主图
        if (data.productImage) {
          this.productImageList = [{ url: data.productImage }]
        }

        // 加载产品图库
        if (data.productGallery && Array.isArray(data.productGallery)) {
          this.productGalleryList = data.productGallery.map(url => ({ url }))
        }

        // 加载检验报告
        if (data.inspectionReports && Array.isArray(data.inspectionReports)) {
          this.inspectionReportsList = data.inspectionReports.map(url => ({ url }))
        }

        // 加载企业资质
        if (data.companyQualifications && Array.isArray(data.companyQualifications)) {
          this.companyQualificationsList = data.companyQualifications.map(url => ({ url }))
        }
      } catch (error) {
        this.$message.error('加载产品数据失败: ' + (error.message || '未知错误'))
        console.error('加载产品数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 添加产品详情项
    addProductDetail() {
      if (this.productForm.productDetails.length >= 12) {
        this.$message.warning('最多只能添加12个信息项')
        return
      }
      this.productForm.productDetails.push({
        labelKey: { zh: '', en: '' },
        value: { zh: '', en: '' },
        clickType: 'none'
      })
    },

    // 删除产品详情项
    removeProductDetail(index) {
      this.productForm.productDetails.splice(index, 1)
    },

    // 添加上游信息项
    addUpstreamInfo() {
      this.productForm.upstreamInfo.push({
        labelKey: { zh: '', en: '' },
        value: { zh: '', en: '' },
        clickType: 'none'
      })
    },

    // 删除上游信息项
    removeUpstreamInfo(index) {
      this.productForm.upstreamInfo.splice(index, 1)
    },

    // 图片预览
    handleImagePreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },

    // 报告预览
    handleReportPreview(file) {
      if (file.url.endsWith('.pdf')) {
        window.open(file.url, '_blank')
      } else {
        this.dialogImageUrl = file.url
        this.dialogVisible = true
      }
    },

    // 资质预览
    handleQualificationPreview(file) {
      if (file.url.endsWith('.pdf')) {
        window.open(file.url, '_blank')
      } else {
        this.dialogImageUrl = file.url
        this.dialogVisible = true
      }
    },

    // 处理产品主图上传
    async beforeProductImageUpload(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
      const isLt800K = file.size / 1024 < 800

      if (!isImage) {
        this.$message.error('只能上传JPG、PNG或WEBP格式的图片!')
      }
      if (!isLt800K) {
        this.$message.error('上传图片大小不能超过 800KB!')
      }
      return isImage && isLt800K
    },

    async handleProductImageChange(file, fileList) {
      if (file.raw) { // 当选择文件后立即上传
        try {
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('type', 'productImage')
          const response = await uploadImage(formData)
          // 创建新对象避免直接修改file属性导致的竞态条件
          const updatedFile = Object.assign({}, file, {
            url: response.data.url,
            status: 'success'
          })
          const updatedFileList = [...fileList]
          const index = updatedFileList.findIndex(f => f.uid === file.uid)
          if (index !== -1) {
            updatedFileList[index] = updatedFile
          }
          this.productImageList = updatedFileList
        } catch (error) {
          this.$message.error('图片上传失败: ' + (error.message || '未知错误'))
          const updatedFile = Object.assign({}, file, {
            status: 'error'
          })
          const updatedFileList = [...fileList]
          const index = updatedFileList.findIndex(f => f.uid === file.uid)
          if (index !== -1) {
            updatedFileList[index] = updatedFile
          }
          this.productImageList = updatedFileList
        }
      } else {
        this.productImageList = fileList
      }
    },

    handleProductImageRemove(file, fileList) {
      this.productImageList = fileList
    },

    // 处理图库图片上传
    async beforeGalleryImageUpload(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
      const isLt500K = file.size / 1024 < 500

      if (!isImage) {
        this.$message.error('只能上传JPG、PNG或WEBP格式的图片!')
      }
      if (!isLt500K) {
        this.$message.error('上传图片大小不能超过 500KB!')
      }
      return isImage && isLt500K
    },

    async handleGalleryImageChange(file, fileList) {
      if (file.raw) { // 当选择文件后立即上传
        try {
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('type', 'gallery')
          const response = await uploadImage(formData)
          // 创建新对象避免直接修改file属性导致的竞态条件
          const updatedFile = Object.assign({}, file, {
            url: response.data.url,
            status: 'success'
          })
          const updatedFileList = [...fileList]
          const index = updatedFileList.findIndex(f => f.uid === file.uid)
          if (index !== -1) {
            updatedFileList[index] = updatedFile
          }
          this.productGalleryList = updatedFileList
        } catch (error) {
          this.$message.error('图片上传失败: ' + (error.message || '未知错误'))
          const updatedFile = Object.assign({}, file, {
            status: 'error'
          })
          const updatedFileList = [...fileList]
          const index = updatedFileList.findIndex(f => f.uid === file.uid)
          if (index !== -1) {
            updatedFileList[index] = updatedFile
          }
          this.productGalleryList = updatedFileList
        }
      } else {
        this.productGalleryList = fileList
      }
    },

    handleGalleryImageRemove(file, fileList) {
      this.productGalleryList = fileList
    },

    // 处理报告上传
    async beforeReportUpload(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
      const isPdf = file.type === 'application/pdf'
      const isLt600K = file.size / 1024 < 600

      if (!isImage && !isPdf) {
        this.$message.error('只能上传JPG、PNG或PDF格式的文件!')
      }
      if (!isLt600K) {
        this.$message.error('上传文件大小不能超过 600KB!')
      }
      return (isImage || isPdf) && isLt600K
    },

    async handleReportChange(file, fileList) {
      if (file.raw) { // 当选择文件后立即上传
        try {
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('type', 'report')
          const response = await uploadFile(formData)
          // 创建新对象避免直接修改file属性导致的竞态条件
          const updatedFile = Object.assign({}, file, {
            url: response.data.url,
            status: 'success'
          })
          const updatedFileList = [...fileList]
          const index = updatedFileList.findIndex(f => f.uid === file.uid)
          if (index !== -1) {
            updatedFileList[index] = updatedFile
          }
          this.inspectionReportsList = updatedFileList
        } catch (error) {
          this.$message.error('文件上传失败: ' + (error.message || '未知错误'))
          const updatedFile = Object.assign({}, file, {
            status: 'error'
          })
          const updatedFileList = [...fileList]
          const index = updatedFileList.findIndex(f => f.uid === file.uid)
          if (index !== -1) {
            updatedFileList[index] = updatedFile
          }
          this.inspectionReportsList = updatedFileList
        }
      } else {
        this.inspectionReportsList = fileList
      }
    },

    handleReportRemove(file, fileList) {
      this.inspectionReportsList = fileList
    },

    // 处理企业资质上传
    async beforeQualificationUpload(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
      const isPdf = file.type === 'application/pdf'
      const isLt500K = file.size / 1024 < 500

      if (!isImage && !isPdf) {
        this.$message.error('只能上传JPG、PNG或PDF格式的文件!')
      }
      if (!isLt500K) {
        this.$message.error('上传文件大小不能超过 500KB!')
      }
      return (isImage || isPdf) && isLt500K
    },

    async handleQualificationChange(file, fileList) {
      if (file.raw) { // 当选择文件后立即上传
        try {
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('type', 'qualification')
          const response = await uploadFile(formData)
          // 创建新对象避免直接修改file属性导致的竞态条件
          const updatedFile = Object.assign({}, file, {
            url: response.data.url,
            status: 'success'
          })
          const updatedFileList = [...fileList]
          const index = updatedFileList.findIndex(f => f.uid === file.uid)
          if (index !== -1) {
            updatedFileList[index] = updatedFile
          }
          this.companyQualificationsList = updatedFileList
        } catch (error) {
          this.$message.error('文件上传失败: ' + (error.message || '未知错误'))
          const updatedFile = Object.assign({}, file, {
            status: 'error'
          })
          const updatedFileList = [...fileList]
          const index = updatedFileList.findIndex(f => f.uid === file.uid)
          if (index !== -1) {
            updatedFileList[index] = updatedFile
          }
          this.companyQualificationsList = updatedFileList
        }
      } else {
        this.companyQualificationsList = fileList
      }
    },

    handleQualificationRemove(file, fileList) {
      this.companyQualificationsList = fileList
    },

    // 视频上传前
    beforeVideoUpload(file) {
      const isVideo = file.type === 'video/mp4'
      const isLt30M = file.size / 1024 / 1024 < 30

      if (!isVideo) {
        this.$message.error('只能上传MP4格式的视频文件!')
      }
      if (!isLt30M) {
        this.$message.error('上传视频大小不能超过 30MB!')
      }
      return isVideo && isLt30M
    },

    // 视频上传处理
    async handleVideoChange(file) {
      if (file.raw) { // 当选择文件后立即上传
        try {
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('type', 'productVideo')
          const result = await uploadVideo(formData)
          this.productForm.videoUrl = result.data.url
          this.$message({ type: 'success', message: '视频上传成功' })
        } catch (error) {
          this.$message.error('视频上传失败: ' + (error.message || '未知错误'))
        }
      }
    },

    // 视频上传超过数量限制
    handleVideoExceed(files, fileList) {
      this.$message.warning(`当前限制上传 1 个视频`)
    },

    // 删除视频
    removeVideo() {
      this.productForm.videoUrl = ''
    },

    // 公司宣传媒体上传
    async beforeCompanyMediaUpload(file) {
      if (this.productForm.companyMediaType === 'video') {
        const isVideo = file.type === 'video/mp4'
        const isLt20M = file.size / 1024 / 1024 < 20
        if (!isVideo) {
          this.$message.error('只能上传MP4格式的视频文件!')
        }
        if (!isLt20M) {
          this.$message.error('上传视频大小不能超过 20MB!')
        }
        return isVideo && isLt20M
      } else {
        const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
        const isLt800K = file.size / 1024 < 800
        if (!isImage) {
          this.$message.error('只能上传JPG、PNG或WEBP格式的图片!')
        }
        if (!isLt800K) {
          this.$message.error('上传图片大小不能超过 800KB!')
        }
        return isImage && isLt800K
      }
    },

    async handleCompanyMediaChange(file) {
      if (file.raw) { // 当选择文件后立即上传
        try {
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('type', this.productForm.companyMediaType === 'video' ? 'companyVideo' : 'companyImage')
          const result = await (this.productForm.companyMediaType === 'video' ? uploadVideo(formData) : uploadImage(formData))
          this.productForm.companyMediaUrl = result.data.url
          this.$message({ type: 'success', message: '媒体上传成功' })
        } catch (error) {
          this.$message.error('媒体上传失败: ' + (error.message || '未知错误'))
        }
      }
    },

    // 删除公司宣传媒体
    removeCompanyMedia() {
      this.productForm.companyMediaUrl = ''
    },

    // 公司宣传视频封面上传
    async beforeCompanyMediaPosterUpload(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
      const isLt300K = file.size / 1024 < 300

      if (!isImage) {
        this.$message.error('只能上传JPG、PNG或WEBP格式的图片!')
      }
      if (!isLt300K) {
        this.$message.error('上传图片大小不能超过 300KB!')
      }
      return isImage && isLt300K
    },

    async handleCompanyMediaPosterChange(file) {
      if (file.raw) { // 当选择文件后立即上传
        try {
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('type', 'videoPoster')
          const result = await uploadImage(formData)
          this.productForm.companyMediaPoster = result.data.url
          this.$message({ type: 'success', message: '封面上传成功' })
        } catch (error) {
          this.$message.error('封面上传失败: ' + (error.message || '未知错误'))
        }
      }
    },

    // 删除公司宣传视频封面
    removeCompanyMediaPoster() {
      this.productForm.companyMediaPoster = ''
    },

    // 提交表单
    async handleSubmit() {
      // 验证图片数量
      if (this.productImageList.length === 0) {
        this.$message.error('请上传产品主图')
        return
      }

      if (this.productGalleryList.length < 2) {
        this.$message.error('产品图库至少需要2张图片')
        return
      }

      if (this.inspectionReportsList.length < 2) {
        this.$message.error('检验报告至少需要2张')
        return
      }

      if (this.companyQualificationsList.length === 0) {
        this.$message.error('请至少上传1张企业资质')
        return
      }

      // 表单验证
      this.$refs.productForm.validate(async(valid) => {
        if (valid) {
          try {
            this.loading = true

            // 准备提交数据
            const submitData = {
              ...this.productForm,
              productImage: this.productImageList[0].url,
              productGallery: this.productGalleryList.map(img => img.url),
              inspectionReports: this.inspectionReportsList.map(report => report.url),
              companyQualifications: this.companyQualificationsList.map(qual => qual.url)
            }

            if (this.isEdit) {
              // 编辑产品
              await updateProduct(this.productId, submitData)
              this.$message({ type: 'success', message: '编辑成功' })
            } else {
              // 新增产品
              await createProduct(submitData)
              this.$message({ type: 'success', message: '添加成功' })
            }

            this.$router.push('/product/list')
          } catch (error) {
            this.$message.error((this.isEdit ? '编辑' : '添加') + '失败: ' + (error.message || '未知错误'))
            console.error((this.isEdit ? '编辑' : '添加') + '产品失败:', error)
          } finally {
            this.loading = false
          }
        } else {
          return false
        }
      })
    },

    // 取消
    handleCancel() {
      this.$router.push('/product/list')
    }
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-actions {
  margin-top: 20px;
  text-align: center;
}

.video-preview,
.company-media-preview,
.poster-preview {
  border: 1px solid #e4e7ed;
  padding: 10px;
  border-radius: 4px;
  display: inline-block;
}

.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.detail-item {
  margin-bottom: 20px;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;
}

.mini-tabs {
  margin-bottom: 10px;
}

.el-form-item__help {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style>
