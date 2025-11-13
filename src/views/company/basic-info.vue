<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item>公司信息管理</el-breadcrumb-item>
        <el-breadcrumb-item>公司基本信息</el-breadcrumb-item>
      </el-breadcrumb>

      <el-alert
        v-if="isEdited"
        title="信息已修改，请点击保存按钮保存更改"
        type="warning"
        show-icon
        :closable="false"
      />

      <el-form
        ref="companyInfoForm"
        :model="companyInfo"
        :rules="rules"
        label-width="120px"
        class="company-form"
      >
        <!-- 公司logo -->
        <el-form-item label="公司Logo">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeLogoUpload"
            :on-success="handleLogoUploadSuccess"
            :auto-upload="true"
          >
            <img v-if="companyInfo.logoUrl" :src="companyInfo.logoUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
          <div class="form-tip">建议上传尺寸为200x200像素的图片</div>
        </el-form-item>

        <!-- 公司名称 -->
        <el-form-item label="公司名称" prop="companyName">
          <el-input
            v-model="companyInfo.companyName"
            placeholder="请输入公司名称"
            maxlength="100"
            show-word-limit
            @input="handleInputChange"
          />
        </el-form-item>

        <!-- 公司简称 -->
        <el-form-item label="公司简称" prop="shortName">
          <el-input
            v-model="companyInfo.shortName"
            placeholder="请输入公司简称"
            maxlength="50"
            show-word-limit
            @input="handleInputChange"
          />
        </el-form-item>

        <!-- 统一社会信用代码 -->
        <el-form-item label="统一社会信用代码" prop="creditCode">
          <el-input
            v-model="companyInfo.creditCode"
            placeholder="请输入统一社会信用代码"
            maxlength="18"
            show-word-limit
            @input="handleInputChange"
          />
        </el-form-item>

        <!-- 公司类型 -->
        <el-form-item label="公司类型" prop="companyType">
          <el-select
            v-model="companyInfo.companyType"
            placeholder="请选择公司类型"
            @change="handleInputChange"
          >
            <el-option label="有限责任公司" value="limited_liability" />
            <el-option label="股份有限公司" value="joint_stock" />
            <el-option label="合伙企业" value="partnership" />
            <el-option label="个人独资企业" value="sole_proprietorship" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <!-- 法定代表人 -->
        <el-form-item label="法定代表人" prop="legalPerson">
          <el-input
            v-model="companyInfo.legalPerson"
            placeholder="请输入法定代表人姓名"
            maxlength="20"
            show-word-limit
            @input="handleInputChange"
          />
        </el-form-item>

        <!-- 成立时间 -->
        <el-form-item label="成立时间" prop="establishDate">
          <el-date-picker
            v-model="companyInfo.establishDate"
            type="date"
            placeholder="请选择成立日期"
            value-format="yyyy-MM-dd"
            @change="handleInputChange"
          />
        </el-form-item>

        <!-- 注册资本 -->
        <el-form-item label="注册资本" prop="registeredCapital">
          <el-input
            v-model.number="companyInfo.registeredCapital"
            type="number"
            placeholder="请输入注册资本"
            :min="0"
            @input="handleInputChange"
          >
            <template slot="append">万元</template>
          </el-input>
        </el-form-item>

        <!-- 公司地址 -->
        <el-form-item label="公司地址" prop="address">
          <el-cascader
            v-model="companyInfo.addressCascader"
            :options="regionOptions"
            placeholder="请选择省/市/区"
            style="width: 100%; margin-bottom: 10px;"
            @change="handleAddressChange"
          />
          <el-input
            v-model="companyInfo.addressDetail"
            placeholder="请输入详细地址"
            maxlength="200"
            show-word-limit
            @input="handleInputChange"
          />
        </el-form-item>

        <!-- 联系电话 -->
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input
            v-model="companyInfo.contactPhone"
            placeholder="请输入联系电话"
            maxlength="20"
            show-word-limit
            @input="handleInputChange"
          />
        </el-form-item>

        <!-- 电子邮箱 -->
        <el-form-item label="电子邮箱" prop="email">
          <el-input
            v-model="companyInfo.email"
            type="email"
            placeholder="请输入电子邮箱"
            maxlength="100"
            show-word-limit
            @input="handleInputChange"
          />
        </el-form-item>

        <!-- 官网地址 -->
        <el-form-item label="官网地址" prop="website">
          <el-input
            v-model="companyInfo.website"
            placeholder="请输入官网地址"
            maxlength="100"
            show-word-limit
            @input="handleInputChange"
          />
        </el-form-item>

        <!-- 公司简介 -->
        <el-form-item label="公司简介" prop="description">
          <el-input
            v-model="companyInfo.description"
            type="textarea"
            placeholder="请输入公司简介"
            :rows="5"
            maxlength="1000"
            show-word-limit
            @input="handleInputChange"
          />
        </el-form-item>

        <!-- 经营范围 -->
        <el-form-item label="经营范围" prop="businessScope">
          <el-input
            v-model="companyInfo.businessScope"
            type="textarea"
            placeholder="请输入经营范围"
            :rows="4"
            maxlength="500"
            show-word-limit
            @input="handleInputChange"
          />
        </el-form-item>

        <!-- 公司文化 -->
        <el-form-item label="公司文化" prop="companyCulture">
          <el-input
            v-model="companyInfo.companyCulture"
            type="textarea"
            placeholder="请输入公司文化"
            :rows="4"
            maxlength="500"
            show-word-limit
            @input="handleInputChange"
          />
        </el-form-item>

        <!-- 企业愿景 -->
        <el-form-item label="企业愿景" prop="vision">
          <el-input
            v-model="companyInfo.vision"
            type="textarea"
            placeholder="请输入企业愿景"
            :rows="3"
            maxlength="300"
            show-word-limit
            @input="handleInputChange"
          />
        </el-form-item>

        <!-- 企业使命 -->
        <el-form-item label="企业使命" prop="mission">
          <el-input
            v-model="companyInfo.mission"
            type="textarea"
            placeholder="请输入企业使命"
            :rows="3"
            maxlength="300"
            show-word-limit
            @input="handleInputChange"
          />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="cancelEdit">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CompanyBasicInfo',
  data() {
    return {
      isEdited: false,
      originalInfo: {},
      companyInfo: {
        logoUrl: 'https://via.placeholder.com/200x200?text=Company+Logo',
        companyName: '',
        shortName: '',
        creditCode: '',
        companyType: '',
        legalPerson: '',
        establishDate: '',
        registeredCapital: null,
        addressCascader: [],
        addressProvince: '',
        addressCity: '',
        addressDistrict: '',
        addressDetail: '',
        contactPhone: '',
        email: '',
        website: '',
        description: '',
        businessScope: '',
        companyCulture: '',
        vision: '',
        mission: ''
      },
      rules: {
        companyName: [
          { required: true, message: '请输入公司名称', trigger: 'blur' }
        ],
        creditCode: [
          { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
          { len: 18, message: '统一社会信用代码长度为18位', trigger: 'blur' }
        ],
        legalPerson: [
          { required: true, message: '请输入法定代表人姓名', trigger: 'blur' }
        ],
        establishDate: [
          { required: true, message: '请选择成立时间', trigger: 'change' }
        ],
        registeredCapital: [
          { required: true, message: '请输入注册资本', trigger: 'blur' },
          { type: 'number', min: 0, message: '注册资本不能为负数', trigger: 'blur' }
        ],
        addressProvince: [
          { required: true, message: '请选择省份', trigger: 'change' }
        ],
        addressCity: [
          { required: true, message: '请选择城市', trigger: 'change' }
        ],
        addressDistrict: [
          { required: true, message: '请选择区县', trigger: 'change' }
        ],
        addressDetail: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ],
        contactPhone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入电子邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入公司简介', trigger: 'blur' }
        ]
      },
      // 模拟地区数据
      regionOptions: [
        {
          value: 'beijing',
          label: '北京',
          children: [
            {
              value: 'beijing',
              label: '北京',
              children: [
                { value: 'chaoyang', label: '朝阳区' },
                { value: 'haidian', label: '海淀区' },
                { value: 'dongcheng', label: '东城区' },
                { value: 'xicheng', label: '西城区' }
              ]
            }
          ]
        },
        {
          value: 'shanghai',
          label: '上海',
          children: [
            {
              value: 'shanghai',
              label: '上海',
              children: [
                { value: 'pudong', label: '浦东新区' },
                { value: 'huangpu', label: '黄浦区' },
                { value: 'jingan', label: '静安区' }
              ]
            }
          ]
        }
      ]
    }
  },
  created() {
    this.fetchCompanyInfo()
  },
  methods: {
    // 获取公司信息
    fetchCompanyInfo() {
      // 模拟从API获取数据
      // 这里使用模拟数据
      const mockData = {
        logoUrl: 'https://via.placeholder.com/200x200?text=Company+Logo',
        companyName: '湖南香泰供应链管理有限公司',
        shortName: '香泰供应链',
        creditCode: '91430100MA4Q2XXX12',
        companyType: 'limited_liability',
        legalPerson: '张先生',
        establishDate: '2018-06-15',
        registeredCapital: 500,
        addressProvince: 'beijing',
        addressCity: 'beijing',
        addressDistrict: 'chaoyang',
        addressDetail: '朝阳区建国路88号现代国际大厦A座22层',
        contactPhone: '13800138000',
        email: 'info@xiangtai.com',
        website: 'www.xiangtai.com',
        description: '湖南香泰供应链管理有限公司是一家专注于农产品供应链管理的现代化企业，公司成立于2018年，总部位于湖南省长沙市。我们致力于为客户提供从源头到餐桌的全链条农产品供应链解决方案，包括种植管理、仓储物流、质检追溯等环节。',
        businessScope: '供应链管理服务；农产品批发；农产品零售；食品销售；仓储服务；普通货物运输；冷链运输；物流信息咨询服务。',
        companyCulture: '诚信、创新、协作、共赢',
        vision: '成为中国领先的农产品供应链管理服务商',
        mission: '为客户提供安全、优质、高效的农产品供应链服务，促进农业现代化发展'
      }

      this.companyInfo = { ...mockData }
      // 设置级联选择器的值
      this.companyInfo.addressCascader = [mockData.addressProvince, mockData.addressCity, mockData.addressDistrict]
      // 保存原始数据，用于重置
      this.originalInfo = JSON.parse(JSON.stringify(this.companyInfo))
    },

    // Logo上传前检查
    beforeLogoUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },

    // Logo上传成功处理
    handleLogoUploadSuccess(response, file, fileList) {
      // 模拟上传成功，实际应该使用上传返回的URL
      this.companyInfo.logoUrl = URL.createObjectURL(file.raw)
      this.isEdited = true
    },

    // 处理输入变化
    handleInputChange() {
      this.isEdited = true
    },

    // 处理地址级联变化
    handleAddressChange(value) {
      if (value && value.length === 3) {
        this.companyInfo.addressProvince = value[0]
        this.companyInfo.addressCity = value[1]
        this.companyInfo.addressDistrict = value[2]
        this.isEdited = true
      }
    },

    // 提交表单
    submitForm() {
      this.$refs.companyInfoForm.validate((valid) => {
        if (valid) {
          // 模拟API提交
          this.$confirm('确定要保存公司信息吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            // 模拟保存成功
            setTimeout(() => {
              this.isEdited = false
              // 更新原始数据
              this.originalInfo = JSON.parse(JSON.stringify(this.companyInfo))
              this.$message({ type: 'success', message: '保存成功' })
            }, 1000)
          }).catch(() => {
            // 取消保存
          })
        } else {
          return false
        }
      })
    },

    // 重置表单
    resetForm() {
      if (this.$refs.companyInfoForm) {
        this.$refs.companyInfoForm.resetFields()
      }
      this.companyInfo = JSON.parse(JSON.stringify(this.originalInfo))
      this.isEdited = false
    },

    // 取消编辑
    cancelEdit() {
      if (this.isEdited) {
        this.$confirm('有未保存的修改，确定要取消吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.resetForm()
        }).catch(() => {
          // 继续编辑
        })
      } else {
        // 无修改，直接返回列表或保持当前状态
        this.$message({ type: 'info', message: '无修改' })
      }
    }
  }
}
</script>

<style scoped>
.company-form {
  background-color: #fff;
  padding: 20px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 200px;
  line-height: 200px;
  text-align: center;
}

.avatar {
  width: 200px;
  height: 200px;
  display: block;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style>
