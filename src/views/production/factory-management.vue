<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item>生产信息管理</el-breadcrumb-item>
        <el-breadcrumb-item>生产厂家管理</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 操作按钮 -->
      <div class="operation-bar mb-4">
        <el-button type="primary" @click="addFactory">添加生产厂家</el-button>
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="batchDelete">
          批量删除 ({{ selectedRows.length }})
        </el-button>
      </div>

      <!-- 搜索和筛选 -->
      <el-form :inline="true" class="search-form mb-4">
        <el-form-item label="厂家名称">
          <el-input v-model="searchParams.name" placeholder="请输入厂家名称" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="所在地区">
          <el-select v-model="searchParams.region" placeholder="请选择地区">
            <el-option label="全部" value="" />
            <el-option label="湖南省" value="湖南" />
            <el-option label="广东省" value="广东" />
            <el-option label="浙江省" value="浙江" />
            <el-option label="江苏省" value="江苏" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="认证状态">
          <el-select v-model="searchParams.certificationStatus" placeholder="全部">
            <el-option label="全部" value="" />
            <el-option label="已认证" value="certified" />
            <el-option label="待认证" value="pending" />
            <el-option label="未认证" value="uncertified" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="paginatedFactoryList"
        style="width: 100%"
        row-key="id"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="name" label="厂家名称" min-width="200" />
        <el-table-column prop="contactPerson" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="150" />
        <el-table-column prop="address" label="详细地址" min-width="250" />
        <el-table-column prop="scale" label="生产规模" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getScaleTagType(scope.row.scale)">
              {{ getScaleName(scope.row.scale) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="certificationStatus" label="认证状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.certificationStatus)">
              {{ getStatusName(scope.row.certificationStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="productCount" label="关联产品数" width="120" align="center" />
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewFactory(scope.row)">查看详情</el-button>
            <el-button size="mini" type="primary" @click="editFactory(scope.row)">编辑</el-button>
            <el-button
              size="mini"
              :type="scope.row.isActive ? 'warning' : 'success'"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.isActive ? '禁用' : '启用' }}
            </el-button>
            <el-button size="mini" type="danger" @click="deleteFactory(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :total="filteredFactoryList.length"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :current-page="currentPage"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑厂家对话框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="isEditing ? '编辑生产厂家' : '添加生产厂家'"
      :width="'800px'"
    >
      <el-form
        ref="factoryForm"
        :model="factoryForm"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="厂家名称" prop="name">
          <el-input v-model="factoryForm.name" placeholder="请输入厂家名称" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="factoryForm.contactPerson" placeholder="请输入联系人姓名" maxlength="50" />
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input
            v-model="factoryForm.contactPhone"
            placeholder="请输入联系电话"
            maxlength="20"
            pattern="^[0-9-]{6,20}$"
          />
        </el-form-item>

        <el-form-item label="所在地区">
          <el-select v-model="factoryForm.region" placeholder="请选择所在地区">
            <el-option label="湖南省" value="湖南" />
            <el-option label="广东省" value="广东" />
            <el-option label="浙江省" value="浙江" />
            <el-option label="江苏省" value="江苏" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="详细地址" prop="address">
          <el-input
            v-model="factoryForm.address"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="生产规模" prop="scale">
          <el-radio-group v-model="factoryForm.scale">
            <el-radio label="small">小型</el-radio>
            <el-radio label="medium">中型</el-radio>
            <el-radio label="large">大型</el-radio>
            <el-radio label="enterprise">企业级</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="认证状态" prop="certificationStatus">
          <el-select v-model="factoryForm.certificationStatus" placeholder="请选择认证状态">
            <el-option label="已认证" value="certified" />
            <el-option label="待认证" value="pending" />
            <el-option label="未认证" value="uncertified" />
          </el-select>
        </el-form-item>

        <el-form-item label="认证编号">
          <el-input v-model="factoryForm.certificationNumber" placeholder="请输入认证编号" maxlength="100" />
        </el-form-item>

        <el-form-item label="生产环境描述" prop="environmentDesc">
          <el-input
            v-model="factoryForm.environmentDesc"
            type="textarea"
            :rows="4"
            placeholder="请描述生产环境、设施设备等信息"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="资质图片">
          <el-upload
            class="image-uploader"
            action="#"
            :on-success="handleImageUploadSuccess"
            :before-upload="beforeImageUpload"
            :file-list="tempImageFiles"
            :multiple="true"
            :auto-upload="false"
            list-type="picture-card"
            :limit="5"
            :on-exceed="handleExceed"
          >
            <i class="el-icon-plus" />
            <div class="el-upload__text">点击上传或拖拽图片到此处</div>
            <div slot="tip" class="el-upload__tip">
              支持jpg、jpeg、png、gif格式，单个文件不超过10MB，最多上传5张图片
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch v-model="factoryForm.isActive" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFactory">保存</el-button>
      </div>
    </el-dialog>

    <!-- 查看厂家详情对话框 -->
    <el-dialog
      :visible.sync="viewDialogVisible"
      title="厂家详情"
      :width="'900px'"
    >
      <div class="factory-detail">
        <!-- 基本信息 -->
        <el-descriptions border :column="3" class="mb-4">
          <el-descriptions-item label="厂家名称">{{ viewingFactory.name }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ viewingFactory.contactPerson || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ viewingFactory.contactPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="所在地区">{{ viewingFactory.region || '-' }}</el-descriptions-item>
          <el-descriptions-item label="生产规模">
            <el-tag :type="getScaleTagType(viewingFactory.scale)">
              {{ getScaleName(viewingFactory.scale) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="认证状态">
            <el-tag :type="getStatusTagType(viewingFactory.certificationStatus)">
              {{ getStatusName(viewingFactory.certificationStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="认证编号">{{ viewingFactory.certificationNumber || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ viewingFactory.createdTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ viewingFactory.updatedTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="详细地址" :span="3">{{ viewingFactory.address || '-' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 生产环境描述 -->
        <el-card shadow="never" class="mb-4">
          <template slot="header">
            <div class="card-header">
              <span>生产环境描述</span>
            </div>
          </template>
          <div class="environment-desc">
            {{ viewingFactory.environmentDesc || '暂无描述' }}
          </div>
        </el-card>

        <!-- 资质图片 -->
        <el-card v-if="viewingFactory.qualificationImages && viewingFactory.qualificationImages.length > 0" shadow="never">
          <template slot="header">
            <div class="card-header">
              <span>资质图片</span>
            </div>
          </template>
          <div class="image-grid">
            <div
              v-for="(item, index) in viewingFactory.qualificationImages"
              :key="index"
              class="image-item"
              @click="previewImage(item)"
            >
              <el-image :src="item.url" fit="cover" class="image-preview" />
            </div>
          </div>
        </el-card>

        <!-- 关联产品 -->
        <el-card v-if="viewingFactory.relatedProducts && viewingFactory.relatedProducts.length > 0" shadow="never">
          <template slot="header">
            <div class="card-header">
              <span>关联产品 ({{ viewingFactory.relatedProducts.length }})</span>
            </div>
          </template>
          <el-table :data="viewingFactory.relatedProducts" style="width: 100%">
            <el-table-column prop="name" label="产品名称" min-width="200" />
            <el-table-column prop="batch" label="产品批次" width="150" />
            <el-table-column prop="productionDate" label="生产日期" width="150" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                  {{ scope.row.status === 'active' ? '在售' : '下架' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 图片预览对话框 -->
    <el-dialog
      :visible.sync="previewDialogVisible"
      title="预览图片"
      width="800px"
    >
      <div class="preview-container">
        <el-image :src="previewImageUrl" fit="contain" style="width: 100%; height: 500px;" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'FactoryManagement',
  data() {
    return {
      // 厂家列表
      factoryList: [],
      // 选中的行
      selectedRows: [],
      // 搜索参数
      searchParams: {
        name: '',
        region: '',
        certificationStatus: ''
      },
      // 分页参数
      currentPage: 1,
      pageSize: 10,
      // 加载状态
      loading: false,
      // 对话框状态
      dialogVisible: false,
      isEditing: false,
      // 表单数据
      factoryForm: {
        id: '',
        name: '',
        contactPerson: '',
        contactPhone: '',
        region: '',
        address: '',
        scale: 'medium',
        certificationStatus: 'pending',
        certificationNumber: '',
        environmentDesc: '',
        isActive: true
      },
      // 表单验证规则
      formRules: {
        name: [
          { required: true, message: '请输入厂家名称', trigger: 'blur' }
        ],
        contactPerson: [
          { required: true, message: '请输入联系人姓名', trigger: 'blur' }
        ],
        contactPhone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^[0-9-]{6,20}$/, message: '请输入有效的联系电话', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ],
        scale: [
          { required: true, message: '请选择生产规模', trigger: 'change' }
        ],
        certificationStatus: [
          { required: true, message: '请选择认证状态', trigger: 'change' }
        ],
        environmentDesc: [
          { required: true, message: '请描述生产环境', trigger: 'blur' }
        ]
      },
      // 临时图片文件
      tempImageFiles: [],
      // 查看对话框数据
      viewDialogVisible: false,
      viewingFactory: {},
      // 预览对话框数据
      previewDialogVisible: false,
      previewImageUrl: ''
    }
  },
  computed: {
    // 过滤后的厂家列表
    filteredFactoryList() {
      let result = [...this.factoryList]

      // 按名称搜索
      if (this.searchParams.name) {
        const keyword = this.searchParams.name.toLowerCase()
        result = result.filter(item => item.name.toLowerCase().includes(keyword))
      }

      // 按地区过滤
      if (this.searchParams.region) {
        result = result.filter(item => item.region === this.searchParams.region)
      }

      // 按认证状态过滤
      if (this.searchParams.certificationStatus) {
        result = result.filter(item => item.certificationStatus === this.searchParams.certificationStatus)
      }

      // 按创建时间倒序排列
      result.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))

      return result
    },

    // 分页后的厂家列表
    paginatedFactoryList() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredFactoryList.slice(start, end)
    }
  },
  created() {
    this.fetchFactoryList()
  },
  methods: {
    // 获取厂家列表
    fetchFactoryList() {
      this.loading = true
      // 模拟API请求
      setTimeout(() => {
        this.factoryList = [
          {
            id: '1',
            name: '湖南香泰食品加工厂',
            contactPerson: '李经理',
            contactPhone: '13800138001',
            region: '湖南',
            address: '湖南省长沙市望城区食品工业园A区8号',
            scale: 'large',
            certificationStatus: 'certified',
            certificationNumber: 'SC12443011200123',
            environmentDesc: '本厂拥有现代化生产车间5000平方米，配备先进的食品加工设备，严格按照ISO22000食品安全管理体系标准进行生产管理。车间采用全封闭设计，配备空气净化系统，确保生产环境符合食品卫生要求。',
            qualificationImages: [
              {
                id: 'img1',
                url: 'https://via.placeholder.com/800x600?text=Factory+License'
              },
              {
                id: 'img2',
                url: 'https://via.placeholder.com/800x600?text=Production+Workshop'
              }
            ],
            relatedProducts: [
              { id: '101', name: '香泰优质大米', batch: 'XT20230601', productionDate: '2023-06-01', status: 'active' },
              { id: '102', name: '香泰生态米', batch: 'XT20230602', productionDate: '2023-06-02', status: 'active' }
            ],
            productCount: 2,
            isActive: true,
            createdTime: '2023-05-01 10:30:00',
            updatedTime: '2023-06-10 14:20:00'
          },
          {
            id: '2',
            name: '湖南绿色农产品生产基地',
            contactPerson: '张主任',
            contactPhone: '13900139002',
            region: '湖南',
            address: '湖南省岳阳市君山区现代农业示范园',
            scale: 'enterprise',
            certificationStatus: 'certified',
            certificationNumber: 'SC12443060200456',
            environmentDesc: '基地占地5000亩，采用有机种植方式，配套现代化灌溉系统和病虫害防治系统。拥有标准化农产品加工车间3000平方米，冷藏仓储2000平方米，严格控制产品质量和安全。',
            qualificationImages: [
              {
                id: 'img3',
                url: 'https://via.placeholder.com/800x600?text=Organic+Certificate'
              },
              {
                id: 'img4',
                url: 'https://via.placeholder.com/800x600?text=Farming+Base'
              }
            ],
            relatedProducts: [
              { id: '103', name: '香泰有机大米', batch: 'XT20230610', productionDate: '2023-06-10', status: 'active' },
              { id: '104', name: '香泰红米', batch: 'XT20230615', productionDate: '2023-06-15', status: 'active' },
              { id: '105', name: '香泰糙米', batch: 'XT20230620', productionDate: '2023-06-20', status: 'pending' }
            ],
            productCount: 3,
            isActive: true,
            createdTime: '2023-04-15 09:15:00',
            updatedTime: '2023-06-18 16:45:00'
          },
          {
            id: '3',
            name: '广东精细化食品加工厂',
            contactPerson: '王厂长',
            contactPhone: '13700137003',
            region: '广东',
            address: '广东省东莞市食品科技产业园B区12号',
            scale: 'medium',
            certificationStatus: 'pending',
            certificationNumber: '',
            environmentDesc: '工厂专注于食品精细化加工，拥有专业的研发团队和先进的检测设备。采用严格的质量控制流程，确保产品符合国家标准。',
            qualificationImages: [
              {
                id: 'img5',
                url: 'https://via.placeholder.com/800x600?text=Factory+Premises'
              }
            ],
            relatedProducts: [],
            productCount: 0,
            isActive: true,
            createdTime: '2023-06-05 11:20:00',
            updatedTime: '2023-06-05 11:20:00'
          },
          {
            id: '4',
            name: '浙江传统食品工艺厂',
            contactPerson: '刘师傅',
            contactPhone: '13600136004',
            region: '浙江',
            address: '浙江省杭州市余杭区传统工艺产业园',
            scale: 'small',
            certificationStatus: 'uncertified',
            certificationNumber: '',
            environmentDesc: '本厂传承传统食品工艺，采用部分手工制作流程，结合现代卫生标准，生产具有地方特色的食品。',
            qualificationImages: [],
            relatedProducts: [],
            productCount: 0,
            isActive: false,
            createdTime: '2023-05-20 15:40:00',
            updatedTime: '2023-06-01 10:10:00'
          }
        ]
        this.loading = false
      }, 1000)
    },

    // 搜索
    search() {
      this.currentPage = 1 // 重置到第一页
    },

    // 重置搜索
    resetSearch() {
      this.searchParams = {
        name: '',
        region: '',
        certificationStatus: ''
      }
      this.currentPage = 1
    },

    // 处理选择变化
    handleSelectionChange(val) {
      this.selectedRows = val
    },

    // 处理行点击
    handleRowClick(row) {
      this.$refs['factoryTable']?.toggleRowSelection(row)
    },

    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },

    handleCurrentChange(val) {
      this.currentPage = val
    },

    // 获取规模名称
    getScaleName(scale) {
      const scaleMap = {
        'small': '小型',
        'medium': '中型',
        'large': '大型',
        'enterprise': '企业级'
      }
      return scaleMap[scale] || '未知'
    },

    // 获取规模标签类型
    getScaleTagType(scale) {
      const scaleTagMap = {
        'small': 'info',
        'medium': 'primary',
        'large': 'success',
        'enterprise': 'warning'
      }
      return scaleTagMap[scale] || 'default'
    },

    // 获取状态名称
    getStatusName(status) {
      const statusMap = {
        'certified': '已认证',
        'pending': '待认证',
        'uncertified': '未认证'
      }
      return statusMap[status] || '未知'
    },

    // 获取状态标签类型
    getStatusTagType(status) {
      const statusTagMap = {
        'certified': 'success',
        'pending': 'warning',
        'uncertified': 'danger'
      }
      return statusTagMap[status] || 'default'
    },

    // 添加厂家
    addFactory() {
      this.isEditing = false
      this.factoryForm = {
        id: '',
        name: '',
        contactPerson: '',
        contactPhone: '',
        region: '',
        address: '',
        scale: 'medium',
        certificationStatus: 'pending',
        certificationNumber: '',
        environmentDesc: '',
        isActive: true
      }
      this.tempImageFiles = []
      this.dialogVisible = true
    },

    // 编辑厂家
    editFactory(row) {
      this.isEditing = true
      this.factoryForm = JSON.parse(JSON.stringify(row))
      // 转换图片为上传组件所需格式
      this.tempImageFiles = row.qualificationImages ? row.qualificationImages.map(item => ({
        name: `资质图片_${item.id}`,
        url: item.url,
        uid: item.id
      })) : []
      this.dialogVisible = true
    },

    // 查看厂家详情
    viewFactory(row) {
      this.viewingFactory = JSON.parse(JSON.stringify(row))
      this.viewDialogVisible = true
    },

    // 预览图片
    previewImage(item) {
      this.previewImageUrl = item.url
      this.previewDialogVisible = true
    },

    // 图片上传前检查
    beforeImageUpload(file) {
      const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isImage) {
        this.$message.error('上传文件只能是图片格式!')
        return false
      }
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 10MB!')
        return false
      }
      return true
    },

    // 处理图片上传成功
    handleImageUploadSuccess(response, file, fileList) {
      // 上传成功后的处理逻辑
    },

    // 处理文件超出限制
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制最多上传5张图片`)
    },

    // 保存厂家信息
    saveFactory() {
      this.$refs.factoryForm.validate((valid) => {
        if (valid) {
          this.loading = true
          // 模拟保存操作
          setTimeout(() => {
            // 准备资质图片数据
            const qualificationImages = this.tempImageFiles.map((file, index) => ({
              id: file.uid || Date.now() + index.toString(),
              url: file.url
            }))

            const factoryData = {
              ...this.factoryForm,
              qualificationImages,
              updatedTime: new Date().toLocaleString('zh-CN')
            }

            // 保留关联产品和产品数量
            if (this.isEditing) {
              const originalFactory = this.factoryList.find(item => item.id === factoryData.id)
              if (originalFactory) {
                factoryData.relatedProducts = originalFactory.relatedProducts
                factoryData.productCount = originalFactory.productCount
              }
              // 编辑现有记录
              const index = this.factoryList.findIndex(item => item.id === factoryData.id)
              if (index > -1) {
                this.factoryList.splice(index, 1, factoryData)
              }
              this.$message.success('编辑成功')
            } else {
              // 添加新记录
              factoryData.id = Date.now().toString()
              factoryData.relatedProducts = []
              factoryData.productCount = 0
              factoryData.createdTime = new Date().toLocaleString('zh-CN')
              this.factoryList.push(factoryData)
              this.$message.success('添加成功')
            }

            this.dialogVisible = false
            this.loading = false
          }, 1000)
        }
      })
    },

    // 切换启用状态
    toggleStatus(row) {
      const action = row.isActive ? '禁用' : '启用'
      this.$confirm(`确定要${action}「${row.name}」吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        // 模拟状态切换
        setTimeout(() => {
          row.isActive = !row.isActive
          this.$message.success(`${action}成功`)
          this.loading = false
        }, 500)
      })
    },

    // 删除厂家
    deleteFactory(id) {
      const factory = this.factoryList.find(item => item.id === id)
      if (factory && factory.productCount > 0) {
        this.$message.warning('该厂家已关联产品，无法删除')
        return
      }

      this.$confirm('确定要删除这个生产厂家吗？删除后将无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        // 模拟删除操作
        setTimeout(() => {
          this.factoryList = this.factoryList.filter(item => item.id !== id)
          // 从选中列表中移除
          this.selectedRows = this.selectedRows.filter(item => item.id !== id)
          this.$message.success('删除成功')
          this.loading = false
        }, 500)
      })
    },

    // 批量删除
    batchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请先选择要删除的记录')
        return
      }

      // 检查是否有已关联产品的厂家
      const hasProductFactories = this.selectedRows.some(item => item.productCount > 0)
      if (hasProductFactories) {
        this.$message.warning('部分选中的厂家已关联产品，无法批量删除')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 个生产厂家吗？删除后将无法恢复`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        // 模拟批量删除操作
        setTimeout(() => {
          const idsToDelete = this.selectedRows.map(item => item.id)
          this.factoryList = this.factoryList.filter(item => !idsToDelete.includes(item.id))
          this.selectedRows = []
          this.$message.success(`成功删除 ${idsToDelete.length} 个生产厂家`)
          this.loading = false
        }, 500)
      })
    }
  }
}
</script>

<style scoped>
.operation-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
}

.search-form {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.environment-desc {
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.image-item {
  cursor: pointer;
}

.image-preview {
  width: 100%;
  height: 120px;
  border-radius: 4px;
  transition: transform 0.3s;
}

.image-item:hover .image-preview {
  transform: scale(1.05);
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 20px;
}
</style>
