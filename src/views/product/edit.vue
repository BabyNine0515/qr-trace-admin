<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item><router-link to="/product/list">商品列表</router-link></el-breadcrumb-item>
        <el-breadcrumb-item>{{ isEdit ? '编辑商品' : '新增商品' }}</el-breadcrumb-item>
      </el-breadcrumb>

      <el-form ref="productForm" :model="productForm" :rules="rules" label-width="120px">
        <!-- 商品基本信息 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>商品基本信息</span>
            </div>
          </template>

          <el-form-item label="所属商户" prop="merchant_id">
            <el-select v-model="productForm.merchant_id" placeholder="请选择商户" style="width: 100%;">
              <el-option
                v-for="merchant in merchantList"
                :key="merchant.id"
                :label="merchant.name"
                :value="merchant.id"
              />
            </el-select>
            <div class="el-form-item__help">必填</div>
          </el-form-item>

          <el-form-item label="商品名称" prop="name">
            <el-input v-model="productForm.name" placeholder="请输入商品名称" maxlength="100" show-word-limit />
            <div class="el-form-item__help">必填，≤100字</div>
          </el-form-item>

          <el-form-item label="商品名称（中文）" prop="name_ch">
            <el-input v-model="productForm.name_ch" placeholder="请输入商品名称（中文）" maxlength="100" show-word-limit />
            <div class="el-form-item__help">必填，≤100字</div>
          </el-form-item>

          <el-form-item label="商品名称（英文）" prop="name_en">
            <el-input v-model="productForm.name_en" placeholder="请输入商品名称（英文）" maxlength="100" show-word-limit />
            <div class="el-form-item__help">必填，≤100字</div>
          </el-form-item>

          <el-form-item label="商品认证" prop="certification">
            <el-input v-model="productForm.certification" placeholder="请输入商品认证" maxlength="200" show-word-limit />
            <div class="el-form-item__help">必填，≤200字</div>
          </el-form-item>

          <el-form-item label="上市时间" prop="release_date">
            <el-date-picker
              v-model="productForm.release_date"
              type="datetime"
              placeholder="选择上市时间"
              style="width: 100%;"
            />
            <div class="el-form-item__help">必填</div>
          </el-form-item>

          <el-form-item label="商品产地" prop="place_of_origin">
            <el-input v-model="productForm.place_of_origin" placeholder="请输入商品产地" maxlength="50" show-word-limit />
            <div class="el-form-item__help">必填，≤50字</div>
          </el-form-item>

          <el-form-item label="配料表" prop="ingredient_list">
            <el-input v-model="productForm.ingredient_list" placeholder="请输入配料表" maxlength="500" show-word-limit />
            <div class="el-form-item__help">必填，≤500字</div>
          </el-form-item>

          <el-form-item label="规格" prop="specifications">
            <el-input v-model="productForm.specifications" placeholder="请输入规格" maxlength="100" show-word-limit />
            <div class="el-form-item__help">必填，≤100字</div>
          </el-form-item>

          <el-form-item label="包装" prop="packaging">
            <el-input v-model="productForm.packaging" placeholder="请输入包装" maxlength="100" show-word-limit />
            <div class="el-form-item__help">必填，≤100字</div>
          </el-form-item>

          <el-form-item label="商品卖点" prop="selling_point">
            <el-input
              v-model="productForm.selling_point"
              placeholder="请输入商品卖点"
              maxlength="500"
              show-word-limit
              type="textarea"
              rows="3"
            />
            <div class="el-form-item__help">必填，≤500字</div>
          </el-form-item>

          <el-form-item label="存储方式" prop="storage_method">
            <el-input v-model="productForm.storage_method" placeholder="请输入存储方式" maxlength="200" show-word-limit />
            <div class="el-form-item__help">必填，≤200字</div>
          </el-form-item>

          <el-form-item label="保质期" prop="shelf_life">
            <el-input v-model="productForm.shelf_life" placeholder="请输入保质期" maxlength="50" show-word-limit />
            <div class="el-form-item__help">必填，≤50字</div>
          </el-form-item>

          <el-form-item label="商品条码" prop="barcode">
            <el-input v-model="productForm.barcode" placeholder="请输入商品条码" maxlength="50" show-word-limit />
            <div class="el-form-item__help">必填，≤50字</div>
          </el-form-item>

          <el-form-item label="品牌" prop="brand">
            <el-input v-model="productForm.brand" placeholder="请输入品牌" maxlength="100" show-word-limit />
            <div class="el-form-item__help">必填，≤100字</div>
          </el-form-item>

          <el-form-item label="使用方法" prop="directions_for_use">
            <el-input
              v-model="productForm.directions_for_use"
              placeholder="请输入使用方法"
              maxlength="500"
              show-word-limit
              type="textarea"
              rows="3"
            />
            <div class="el-form-item__help">必填，≤500字</div>
          </el-form-item>
        </el-card>

        <!-- 商品图片管理 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>商品图片管理</span>
            </div>
          </template>

          <!-- 商品图片 -->
          <el-form-item label="商品图片" prop="goods_images">
            <el-upload
              action="#"
              list-type="picture-card"
              :file-list="goodsImagesList"
              :on-preview="handleImagePreview"
              :on-remove="handleImageRemove"
              :on-change="handleImageChange"
              :limit="8"
              accept="image/jpeg,image/png,image/webp"
              :before-upload="beforeImageUpload"
              :auto-upload="false"
            >
              <i class="el-icon-plus" />
            </el-upload>
            <div class="el-form-item__help">必填，jpg/png/webp格式，≤2MB</div>
          </el-form-item>

          <el-dialog :visible.sync="dialogVisible" append-to-body>
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
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
import { createProduct, updateProduct } from '@/api/product'
import { getMerchantList } from '@/api/company'
import { uploadImage } from '@/api/media'

export default {
  name: 'ProductEdit',
  data() {
    return {
      merchantList: [],
      isEdit: false,
      productId: null,
      productForm: {
        // id: '',
        merchant_id: undefined,
        name: '',
        name_ch: '',
        name_en: '',
        certification: '',
        release_date: '',
        place_of_origin: '',
        ingredient_list: '',
        specifications: '',
        packaging: '',
        selling_point: '',
        storage_method: '',
        shelf_life: '',
        barcode: '',
        brand: '',
        directions_for_use: '',
        goods_images: []
      },
      rules: {
        merchant_id: [
          { required: true, message: '请输入商户ID', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { max: 100, message: '商品名称长度不能超过100个字符', trigger: 'blur' }
        ],
        name_ch: [
          { required: true, message: '请输入商品名称（中文）', trigger: 'blur' },
          { max: 100, message: '商品名称（中文）长度不能超过100个字符', trigger: 'blur' }
        ],
        name_en: [
          { required: true, message: '请输入商品名称（英文）', trigger: 'blur' },
          { max: 100, message: '商品名称（英文）长度不能超过100个字符', trigger: 'blur' }
        ],
        certification: [
          { required: true, message: '请输入商品认证', trigger: 'blur' },
          { max: 200, message: '商品认证长度不能超过200个字符', trigger: 'blur' }
        ],
        release_date: [
          { required: true, message: '请选择上市时间', trigger: 'change' }
        ],
        place_of_origin: [
          { required: true, message: '请输入商品产地', trigger: 'blur' },
          { max: 50, message: '商品产地长度不能超过50个字符', trigger: 'blur' }
        ],
        ingredient_list: [
          { required: true, message: '请输入配料表', trigger: 'blur' },
          { max: 500, message: '配料表长度不能超过500个字符', trigger: 'blur' }
        ],
        specifications: [
          { required: true, message: '请输入规格', trigger: 'blur' },
          { max: 100, message: '规格长度不能超过100个字符', trigger: 'blur' }
        ],
        packaging: [
          { required: true, message: '请输入包装', trigger: 'blur' },
          { max: 100, message: '包装长度不能超过100个字符', trigger: 'blur' }
        ],
        selling_point: [
          { required: true, message: '请输入产品卖点', trigger: 'blur' },
          { max: 500, message: '产品卖点长度不能超过500个字符', trigger: 'blur' }
        ],
        storage_method: [
          { required: true, message: '请输入存储方式', trigger: 'blur' },
          { max: 200, message: '存储方式长度不能超过200个字符', trigger: 'blur' }
        ],
        shelf_life: [
          { required: true, message: '请输入保质期', trigger: 'blur' },
          { max: 50, message: '保质期长度不能超过50个字符', trigger: 'blur' }
        ],
        barcode: [
          { required: true, message: '请输入商品条码', trigger: 'blur' },
          { max: 50, message: '商品条码长度不能超过50个字符', trigger: 'blur' }
        ],
        brand: [
          { required: true, message: '请输入品牌', trigger: 'blur' },
          { max: 100, message: '品牌长度不能超过100个字符', trigger: 'blur' }
        ],
        directions_for_use: [
          { required: true, message: '请输入使用方法', trigger: 'blur' },
          { max: 500, message: '使用方法长度不能超过500个字符', trigger: 'blur' }
        ]
      },
      loading: false,
      goodsImagesList: [],
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

      // 检查是否传递了完整的商品数据
      if (this.$route.query.productData) {
        try {
          // 解析传递的商品数据
          const productData = JSON.parse(this.$route.query.productData)
          // 赋值基本商品信息
          this.productForm = {
            id: productData.id,
            merchant_id: productData.merchant_id,
            name: productData.name,
            name_ch: productData.name_ch,
            name_en: productData.name_en,
            certification: productData.certification,
            release_date: productData.release_date,
            place_of_origin: productData.place_of_origin,
            ingredient_list: productData.ingredient_list,
            specifications: productData.specifications,
            packaging: productData.packaging,
            selling_point: productData.selling_point,
            storage_method: productData.storage_method,
            shelf_life: productData.shelf_life,
            barcode: productData.barcode,
            brand: productData.brand,
            directions_for_use: productData.directions_for_use
          }
          // 处理商品图片
          if (productData.goods_images && Array.isArray(productData.goods_images)) {
            this.goodsImagesList = productData.goods_images.map(item => {
              // 检查item是cid还是完整URL
              let cid, fullUrl
              if (item.startsWith('http')) {
                // 如果是完整URL，提取cid
                fullUrl = item
                cid = item.split('/').pop()
              } else {
                // 如果是cid，构造完整URL
                cid = item
                fullUrl = `https://h5.xiangtaihou-food.com/ipfs/${cid}`
              }
              return {
                name: `商品图片${Math.random().toString(36).substr(2, 9)}`, // 添加name属性，否则上传组件会显示undefined
                url: fullUrl, // 预览使用完整URL
                cid: cid, // 保存cid以便后续使用
                status: 'success', // 设置状态为success，表示已上传
                uid: Date.now() + Math.random().toString(36).substr(2, 9) // 添加唯一标识
              }
            })
          } else {
            // 如果没有商品图片，初始化空数组
            this.goodsImagesList = []
          }
        } catch (error) {
          console.error('解析商品数据失败:', error)
          this.$message.error('加载商品数据失败，请重试')
        }
      }
    }
  },
  mounted() {
    getMerchantList({ merchant_type: 1 }).then(res => {
      this.merchantList = res.data.merchant_record || []
      console.log('商户列表11111111111111111111111:', this.merchantList)
    })
  },
  methods: {
    // 图片预览
    handleImagePreview(file) {
      console.log('111111111111111111', file)
      // 确保使用正确的图片URL格式
      let previewUrl = file.url
      // 如果文件有cid属性，构造完整的IPFS路径
      if (file.cid) {
        previewUrl = `https://h5.xiangtaihou-food.com/ipfs/${file.cid}`
      } else if (file.response && file.response.data && file.response.data.cid) {
        // 处理已上传但可能url属性未更新的情况
        previewUrl = `https://h5.xiangtaihou-food.com/ipfs/${file.response.data.cid}`
      }
      this.dialogImageUrl = previewUrl
      this.dialogVisible = true
    },

    // 图片上传前验证
    async beforeImageUpload(file) {
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

    // 图片上传处理
    async handleImageChange(file, fileList) {
      // 只处理用户新选择的文件（status为ready且有raw文件），防止重复上传
      if (file.raw && file.status === 'ready' && !file.uploading) {
        try {
          // 标记文件正在上传，防止重复上传
          const uploadingFile = Object.assign({}, file, { uploading: true })
          const tempFileList = [...fileList]
          const index = tempFileList.findIndex(f => f.uid === file.uid)
          if (index !== -1) {
            tempFileList[index] = uploadingFile
          }
          this.goodsImagesList = tempFileList

          // 验证图片格式和大小
          const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png' || file.raw.type === 'image/webp'
          const isLt800K = file.raw.size / 1024 < 800

          if (!isImage || !isLt800K) {
            this.$message.error(isImage ? '上传图片大小不能超过 800KB!' : '只能上传JPG、PNG或WEBP格式的图片!')
            // 移除不符合要求的文件
            this.goodsImagesList = fileList.filter(f => f.uid !== file.uid)
            return
          }

          // 创建FormData并上传图片
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('type', 'goodsImage')

          // 调用上传接口
          const response = await uploadImage(formData)

          // 检查响应数据结构
          if (!response) {
            throw new Error('上传请求失败，未获取到响应')
          }
          if (!response.data) {
            throw new Error('上传请求失败，响应数据为空')
          }
          if (!response.data.cid) {
            throw new Error('上传接口返回数据格式不正确，缺少cid字段')
          }
          // 获取上传成功返回的cid
          const cid = response.data.cid

          // 构造完整的预览URL
          const previewUrl = `https://h5.xiangtaihou-food.com/ipfs/${cid}`

          // 更新文件对象，添加cid和预览URL
          const updatedFile = Object.assign({}, file, {
            url: previewUrl, // 使用完整的IPFS URL进行预览
            cid: cid, // 存储cid用于后续表单提交
            status: 'success',
            uploading: false
          })

          // 更新文件列表
          const updatedFileList = [...fileList]
          const updateIndex = updatedFileList.findIndex(f => f.uid === file.uid)
          if (updateIndex !== -1) {
            updatedFileList[updateIndex] = updatedFile
          }

          this.goodsImagesList = updatedFileList
          this.$message.success('图片上传成功')
        } catch (error) {
          console.error('图片上传失败:', error)
          this.$message.error('图片上传失败: ' + (error.message || '未知错误'))
          // 移除上传失败的文件
          this.goodsImagesList = fileList.filter(f => f.uid !== file.uid)
        }
      } else if (file.status !== 'ready') {
        // 更新文件列表（处理删除等操作，但跳过ready状态的文件以避免重复上传）
        this.goodsImagesList = fileList
      }
    },

    // 取消
    handleCancel() {
      this.$router.push('/product/list')
    },

    // 表单提交
    async handleSubmit() {
      this.$refs.productForm.validate(async(valid) => {
        if (valid) {
          try {
            this.loading = true

            // 准备提交数据
            const submitData = { ...this.productForm }

            // 从goodsImagesList中提取所有cid到goods_images数组
            submitData.goods_images = this.goodsImagesList
              .filter(file => file.status === 'success' && file.cid)
              .map(file => file.cid)

            if (this.isEdit) {
              // 编辑模式
              await updateProduct(submitData)
            } else {
              // 新增模式
              await createProduct(submitData)
            }
            // 响应拦截器已经处理了错误，只有成功的响应才会到这里
            // 直接显示成功消息并执行相应操作
            this.$message.success(this.isEdit ? '商品编辑成功' : '商品新增成功')

            if (this.isEdit) {
              // 编辑模式：重定向到商品列表
              this.$router.push('/product/list')
            } else {
              // 新增模式：清空表单，允许继续添加新商品
              this.productForm = {
                merchant_id: undefined,
                name: '',
                name_ch: '',
                name_en: '',
                certification: '',
                release_date: '',
                place_of_origin: '',
                ingredient_list: '',
                specifications: '',
                packaging: '',
                selling_point: '',
                storage_method: '',
                shelf_life: '',
                barcode: '',
                brand: '',
                directions_for_use: '',
                goods_images: []
              }
              // 清空商品图片列表
              this.goodsImagesList = []
              // 重置表单验证
              this.$refs.productForm.resetFields()
            }
          } catch (error) {
            console.error((this.isEdit ? '编辑' : '添加') + '商品失败:', error)
            this.$message.error((this.isEdit ? '编辑' : '添加') + '商品失败: ' + (error.message || '未知错误'))
          } finally {
            this.loading = false
          }
        }
      })
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
