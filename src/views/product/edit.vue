<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item><router-link to="/product/list">产品列表</router-link></el-breadcrumb-item>
        <el-breadcrumb-item>{{ isEdit ? '编辑产品' : '新增产品' }}</el-breadcrumb-item>
      </el-breadcrumb>

      <el-form ref="productForm" :model="productForm" :rules="rules" label-width="120px">
        <!-- 基本信息 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>产品基本信息</span>
            </div>
          </template>

          <el-form-item label="产品名称" prop="name">
            <el-input v-model="productForm.name" placeholder="请输入产品名称" />
          </el-form-item>

          <el-form-item label="产品批次" prop="batch">
            <el-input v-model="productForm.batch" placeholder="请输入产品批次" />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="生产日期" prop="productionDate">
                <el-date-picker
                  v-model="productForm.productionDate"
                  type="date"
                  placeholder="选择生产日期"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="上市日期" prop="launchDate">
                <el-date-picker
                  v-model="productForm.launchDate"
                  type="date"
                  placeholder="选择上市日期"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="产品分类" prop="category">
                <el-select v-model="productForm.category" placeholder="请选择产品分类">
                  <el-option label="肉类" value="meat" />
                  <el-option label="蔬菜类" value="vegetable" />
                  <el-option label="水果类" value="fruit" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="品牌" prop="brand">
                <el-input v-model="productForm.brand" placeholder="请输入品牌名称" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="产地" prop="origin">
                <el-input v-model="productForm.origin" placeholder="请输入产地信息" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="认证类型">
                <el-checkbox-group v-model="productForm.certifications">
                  <el-checkbox label="有机认证">有机认证</el-checkbox>
                  <el-checkbox label="绿色认证">绿色认证</el-checkbox>
                  <el-checkbox label="地理标志">地理标志</el-checkbox>
                  <el-checkbox label="无公害认证">无公害认证</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="地标标识">
            <el-switch v-model="productForm.hasGeographicMark" />
          </el-form-item>

          <el-form-item label="食用方法" prop="usageMethod">
            <el-input
              v-model="productForm.usageMethod"
              type="textarea"
              :rows="4"
              placeholder="请输入食用方法说明"
            />
          </el-form-item>

          <el-form-item label="产品描述" prop="description">
            <el-input
              v-model="productForm.description"
              type="textarea"
              :rows="6"
              placeholder="请输入产品详细描述"
            />
          </el-form-item>
        </el-card>

        <!-- 产品图片管理 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>产品图片管理</span>
            </div>
          </template>

          <el-upload
            action="#"
            list-type="picture-card"
            :file-list="imageList"
            :on-preview="handleImagePreview"
            :on-remove="handleImageRemove"
            :on-change="handleImageChange"
            :limit="8"
            accept="image/*"
          >
            <i class="el-icon-plus" />
          </el-upload>

          <el-dialog :visible.sync="dialogVisible" append-to-body>
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>

          <div v-if="imageList.length > 1" class="mt-4">
            <el-button type="primary" size="small" @click="sortImages">排序图片</el-button>
            <span class="ml-2 text-muted">拖动图片调整顺序</span>
          </div>
        </el-card>

        <!-- 产品视频管理 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>产品视频管理</span>
            </div>
          </template>

          <div v-if="videoUrl" class="video-preview mb-4">
            <video :src="videoUrl" controls style="max-width: 100%;" />
            <el-button type="danger" size="small" class="mt-2" @click="removeVideo">删除视频</el-button>
          </div>

          <el-upload
            action="#"
            :before-upload="beforeVideoUpload"
            :on-success="handleVideoSuccess"
            accept="video/*"
            :limit="1"
            :on-exceed="handleVideoExceed"
          >
            <el-button size="small" type="primary">上传视频</el-button>
            <div slot="tip" class="el-upload__tip">
              请上传MP4、AVI格式的视频文件，大小不超过100MB
            </div>
          </el-upload>
        </el-card>

        <!-- 关联信息 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>关联信息</span>
            </div>
          </template>

          <el-form-item label="关联检验报告" prop="reportIds">
            <el-select
              v-model="productForm.reportIds"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="请选择或输入检验报告"
            >
              <el-option
                v-for="report in reportList"
                :key="report.id"
                :label="report.name"
                :value="report.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="关联生产厂家" prop="manufacturerId">
            <el-select v-model="productForm.manufacturerId" placeholder="请选择生产厂家">
              <el-option
                v-for="manufacturer in manufacturerList"
                :key="manufacturer.id"
                :label="manufacturer.name"
                :value="manufacturer.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="关联上游生产信息" prop="upstreamInfoId">
            <el-select v-model="productForm.upstreamInfoId" placeholder="请选择上游生产信息">
              <el-option
                v-for="info in upstreamInfoList"
                :key="info.id"
                :label="info.name"
                :value="info.id"
              />
            </el-select>
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
import { getProductById, createProduct, updateProduct } from '@/api/product'
import { uploadImage, uploadVideo } from '@/api/media'

export default {
  name: 'ProductEdit',
  data() {
    return {
      isEdit: false,
      productId: null,
      productForm: {
        name: '',
        batch: '',
        productionDate: '',
        launchDate: '',
        category: '',
        brand: '',
        origin: '',
        certifications: [],
        hasGeographicMark: false,
        usageMethod: '',
        description: '',
        reportIds: [],
        manufacturerId: '',
        upstreamInfoId: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入产品名称', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        batch: [
          { required: true, message: '请输入产品批次', trigger: 'blur' }
        ],
        productionDate: [
          { required: true, message: '请选择生产日期', trigger: 'change' }
        ],
        category: [
          { required: true, message: '请选择产品分类', trigger: 'change' }
        ]
      },
      loading: false,
      loading: false,
      loading: false,
      loading: false,
      imageList: [],
      videoUrl: '',
      dialogVisible: false,
      dialogImageUrl: '',
      reportList: [
        { id: 1, name: '牛肉质检报告20251101' },
        { id: 2, name: '蔬菜农药残留检测报告' },
        { id: 3, name: '水果质量检测报告' }
      ],
      manufacturerList: [
        { id: 1, name: '安徽八公山食品有限公司' },
        { id: 2, name: '绿色生态农场' },
        { id: 3, name: '有机水果种植基地' }
      ],
      upstreamInfoList: [
        { id: 1, name: '优质牛肉供应链' },
        { id: 2, name: '绿色蔬菜种植基地' },
        { id: 3, name: '有机水果种植过程' }
      ]
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
    // 加载产品数据
    async loadProductData() {
      try {
        this.loading = true
        const response = await getProductById(this.productId)
        const { data } = response

        this.productForm = {
          name: data.name,
          batch: data.batch,
          productionDate: data.productionDate,
          launchDate: data.launchDate,
          category: data.category,
          brand: data.brand,
          origin: data.origin,
          certifications: data.certifications || [],
          hasGeographicMark: data.hasGeographicMark || false,
          usageMethod: data.usageMethod,
          description: data.description,
          reportIds: data.reportIds || [],
          manufacturerId: data.manufacturerId,
          upstreamInfoId: data.upstreamInfoId
        }

        // 加载产品图片
        this.imageList = data.images || []

        // 加载产品视频
        this.videoUrl = data.videoUrl || ''
      } catch (error) {
        this.$message.error('加载产品数据失败: ' + (error.message || '未知错误'))
        console.error('加载产品数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 图片预览
    handleImagePreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },

    // 删除图片
    handleImageRemove(file, fileList) {
      this.imageList = fileList
    },

    // 图片变化
    async handleImageChange(file, fileList) {
      if (file.status === 'success') {
        // 这里应该根据实际上传组件的行为进行调整
        // 假设上传组件已经处理了上传，我们只需要更新列表
        this.imageList = fileList
      }
    },

    // 上传图片
    async beforeAvatarUpload(file) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const response = await uploadImage(formData)
        return response.data.url
      } catch (error) {
        this.$message.error('图片上传失败: ' + (error.message || '未知错误'))
        return false
      }
    },

    // 排序图片
    sortImages() {
      this.$message({ type: 'info', message: '拖拽排序功能开发中...' })
    },

    // 视频上传前
    beforeVideoUpload(file) {
      const isVideo = file.type.includes('video/')
      const isLt100M = file.size / 1024 / 1024 < 100

      if (!isVideo) {
        this.$message.error('只能上传视频文件!')
      }
      if (!isLt100M) {
        this.$message.error('上传视频大小不能超过 100MB!')
      }
      return isVideo && isLt100M
    },

    // 视频上传成功
    async handleVideoSuccess(response, file) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'video')
        const result = await uploadVideo(formData)
        this.videoUrl = result.data.url
        this.$message({ type: 'success', message: '视频上传成功' })
      } catch (error) {
        this.$message.error('视频上传失败: ' + (error.message || '未知错误'))
      }
    },

    // 视频上传超过数量限制
    handleVideoExceed(files, fileList) {
      this.$message.warning(`当前限制上传 1 个视频`)
    },

    // 删除视频
    removeVideo() {
      this.videoUrl = ''
    },

    // 提交表单
    async handleSubmit() {
      this.$refs.productForm.validate(async(valid) => {
        if (valid) {
          try {
            this.loading = true

            // 准备提交数据
            const submitData = {
              ...this.productForm,
              images: this.imageList.map(img => img.url),
              videoUrl: this.videoUrl
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

.video-preview {
  border: 1px solid #e4e7ed;
  padding: 10px;
  border-radius: 4px;
  display: inline-block;
}
</style>
