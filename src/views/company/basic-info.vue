<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4" style="margin-bottom: 20px;">
        <el-breadcrumb-item>商户管理</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 顶部操作栏 -->
      <div class="action-bar mb-4">
        <el-button type="primary" @click="openCreateDialog">
          <i class="el-icon-plus" /> 创建商户
        </el-button>
      </div>

      <!-- 商户列表 -->
      <el-table
        v-loading="loading"
        :data="merchantList"
        stripe
        style="width: 100%"
        :default-sort="{ prop: 'created_at', order: 'descending' }"
      >
        <el-table-column prop="name" label="商户名称" min-width="150" />
        <el-table-column prop="company_code" label="统一社会信用代码" width="200" />
        <el-table-column prop="company_legal_person" label="公司法人" width="120" />
        <el-table-column prop="telephone_number" label="联系电话" width="150" />
        <el-table-column prop="merchant_type" label="商户类型" width="120" :formatter="formatMerchantType" />
        <el-table-column prop="general_email" label="通用邮箱" min-width="180" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column prop="updated_at" label="更新时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="openEditDialog(scope.row)">
              <i class="el-icon-edit" /> 修改
            </el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">
              <i class="el-icon-delete" /> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container" style="margin-top: 20px; text-align: right;">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size.sync="pageSize"
          :current-page.sync="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="70%"
      :close-on-click-modal="false"
    >
      <el-form
        ref="companyInfoForm"
        :model="companyInfo"
        :rules="rules"
        label-width="150px"
        class="company-form"
      >
        <!-- 商户名称 -->
        <el-form-item label="商户名称" prop="name">
          <el-input
            v-model="companyInfo.name"
            placeholder="请输入商户名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <!-- 统一社会信用代码 -->
        <el-form-item label="统一社会信用代码" prop="company_code">
          <el-input
            v-model="companyInfo.company_code"
            placeholder="请输入统一社会信用代码"
            maxlength="18"
            show-word-limit
          />
        </el-form-item>

        <!-- 公司法人 -->
        <el-form-item label="公司法人" prop="company_legal_person">
          <el-input
            v-model="companyInfo.company_legal_person"
            placeholder="请输入公司法人姓名"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <!-- 联系电话 -->
        <el-form-item label="联系电话" prop="telephone_number">
          <el-input
            v-model="companyInfo.telephone_number"
            placeholder="请输入联系电话"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <!-- 商户类型 -->
        <el-form-item label="商户类型" prop="merchant_type">
          <el-select
            v-model="companyInfo.merchant_type"
            placeholder="请选择商户类型"
          >
            <el-option label="产品售卖方" value="1" />
            <el-option label="生产方" value="2" />
            <el-option label="原材料提供方" value="3" />
          </el-select>
        </el-form-item>

        <!-- 公司资质 -->
        <el-form-item label="公司资质">
          <el-card shadow="hover" class="mb-4">
            <el-form-item label="营业执照ID" prop="credential.license_id">
              <el-input
                v-model="companyInfo.credential.license_id"
                placeholder="请输入营业执照ID"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="发证日期" prop="credential.issue_date">
              <el-date-picker
                v-model="companyInfo.credential.issue_date"
                type="date"
                placeholder="请选择发证日期"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>

            <!-- 营业执照图片 -->
            <!-- <el-form-item label="营业执照图片" prop="credential.business_license_image">
              <el-upload
                action="#"
                list-type="picture-card"
                :file-list="businessLicenseList"
                :on-preview="handleImagePreview"
                :on-remove="handleBusinessLicenseRemove"
                :on-change="handleBusinessLicenseChange"
                :limit="1"
                accept="image/jpeg,image/png,image/webp"
                :before-upload="beforeImageUpload"
                :auto-upload="false"
              >
                <i class="el-icon-plus" />
              </el-upload>
              <div class="el-form-item__help">jpg/png/webp格式，≤800KB</div>
            </el-form-item> -->

            <!-- 其他认证 -->
            <!-- <el-form-item label="其他认证">
              <el-upload
                action="#"
                list-type="picture-card"
                :file-list="otherCertList"
                :on-preview="handleImagePreview"
                :on-remove="handleOtherCertRemove"
                :on-change="handleOtherCertChange"
                :limit="5"
                accept="image/jpeg,image/png,image/webp"
                :before-upload="beforeImageUpload"
                :auto-upload="false"
              >
                <i class="el-icon-plus" />
              </el-upload>
              <div class="el-form-item__help">jpg/png/webp格式，≤800KB</div>
            </el-form-item> -->
          </el-card>
        </el-form-item>

        <!-- 公司照片 -->
        <el-form-item label="公司照片" prop="company_images">
          <el-upload
            action="#"
            list-type="picture-card"
            :file-list="companyImagesList"
            :on-preview="handleImagePreview"
            :on-remove="handleCompanyImageRemove"
            :on-change="handleCompanyImageChange"
            :limit="8"
            accept="image/jpeg,image/png,image/webp"
            :before-upload="beforeImageUpload"
            :auto-upload="false"
          >
            <i class="el-icon-plus" />
          </el-upload>
          <div class="el-form-item__help">支持上传多张公司照片，jpg/png/webp格式，≤800KB</div>
        </el-form-item>

        <!-- 图片预览弹窗 -->
        <el-dialog :visible.sync="previewDialogVisible" append-to-body>
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>

        <!-- 官网地址 -->
        <el-form-item label="官网地址" prop="company_website">
          <el-input
            v-model="companyInfo.company_website"
            placeholder="请输入官网地址"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <!-- 通用邮箱 -->
        <el-form-item label="通用邮箱" prop="general_email">
          <el-input
            v-model="companyInfo.general_email"
            type="email"
            placeholder="请输入通用邮箱"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <!-- SU邮箱 -->
        <el-form-item label="SU邮箱" prop="su_email">
          <el-input
            v-model="companyInfo.su_email"
            type="email"
            placeholder="请输入SU邮箱"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 导入商户管理API
import { getMerchantList, createMerchant, updateMerchant, deleteMerchant } from '@/api/company'
// 导入图片上传API
import { uploadImage } from '@/api/media'

export default {
  name: 'CompanyBasicInfo',
  data() {
    return {
      // 商户列表数据
      merchantList: [],
      total: 0,
      loading: false,
      currentPage: 1,
      pageSize: 10,

      // 弹窗控制
      dialogVisible: false,
      dialogTitle: '',
      isEditMode: false,

      // 图片预览相关
      previewDialogVisible: false,
      dialogImageUrl: '',

      // 图片列表
      businessLicenseList: [],
      otherCertList: [],
      companyImagesList: [],

      // 商户信息表单
      companyInfo: {
        id: '',
        name: '',
        company_code: '',
        company_legal_person: '',
        telephone_number: '',
        merchant_type: null,
        company_website: '',
        general_email: '',
        su_email: '',
        credential: {
          license_id: '',
          issue_date: '',
          business_license_image: '',
          other_certificates: []
        },
        company_images: []
      },

      // 表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入商户名称', trigger: 'blur' },
          { max: 100, message: '商户名称长度不能超过100个字符', trigger: 'blur' }
        ],
        company_code: [
          { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
          { len: 18, message: '统一社会信用代码长度为18位', trigger: 'blur' }
        ],
        company_legal_person: [
          { required: true, message: '请输入公司法人姓名', trigger: 'blur' },
          { max: 20, message: '公司法人姓名长度不能超过20个字符', trigger: 'blur' }
        ],
        telephone_number: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { max: 20, message: '联系电话长度不能超过20个字符', trigger: 'blur' }
        ],
        merchant_type: [
          { required: true, message: '请选择商户类型', trigger: 'change' }
        ],
        general_email: [
          { required: true, message: '请输入通用邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
          { max: 100, message: '邮箱长度不能超过100个字符', trigger: 'blur' }
        ],
        'credential.license_id': [
          { required: true, message: '请输入营业执照ID', trigger: 'blur' },
          { max: 50, message: '营业执照ID长度不能超过50个字符', trigger: 'blur' }
        ],
        'credential.issue_date': [
          { required: true, message: '请选择发证日期', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchMerchantList()
  },
  methods: {
    // 获取商户列表
    fetchMerchantList() {
      this.loading = true
      const params = {
        page: this.currentPage,
        size: this.pageSize
      }

      getMerchantList(params).then(response => {
        console.log('获取到的商户列表数据1111111111111111:', response)
        // 确保merchantList是数组
        this.merchantList = Array.isArray(response.data.merchant_record) ? response.data.merchant_record : []
        // 使用count字段作为总记录数，如果没有则使用merchant_record的长度
        this.total = response.data.count || response.data.merchant_record?.length || 0
      }).catch(error => {
        console.error('获取商户列表失败:', error)
        this.$message.error('获取商户列表失败，请稍后重试')
      }).finally(() => {
        this.loading = false
      })
    },

    // 格式化商户类型
    formatMerchantType(row, column, cellValue) {
      const typeMap = {
        '1': '产品售卖方',
        '2': '生产方',
        '3': '原材料提供方'
      }
      return typeMap[cellValue] || '未知'
    },

    // 打开创建弹窗
    openCreateDialog() {
      this.isEditMode = false
      this.dialogTitle = '创建商户'
      this.resetForm()
      this.dialogVisible = true
    },

    // 打开编辑弹窗
    openEditDialog(row) {
      this.isEditMode = true
      this.dialogTitle = '修改商户'
      // 深拷贝，避免直接修改表格数据
      this.companyInfo = JSON.parse(JSON.stringify(row))

      // 初始化图片列表
      this.initImageLists()

      this.dialogVisible = true
    },

    // 图片预览
    handleImagePreview(file) {
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
      this.previewDialogVisible = true
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

    // 图片上传处理通用方法
    async handleImageUpload(file, fileList, type) {
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

          // 更新对应的文件列表
          if (type === 'businessLicense') {
            this.businessLicenseList = tempFileList
          } else if (type === 'otherCert') {
            this.otherCertList = tempFileList
          } else if (type === 'companyImage') {
            this.companyImagesList = tempFileList
          }

          // 验证图片格式和大小
          const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png' || file.raw.type === 'image/webp'
          const isLt800K = file.raw.size / 1024 < 800

          if (!isImage || !isLt800K) {
            this.$message.error(isImage ? '上传图片大小不能超过 800KB!' : '只能上传JPG、PNG或WEBP格式的图片!')
            // 移除不符合要求的文件
            if (type === 'businessLicense') {
              this.businessLicenseList = fileList.filter(f => f.uid !== file.uid)
            } else if (type === 'otherCert') {
              this.otherCertList = fileList.filter(f => f.uid !== file.uid)
            } else if (type === 'companyImage') {
              this.companyImagesList = fileList.filter(f => f.uid !== file.uid)
            }
            return
          }

          // 创建FormData并上传图片
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('type', type)

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

          // 更新对应的文件列表
          if (type === 'businessLicense') {
            this.businessLicenseList = updatedFileList
          } else if (type === 'otherCert') {
            this.otherCertList = updatedFileList
          } else if (type === 'companyImage') {
            this.companyImagesList = updatedFileList
          }

          this.$message.success('图片上传成功')
        } catch (error) {
          console.error('图片上传失败:', error)
          this.$message.error('图片上传失败: ' + (error.message || '未知错误'))
          // 移除上传失败的文件
          if (type === 'businessLicense') {
            this.businessLicenseList = fileList.filter(f => f.uid !== file.uid)
          } else if (type === 'otherCert') {
            this.otherCertList = fileList.filter(f => f.uid !== file.uid)
          } else if (type === 'companyImage') {
            this.companyImagesList = fileList.filter(f => f.uid !== file.uid)
          }
        }
      }
    },

    // 营业执照图片上传处理
    handleBusinessLicenseChange(file, fileList) {
      this.handleImageUpload(file, fileList, 'businessLicense')
    },

    // 营业执照图片删除处理
    handleBusinessLicenseRemove(file, fileList) {
      this.businessLicenseList = fileList
    },

    // 其他认证图片上传处理
    handleOtherCertChange(file, fileList) {
      this.handleImageUpload(file, fileList, 'otherCert')
    },

    // 其他认证图片删除处理
    handleOtherCertRemove(file, fileList) {
      this.otherCertList = fileList
    },

    // 公司照片上传处理
    handleCompanyImageChange(file, fileList) {
      this.handleImageUpload(file, fileList, 'companyImage')
    },

    // 公司照片删除处理
    handleCompanyImageRemove(file, fileList) {
      this.companyImagesList = fileList
    },

    // 提交表单
    submitForm() {
      this.$refs.companyInfoForm.validate((valid) => {
        if (valid) {
          // 准备提交数据
          const submitData = { ...this.companyInfo }

          // 确保merchant_type是数字类型
          if (submitData.merchant_type !== null && submitData.merchant_type !== undefined) {
            submitData.merchant_type = Number(submitData.merchant_type)
          }

          // 从文件列表中提取cid并赋值给表单数据
          // 营业执照图片
          const businessLicense = this.businessLicenseList.find(file => file.status === 'success' && file.cid)
          submitData.credential.business_license_image = businessLicense ? businessLicense.cid : ''

          // 其他认证
          submitData.credential.other_certificates = this.otherCertList
            .filter(file => file.status === 'success' && file.cid)
            .map(file => file.cid)

          // 公司照片
          submitData.company_images = this.companyImagesList
            .filter(file => file.status === 'success' && file.cid)
            .map(file => file.cid)

          // 根据编辑模式判断调用哪个API
          const apiPromise = this.isEditMode ? updateMerchant(submitData) : createMerchant(submitData)
          const successMsg = this.isEditMode ? '修改成功' : '创建成功'

          this.$confirm(`确定要${this.isEditMode ? '修改' : '创建'}商户吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            // 调用API提交
            apiPromise.then(response => {
              this.dialogVisible = false
              this.$message({ type: 'success', message: successMsg })
              // 重新获取商户列表
              this.fetchMerchantList()
            }).catch(error => {
              console.error(`${this.isEditMode ? '修改' : '创建'}商户失败:`, error)
              this.$message.error(`${this.isEditMode ? '修改' : '创建'}商户失败，请稍后重试`)
            })
          }).catch(() => {
            // 取消操作
          })
        } else {
          return false
        }
      })
    },

    // 初始化图片列表
    initImageLists() {
      // 初始化营业执照图片列表
      this.businessLicenseList = []
      if (this.companyInfo.credential.business_license_image) {
        const imageUrl = this.companyInfo.credential.business_license_image
        let cid, fullUrl
        if (imageUrl.startsWith('http')) {
          // 如果是完整URL，提取cid
          fullUrl = imageUrl
          cid = imageUrl.split('/').pop()
        } else {
          // 如果是cid，构造完整URL
          cid = imageUrl
          fullUrl = `https://h5.xiangtaihou-food.com/ipfs/${cid}`
        }
        this.businessLicenseList.push({
          name: `营业执照图片`,
          url: fullUrl,
          cid: cid,
          status: 'success',
          uid: Date.now() + Math.random().toString(36).substr(2, 9)
        })
      }

      // 初始化其他认证图片列表
      this.otherCertList = []
      if (this.companyInfo.credential.other_certificates && Array.isArray(this.companyInfo.credential.other_certificates)) {
        this.companyInfo.credential.other_certificates.forEach((imageUrl, index) => {
          let cid, fullUrl
          if (imageUrl.startsWith('http')) {
            fullUrl = imageUrl
            cid = imageUrl.split('/').pop()
          } else {
            cid = imageUrl
            fullUrl = `https://h5.xiangtaihou-food.com/ipfs/${cid}`
          }
          this.otherCertList.push({
            name: `其他认证${index + 1}`,
            url: fullUrl,
            cid: cid,
            status: 'success',
            uid: Date.now() + Math.random().toString(36).substr(2, 9) + index
          })
        })
      }

      // 初始化公司照片列表
      this.companyImagesList = []
      if (this.companyInfo.company_images && Array.isArray(this.companyInfo.company_images)) {
        this.companyInfo.company_images.forEach((imageUrl, index) => {
          let cid, fullUrl
          if (imageUrl.startsWith('http')) {
            fullUrl = imageUrl
            cid = imageUrl.split('/').pop()
          } else {
            cid = imageUrl
            fullUrl = `https://h5.xiangtaihou-food.com/ipfs/${cid}`
          }
          this.companyImagesList.push({
            name: `公司照片${index + 1}`,
            url: fullUrl,
            cid: cid,
            status: 'success',
            uid: Date.now() + Math.random().toString(36).substr(2, 9) + index
          })
        })
      }
    },

    // 重置表单
    resetForm() {
      if (this.$refs.companyInfoForm) {
        this.$refs.companyInfoForm.resetFields()
      }
      this.companyInfo = {
        // id: '',
        name: '',
        company_code: '',
        company_legal_person: '',
        telephone_number: '',
        merchant_type: '',
        company_website: '',
        general_email: '',
        su_email: '',
        credential: {
          license_id: '',
          issue_date: '',
          business_license_image: '',
          other_certificates: []
        },
        company_images: []
      }

      // 重置图片列表
      this.businessLicenseList = []
      this.otherCertList = []
      this.companyImagesList = []
    },

    // 删除商户
    handleDelete(row) {
      this.$confirm(`确定要删除商户"${row.name}"吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }).then(() => {
        deleteMerchant(row.id).then(response => {
          this.$message({ type: 'success', message: '删除成功' })
          // 重新获取商户列表
          this.fetchMerchantList()
        }).catch(error => {
          console.error('删除商户失败:', error)
          this.$message.error('删除商户失败，请稍后重试')
        })
      }).catch(() => {
        // 取消删除
      })
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchMerchantList()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchMerchantList()
    }
  }
}
</script>

<style scoped>
.company-form {
  background-color: #fff;
  padding: 20px;
}

.image-uploader {
  margin-bottom: 10px;
}

.image-uploader .el-upload--picture-card {
  width: 100px;
  height: 100px;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

.action-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

/* 弹窗表单样式 */
.el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
}

/* 表格操作按钮间距 */
.el-button + .el-button {
  margin-left: 8px;
}
</style>
