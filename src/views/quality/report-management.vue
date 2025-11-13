<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item>质量信息管理</el-breadcrumb-item>
        <el-breadcrumb-item>检验报告管理</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 操作按钮 -->
      <div class="operation-bar mb-4">
        <el-button type="primary" @click="uploadReport">上传检验报告</el-button>
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="batchDelete">
          批量删除 ({{ selectedRows.length }})
        </el-button>
        <el-button @click="exportReportList">导出报告列表</el-button>
      </div>

      <!-- 搜索和筛选 -->
      <el-form :inline="true" class="search-form mb-4">
        <el-form-item label="报告名称">
          <el-input v-model="searchParams.name" placeholder="请输入报告名称" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="关联产品">
          <el-select v-model="searchParams.productId" placeholder="请选择关联产品" style="width: 200px;">
            <el-option label="全部产品" value="" />
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="检验类型">
          <el-select v-model="searchParams.testType" placeholder="请选择检验类型" style="width: 200px;">
            <el-option label="全部类型" value="" />
            <el-option label="常规检验" value="regular" />
            <el-option label="专项检验" value="special" />
            <el-option label="出厂检验" value="factory" />
            <el-option label="第三方检验" value="third-party" />
          </el-select>
        </el-form-item>
        <el-form-item label="检验日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="paginatedReportList"
        style="width: 100%"
        row-key="id"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="name" label="报告名称" min-width="250" />
        <el-table-column prop="productName" label="关联产品" width="200" />
        <el-table-column prop="testType" label="检验类型" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getTestTypeTagType(scope.row.testType)">
              {{ getTestTypeName(scope.row.testType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="testDate" label="检验日期" width="120" align="center" />
        <el-table-column prop="testInstitution" label="检验机构" min-width="150" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '有效' : '失效' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileType" label="文件类型" width="100" align="center">
          <template slot-scope="scope">
            <el-tag size="small" type="info">
              {{ scope.row.fileType.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="文件大小" width="100" align="center">
          <template slot-scope="scope">
            {{ formatFileSize(scope.row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="previewReport(scope.row)">预览</el-button>
            <el-button size="mini" type="primary" @click="editReport(scope.row)">编辑</el-button>
            <el-button
              size="mini"
              :type="scope.row.status === 'active' ? 'warning' : 'success'"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '设为失效' : '设为有效' }}
            </el-button>
            <el-button size="mini" type="danger" @click="deleteReport(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :total="filteredReportList.length"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :current-page="currentPage"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 上传报告对话框 -->
    <el-dialog
      :visible.sync="uploadDialogVisible"
      title="上传检验报告"
      :width="'600px'"
    >
      <el-form
        ref="uploadForm"
        :model="uploadForm"
        :rules="uploadFormRules"
        label-width="120px"
      >
        <el-form-item label="报告名称" prop="name">
          <el-input v-model="uploadForm.name" placeholder="请输入报告名称" maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item label="关联产品" prop="productId">
          <el-select v-model="uploadForm.productId" placeholder="请选择关联产品">
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="检验类型" prop="testType">
          <el-select v-model="uploadForm.testType" placeholder="请选择检验类型">
            <el-option label="常规检验" value="regular" />
            <el-option label="专项检验" value="special" />
            <el-option label="出厂检验" value="factory" />
            <el-option label="第三方检验" value="third-party" />
          </el-select>
        </el-form-item>

        <el-form-item label="检验日期" prop="testDate">
          <el-date-picker
            v-model="uploadForm.testDate"
            type="date"
            placeholder="请选择检验日期"
            style="width: 100%;"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>

        <el-form-item label="检验机构" prop="testInstitution">
          <el-input v-model="uploadForm.testInstitution" placeholder="请输入检验机构名称" maxlength="100" />
        </el-form-item>

        <el-form-item label="检验结论" prop="conclusion">
          <el-radio-group v-model="uploadForm.conclusion">
            <el-radio label="qualified">合格</el-radio>
            <el-radio label="unqualified">不合格</el-radio>
            <el-radio label="partially-qualified">部分合格</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="报告文件" prop="file">
          <el-upload
            class="report-uploader"
            action="#"
            :on-success="handleFileUploadSuccess"
            :before-upload="beforeFileUpload"
            :file-list="uploadFileList"
            :multiple="false"
            :auto-upload="false"
            :on-change="handleFileChange"
          >
            <el-button size="small" type="primary">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">
              支持PDF、JPG、PNG格式，单个文件不超过20MB
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="备注说明">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备注说明"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelUpload">取消</el-button>
        <el-button type="primary" @click="submitUpload">确认上传</el-button>
      </div>
    </el-dialog>

    <!-- 编辑报告对话框 -->
    <el-dialog
      :visible.sync="editDialogVisible"
      title="编辑检验报告"
      :width="'600px'"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editFormRules"
        label-width="120px"
      >
        <el-form-item label="报告名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入报告名称" maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item label="关联产品" prop="productId">
          <el-select v-model="editForm.productId" placeholder="请选择关联产品">
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="检验类型" prop="testType">
          <el-select v-model="editForm.testType" placeholder="请选择检验类型">
            <el-option label="常规检验" value="regular" />
            <el-option label="专项检验" value="special" />
            <el-option label="出厂检验" value="factory" />
            <el-option label="第三方检验" value="third-party" />
          </el-select>
        </el-form-item>

        <el-form-item label="检验日期" prop="testDate">
          <el-date-picker
            v-model="editForm.testDate"
            type="date"
            placeholder="请选择检验日期"
            style="width: 100%;"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>

        <el-form-item label="检验机构" prop="testInstitution">
          <el-input v-model="editForm.testInstitution" placeholder="请输入检验机构名称" maxlength="100" />
        </el-form-item>

        <el-form-item label="检验结论" prop="conclusion">
          <el-radio-group v-model="editForm.conclusion">
            <el-radio label="qualified">合格</el-radio>
            <el-radio label="unqualified">不合格</el-radio>
            <el-radio label="partially-qualified">部分合格</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="现有文件">
          <el-tag class="file-tag">
            {{ editForm.fileName }} ({{ formatFileSize(editForm.fileSize) }})
            <i class="el-icon-close" @click="clearEditFile" />
          </el-tag>
          <el-button size="small" type="primary" plain @click="previewCurrentFile">预览</el-button>
        </el-form-item>

        <el-form-item label="替换文件">
          <el-upload
            class="report-uploader"
            action="#"
            :on-success="handleEditFileUploadSuccess"
            :before-upload="beforeFileUpload"
            :file-list="editFileList"
            :multiple="false"
            :auto-upload="false"
            :on-change="handleEditFileChange"
          >
            <el-button size="small" type="primary">选择新文件</el-button>
            <div slot="tip" class="el-upload__tip">
              支持PDF、JPG、PNG格式，单个文件不超过20MB（可选）
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="备注说明">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备注说明"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="editForm.status" :active-value="'active'" :inactive-value="'inactive'" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </div>
    </el-dialog>

    <!-- 报告预览对话框 -->
    <el-dialog
      :visible.sync="previewDialogVisible"
      :title="previewReportTitle"
      :width="'900px'"
      :fullscreen="isFullscreen"
    >
      <div class="preview-header">
        <div class="preview-actions">
          <el-button size="small" @click="isFullscreen = !isFullscreen">
            {{ isFullscreen ? '退出全屏' : '全屏预览' }}
          </el-button>
        </div>
      </div>

      <div class="preview-content">
        <div v-if="previewFileType === 'pdf'" class="pdf-preview">
          <iframe :src="previewFileUrl" width="100%" height="600px" />
        </div>
        <div v-else class="image-preview">
          <el-image :src="previewFileUrl" fit="contain" style="width: 100%; height: 600px;" />
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadFile">下载文件</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ReportManagement',
  data() {
    return {
      // 报告列表
      reportList: [],
      // 产品列表（用于关联选择）
      productList: [],
      // 选中的行
      selectedRows: [],
      // 搜索参数
      searchParams: {
        name: '',
        productId: '',
        testType: '',
        startDate: '',
        endDate: ''
      },
      // 日期范围
      dateRange: null,
      // 分页参数
      currentPage: 1,
      pageSize: 10,
      // 加载状态
      loading: false,
      // 上传对话框状态
      uploadDialogVisible: false,
      uploadForm: {
        name: '',
        productId: '',
        testType: 'regular',
        testDate: '',
        testInstitution: '',
        conclusion: 'qualified',
        description: ''
      },
      uploadFormRules: {
        name: [
          { required: true, message: '请输入报告名称', trigger: 'blur' }
        ],
        productId: [
          { required: true, message: '请选择关联产品', trigger: 'change' }
        ],
        testType: [
          { required: true, message: '请选择检验类型', trigger: 'change' }
        ],
        testDate: [
          { required: true, message: '请选择检验日期', trigger: 'change' }
        ],
        testInstitution: [
          { required: true, message: '请输入检验机构名称', trigger: 'blur' }
        ],
        conclusion: [
          { required: true, message: '请选择检验结论', trigger: 'change' }
        ],
        file: [
          { required: true, message: '请选择报告文件', trigger: 'change' }
        ]
      },
      // 上传文件列表
      uploadFileList: [],
      tempUploadFile: null,
      // 编辑对话框状态
      editDialogVisible: false,
      editForm: {
        id: '',
        name: '',
        productId: '',
        productName: '',
        testType: 'regular',
        testDate: '',
        testInstitution: '',
        conclusion: 'qualified',
        fileName: '',
        fileSize: 0,
        fileType: '',
        filePath: '',
        description: '',
        status: 'active'
      },
      editFormRules: {
        name: [
          { required: true, message: '请输入报告名称', trigger: 'blur' }
        ],
        productId: [
          { required: true, message: '请选择关联产品', trigger: 'change' }
        ],
        testType: [
          { required: true, message: '请选择检验类型', trigger: 'change' }
        ],
        testDate: [
          { required: true, message: '请选择检验日期', trigger: 'change' }
        ],
        testInstitution: [
          { required: true, message: '请输入检验机构名称', trigger: 'blur' }
        ],
        conclusion: [
          { required: true, message: '请选择检验结论', trigger: 'change' }
        ]
      },
      // 编辑文件列表
      editFileList: [],
      tempEditFile: null,
      // 预览对话框状态
      previewDialogVisible: false,
      previewReportTitle: '',
      previewFileUrl: '',
      previewFileType: 'pdf',
      isFullscreen: false
    }
  },
  computed: {
    // 过滤后的报告列表
    filteredReportList() {
      let result = [...this.reportList]

      // 按名称搜索
      if (this.searchParams.name) {
        const keyword = this.searchParams.name.toLowerCase()
        result = result.filter(item => item.name.toLowerCase().includes(keyword))
      }

      // 按产品过滤
      if (this.searchParams.productId) {
        result = result.filter(item => item.productId === this.searchParams.productId)
      }

      // 按检验类型过滤
      if (this.searchParams.testType) {
        result = result.filter(item => item.testType === this.searchParams.testType)
      }

      // 按日期范围过滤
      if (this.searchParams.startDate) {
        result = result.filter(item => new Date(item.testDate) >= new Date(this.searchParams.startDate))
      }
      if (this.searchParams.endDate) {
        result = result.filter(item => new Date(item.testDate) <= new Date(this.searchParams.endDate))
      }

      // 按上传时间倒序排列
      result.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime))

      return result
    },

    // 分页后的报告列表
    paginatedReportList() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredReportList.slice(start, end)
    }
  },
  watch: {
    // 监听日期范围变化
    dateRange: {
      handler(newVal) {
        if (newVal && newVal.length === 2) {
          this.searchParams.startDate = newVal[0]
          this.searchParams.endDate = newVal[1]
        } else {
          this.searchParams.startDate = ''
          this.searchParams.endDate = ''
        }
      },
      immediate: true
    }
  },
  created() {
    this.fetchReportList()
    this.fetchProductList()
  },
  methods: {
    // 获取报告列表
    fetchReportList() {
      this.loading = true
      // 模拟API请求
      setTimeout(() => {
        this.reportList = [
          {
            id: '1',
            name: '香泰优质大米常规检验报告',
            productId: '101',
            productName: '香泰优质大米',
            testType: 'regular',
            testDate: '2023-06-01',
            testInstitution: '湖南省食品质量监督检验研究院',
            conclusion: 'qualified',
            fileName: 'XT20230601_quality_test.pdf',
            fileSize: 2097152, // 2MB
            fileType: 'pdf',
            filePath: 'https://via.placeholder.com/800x1000?text=Quality+Test+Report',
            description: '2023年6月第一批常规检验报告',
            status: 'active',
            uploadTime: '2023-06-03 10:30:00',
            updatedTime: '2023-06-03 10:30:00'
          },
          {
            id: '2',
            name: '香泰有机大米第三方检验报告',
            productId: '103',
            productName: '香泰有机大米',
            testType: 'third-party',
            testDate: '2023-06-15',
            testInstitution: '中国检验认证集团湖南有限公司',
            conclusion: 'qualified',
            fileName: 'XT20230615_third_party_report.pdf',
            fileSize: 5242880, // 5MB
            fileType: 'pdf',
            filePath: 'https://via.placeholder.com/800x1000?text=Third+Party+Report',
            description: '有机大米认证检验报告',
            status: 'active',
            uploadTime: '2023-06-18 14:20:00',
            updatedTime: '2023-06-18 14:20:00'
          },
          {
            id: '3',
            name: '香泰红米出厂检验报告',
            productId: '104',
            productName: '香泰红米',
            testType: 'factory',
            testDate: '2023-06-20',
            testInstitution: '湖南香泰食品加工厂质检部',
            conclusion: 'qualified',
            fileName: 'XT20230620_factory_inspection.jpg',
            fileSize: 1572864, // 1.5MB
            fileType: 'jpg',
            filePath: 'https://via.placeholder.com/1200x800?text=Factory+Inspection+Report',
            description: '红米出厂检验记录',
            status: 'active',
            uploadTime: '2023-06-20 09:45:00',
            updatedTime: '2023-06-20 09:45:00'
          },
          {
            id: '4',
            name: '香泰糙米重金属专项检验报告',
            productId: '105',
            productName: '香泰糙米',
            testType: 'special',
            testDate: '2023-06-25',
            testInstitution: '湖南省分析测试中心',
            conclusion: 'qualified',
            fileName: 'XT20230625_heavy_metal_test.pdf',
            fileSize: 3145728, // 3MB
            fileType: 'pdf',
            filePath: 'https://via.placeholder.com/800x1000?text=Heavy+Metal+Test',
            description: '糙米重金属含量专项检测报告',
            status: 'active',
            uploadTime: '2023-06-28 16:30:00',
            updatedTime: '2023-06-28 16:30:00'
          },
          {
            id: '5',
            name: '香泰生态米常规检验报告(旧版)',
            productId: '102',
            productName: '香泰生态米',
            testType: 'regular',
            testDate: '2023-05-10',
            testInstitution: '湖南省食品质量监督检验研究院',
            conclusion: 'qualified',
            fileName: 'XT20230510_quality_test_old.pdf',
            fileSize: 1887436, // 约1.8MB
            fileType: 'pdf',
            filePath: 'https://via.placeholder.com/800x1000?text=Old+Test+Report',
            description: '旧版检验报告，已被新版替代',
            status: 'inactive',
            uploadTime: '2023-05-12 11:00:00',
            updatedTime: '2023-06-15 15:20:00'
          }
        ]
        this.loading = false
      }, 1000)
    },

    // 获取产品列表
    fetchProductList() {
      // 模拟API请求
      setTimeout(() => {
        this.productList = [
          { id: '101', name: '香泰优质大米' },
          { id: '102', name: '香泰生态米' },
          { id: '103', name: '香泰有机大米' },
          { id: '104', name: '香泰红米' },
          { id: '105', name: '香泰糙米' }
        ]
      }, 500)
    },

    // 搜索
    search() {
      this.currentPage = 1 // 重置到第一页
    },

    // 重置搜索
    resetSearch() {
      this.searchParams = {
        name: '',
        productId: '',
        testType: '',
        startDate: '',
        endDate: ''
      }
      this.dateRange = null
      this.currentPage = 1
    },

    // 处理选择变化
    handleSelectionChange(val) {
      this.selectedRows = val
    },

    // 处理行点击
    handleRowClick(row) {
      this.$refs['reportTable']?.toggleRowSelection(row)
    },

    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },

    handleCurrentChange(val) {
      this.currentPage = val
    },

    // 获取检验类型名称
    getTestTypeName(type) {
      const typeMap = {
        'regular': '常规检验',
        'special': '专项检验',
        'factory': '出厂检验',
        'third-party': '第三方检验'
      }
      return typeMap[type] || '未知'
    },

    // 获取检验类型标签类型
    getTestTypeTagType(type) {
      const tagTypeMap = {
        'regular': 'primary',
        'special': 'warning',
        'factory': 'info',
        'third-party': 'success'
      }
      return tagTypeMap[type] || 'default'
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 上传报告
    uploadReport() {
      this.uploadForm = {
        name: '',
        productId: '',
        testType: 'regular',
        testDate: '',
        testInstitution: '',
        conclusion: 'qualified',
        description: ''
      }
      this.uploadFileList = []
      this.tempUploadFile = null
      this.uploadDialogVisible = true
    },

    // 取消上传
    cancelUpload() {
      this.uploadDialogVisible = false
      this.uploadFileList = []
      this.tempUploadFile = null
    },

    // 文件上传前检查
    beforeFileUpload(file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
      const isValidateType = validTypes.includes(file.type)
      const isLt20M = file.size / 1024 / 1024 < 20

      if (!isValidateType) {
        this.$message.error('上传文件只能是PDF、JPG或PNG格式!')
        return false
      }
      if (!isLt20M) {
        this.$message.error('上传文件大小不能超过 20MB!')
        return false
      }
      return true
    },

    // 处理上传文件变化
    handleFileChange(file, fileList) {
      this.uploadFileList = fileList
      this.tempUploadFile = file
    },

    // 处理编辑文件变化
    handleEditFileChange(file, fileList) {
      this.editFileList = fileList
      this.tempEditFile = file
    },

    // 处理文件上传成功
    handleFileUploadSuccess(response, file, fileList) {
      // 上传成功后的处理逻辑
    },

    // 处理编辑文件上传成功
    handleEditFileUploadSuccess(response, file, fileList) {
      // 上传成功后的处理逻辑
    },

    // 提交上传
    submitUpload() {
      // 检查是否选择了文件
      if (!this.tempUploadFile) {
        this.$message.error('请选择报告文件')
        return
      }

      this.$refs.uploadForm.validate((valid) => {
        if (valid) {
          this.loading = true
          // 模拟上传操作
          setTimeout(() => {
            // 获取产品名称
            const selectedProduct = this.productList.find(p => p.id === this.uploadForm.productId)
            const productName = selectedProduct ? selectedProduct.name : ''

            // 创建新报告记录
            const newReport = {
              id: Date.now().toString(),
              name: this.uploadForm.name,
              productId: this.uploadForm.productId,
              productName: productName,
              testType: this.uploadForm.testType,
              testDate: this.uploadForm.testDate,
              testInstitution: this.uploadForm.testInstitution,
              conclusion: this.uploadForm.conclusion,
              fileName: this.tempUploadFile.name,
              fileSize: this.tempUploadFile.size,
              fileType: this.tempUploadFile.name.split('.').pop().toLowerCase(),
              filePath: 'https://via.placeholder.com/800x1000?text=New+Report',
              description: this.uploadForm.description,
              status: 'active',
              uploadTime: new Date().toLocaleString('zh-CN'),
              updatedTime: new Date().toLocaleString('zh-CN')
            }

            this.reportList.push(newReport)
            this.uploadDialogVisible = false
            this.$message.success('报告上传成功')
            this.loading = false
          }, 1500)
        }
      })
    },

    // 编辑报告
    editReport(row) {
      this.editForm = JSON.parse(JSON.stringify(row))
      this.editFileList = []
      this.tempEditFile = null
      this.editDialogVisible = true
    },

    // 清除编辑文件
    clearEditFile() {
      this.editForm.fileName = ''
      this.editForm.fileSize = 0
      this.editForm.fileType = ''
      this.editForm.filePath = ''
    },

    // 预览当前文件
    previewCurrentFile() {
      this.previewReport(this.editForm)
    },

    // 保存编辑
    saveEdit() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          // 检查是否有文件但没有文件信息
          if (!this.editForm.fileName) {
            this.$message.error('请上传报告文件')
            return
          }

          this.loading = true
          // 模拟保存操作
          setTimeout(() => {
            // 获取产品名称
            const selectedProduct = this.productList.find(p => p.id === this.editForm.productId)
            const productName = selectedProduct ? selectedProduct.name : ''

            // 更新文件信息（如果有新文件）
            if (this.tempEditFile) {
              this.editForm.fileName = this.tempEditFile.name
              this.editForm.fileSize = this.tempEditFile.size
              this.editForm.fileType = this.tempEditFile.name.split('.').pop().toLowerCase()
              this.editForm.filePath = 'https://via.placeholder.com/800x1000?text=Updated+Report'
            }

            // 更新报告信息
            const updatedReport = {
              ...this.editForm,
              productName: productName,
              updatedTime: new Date().toLocaleString('zh-CN')
            }

            // 保存到列表
            const index = this.reportList.findIndex(item => item.id === updatedReport.id)
            if (index > -1) {
              this.reportList.splice(index, 1, updatedReport)
            }

            this.editDialogVisible = false
            this.$message.success('报告更新成功')
            this.loading = false
          }, 1000)
        }
      })
    },

    // 预览报告
    previewReport(row) {
      this.previewReportTitle = row.name
      this.previewFileUrl = row.filePath
      this.previewFileType = row.fileType
      this.isFullscreen = false
      this.previewDialogVisible = true
    },

    // 下载文件
    downloadFile() {
      // 模拟文件下载
      this.$message.success('开始下载文件...')
      // 在实际项目中，这里应该调用下载API
    },

    // 切换状态
    toggleStatus(row) {
      const action = row.status === 'active' ? '设为失效' : '设为有效'
      this.$confirm(`确定要${action}「${row.name}」吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        // 模拟状态切换
        setTimeout(() => {
          row.status = row.status === 'active' ? 'inactive' : 'active'
          row.updatedTime = new Date().toLocaleString('zh-CN')
          this.$message.success(`${action}成功`)
          this.loading = false
        }, 500)
      })
    },

    // 删除报告
    deleteReport(id) {
      this.$confirm('确定要删除这个检验报告吗？删除后将无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        // 模拟删除操作
        setTimeout(() => {
          this.reportList = this.reportList.filter(item => item.id !== id)
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

      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 个检验报告吗？删除后将无法恢复`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        // 模拟批量删除操作
        setTimeout(() => {
          const idsToDelete = this.selectedRows.map(item => item.id)
          this.reportList = this.reportList.filter(item => !idsToDelete.includes(item.id))
          this.selectedRows = []
          this.$message.success(`成功删除 ${idsToDelete.length} 个检验报告`)
          this.loading = false
        }, 500)
      })
    },

    // 导出报告列表
    exportReportList() {
      this.loading = true
      // 模拟导出操作
      setTimeout(() => {
        this.$message.success('报告列表导出成功')
        this.loading = false
      }, 1000)
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
  margin-bottom: 15px;
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

.file-tag {
  display: inline-flex;
  align-items: center;
  margin-right: 10px;
  margin-bottom: 10px;
}

.file-tag .el-icon-close {
  margin-left: 5px;
  cursor: pointer;
}

.file-tag .el-icon-close:hover {
  opacity: 0.7;
}

.preview-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.preview-content {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 10px;
  min-height: 600px;
}

.pdf-preview,
.image-preview {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 768px) {
  .operation-bar {
    flex-wrap: wrap;
  }

  .search-form {
    padding: 10px;
  }

  .preview-content {
    min-height: 400px;
  }

  .pdf-preview iframe,
  .image-preview img {
    max-height: 400px;
  }
}
</style>
