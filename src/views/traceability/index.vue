<template>
  <div class="traceability">
    <div class="app-container">
      <!-- 数据统计仪表盘 -->
      <div class="dashboard-section">
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon primary">
              <i class="el-icon-document" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalStats.totalCount }}</div>
              <div class="stat-label">总溯源码数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success">
              <i class="el-icon-check" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalStats.activeCount }}</div>
              <div class="stat-label">启用状态</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warning">
              <i class="el-icon-close" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalStats.inactiveCount }}</div>
              <div class="stat-label">禁用状态</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon info">
              <i class="el-icon-time" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalStats.avgSteps }}</div>
              <div class="stat-label">平均流程环节</div>
            </div>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="charts-container">
          <div class="chart-item">
            <h3>产品类别分布</h3>
            <div class="chart-wrapper">
              <canvas ref="categoryChart" />
            </div>
          </div>
          <div class="chart-item">
            <h3>时间分布趋势</h3>
            <div class="chart-wrapper">
              <canvas ref="timeChart" />
            </div>
          </div>
        </div>
      </div>

      <!-- 查询表单 -->
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="溯源码">
          <el-input v-model="searchForm.code" placeholder="请输入溯源码" style="width: 200px" />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="searchForm.productName" placeholder="请输入产品名称" style="width: 200px" />
        </el-form-item>
        <el-form-item label="品牌">
          <el-input v-model="searchForm.brand" placeholder="请输入品牌" style="width: 180px" />
        </el-form-item>
        <el-form-item label="产品类别">
          <el-select v-model="searchForm.category" placeholder="选择产品类别" style="width: 150px">
            <el-option label="肉类" value="meat" />
            <el-option label="蔬菜" value="vegetable" />
            <el-option label="水果" value="fruit" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" icon="el-icon-plus" @click="handleCreate">新增溯源码</el-button>
          <el-button type="primary" icon="el-icon-document-copy" @click="handleBatchGenerate">批量生成</el-button>
          <el-button icon="el-icon-download" @click="handleExport">导出数据</el-button>
          <el-button icon="el-icon-upload" @click="handleImport">导入数据</el-button>
          <el-button icon="el-icon-delete" :disabled="multipleSelection.length === 0" @click="handleBatchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="traceabilityList" border fit highlight-current-row @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="code" label="溯源码" width="200" align="center">
          <template slot-scope="scope">
            <el-tag size="small">{{ scope.row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="产品名称" align="center" />
        <el-table-column prop="description" label="产品描述" align="center" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" active-color="#13ce66" inactive-color="#ff4949" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            <el-button size="mini" type="primary" @click="handleCopy(scope.row.code)">复制</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          layout="prev, pager, next, jumper, total, sizes"
          :total="total"
          :page-size.sync="pageSize"
          :current-page.sync="currentPage"
          :page-sizes="[10, 20, 30, 50]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" @close="handleClose">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>

        <el-form-item label="品牌" prop="brand">
          <el-input v-model="form.brand" placeholder="请输入品牌名称" />
        </el-form-item>

        <el-form-item label="规格型号" prop="model">
          <el-input v-model="form.model" placeholder="请输入规格型号" />
        </el-form-item>

        <el-form-item label="产品类别" prop="category">
          <el-select v-model="form.category" placeholder="请选择产品类别">
            <el-option label="肉类食品" value="meat" />
            <el-option label="蔬菜" value="vegetable" />
            <el-option label="水果" value="fruit" />
            <el-option label="海鲜" value="seafood" />
            <el-option label="乳制品" value="dairy" />
            <el-option label="其他食品" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="规格说明" prop="specifications">
          <el-input v-model="form.specifications" placeholder="请输入规格说明" />
        </el-form-item>

        <el-form-item label="批次号" prop="batchNo">
          <el-input v-model="form.batchNo" placeholder="请输入批次号" />
        </el-form-item>

        <el-form-item label="产品描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入产品描述" type="textarea" :rows="3" />
        </el-form-item>

        <el-form-item label="生产日期" prop="productionDate">
          <el-date-picker v-model="form.productionDate" type="date" placeholder="选择生产日期" style="width: 100%;" />
        </el-form-item>

        <el-form-item label="有效期至" prop="expiryDate">
          <el-date-picker v-model="form.expiryDate" type="date" placeholder="选择有效期至" style="width: 100%;" />
        </el-form-item>

        <el-form-item label="生产厂家" prop="manufacturer">
          <el-input v-model="form.manufacturer" placeholder="请输入生产厂家" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" active-color="#13ce66" inactive-color="#ff4949" />
        </el-form-item>

        <!-- 图片上传 -->
        <el-form-item label="产品图片">
          <el-upload
            v-model="form.images"
            action="#"
            :auto-upload="false"
            :on-change="handleImageChange"
            :multiple="true"
            list-type="picture-card"
            accept="image/*"
          >
            <i class="el-icon-plus" />
            <div slot="tip" class="el-upload__tip">请上传产品相关图片（支持多图）</div>
          </el-upload>
          <el-image-viewer
            v-if="showImageViewer"
            :on-close="closeImageViewer"
            :url-list="previewImages"
          />
        </el-form-item>

        <!-- 视频上传 -->
        <el-form-item label="产品视频">
          <el-upload
            v-model="form.videos"
            action="#"
            :auto-upload="false"
            :on-change="handleVideoChange"
            :multiple="true"
            list-type="text"
            accept="video/mp4,video/avi,video/mov"
          >
            <el-button size="small" type="primary">点击上传视频</el-button>
            <div slot="tip" class="el-upload__tip">请上传产品相关视频（支持多文件）</div>
          </el-upload>
        </el-form-item>

        <!-- 验证报告上传 -->
        <el-form-item label="验证报告">
          <el-upload
            v-model="form.certificates"
            action="#"
            :auto-upload="false"
            :on-change="handleCertificateChange"
            :multiple="true"
            list-type="text"
            accept=".pdf,.doc,.docx,.txt"
          >
            <el-button size="small" type="primary">点击上传验证报告</el-button>
            <div slot="tip" class="el-upload__tip">支持PDF、Word和文本格式（支持多文件）</div>
          </el-upload>
        </el-form-item>

        <!-- 征兆图片上传 -->
        <el-form-item label="征兆图片">
          <el-upload
            v-model="form.symptomImages"
            action="#"
            :auto-upload="false"
            :on-change="handleSymptomImageChange"
            :multiple="true"
            list-type="picture-card"
            accept="image/*"
            :on-preview="handleSymptomImagePreview"
          >
            <i class="el-icon-plus" />
            <div slot="tip" class="el-upload__tip">请上传产品相关的各种征兆图片（支持多图）</div>
          </el-upload>
        </el-form-item>

        <!-- 生产流程溯源信息 -->
        <el-form-item label="生产流程环节">
          <el-button type="primary" @click="handleAddFlow">添加流程环节</el-button>
          <div class="flow-container">
            <el-timeline :reverse-margin="20">
              <el-timeline-item
                v-for="(flow, index) in form.productionFlows"
                :key="index"
                :timestamp="flow.timestamp"
                placement="top"
              >
                <div class="flow-item">
                  <div class="flow-header">
                    <span class="flow-type">{{ getStageTypeName(flow.stageType) }}</span>
                    <span class="flow-name">{{ flow.stageName }}</span>
                    <div class="flow-actions">
                      <el-button size="mini" @click="handleEditFlow(flow, index)">编辑</el-button>
                      <el-button size="mini" type="danger" @click="handleDeleteFlow(index)">删除</el-button>
                    </div>
                  </div>
                  <div class="flow-details">
                    <span>操作人：{{ flow.operator }}</span>
                    <span>地点：{{ flow.location }}</span>
                    <span>负责人：{{ flow.responsiblePerson }}</span>
                  </div>
                  <p v-if="flow.description">描述：{{ flow.description }}</p>
                  <p v-if="flow.notes" class="flow-notes">备注：{{ flow.notes }}</p>
                </div>
              </el-timeline-item>
              <div v-if="form.productionFlows.length === 0" class="no-flow-tip">
                暂无生产流程环节记录，请点击上方按钮添加
              </div>
            </el-timeline>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 生产流程环节对话框 -->
    <el-dialog :title="flowDialogTitle" :visible.sync="flowDialogVisible" width="700px" @close="handleFlowDialogClose">
      <el-form ref="flowForm" :model="flowForm" label-width="120px">
        <el-form-item label="环节类型" prop="stageType">
          <el-select v-model="flowForm.stageType" placeholder="请选择环节类型">
            <el-option label="原料采购" value="material" />
            <el-option label="生产加工" value="processing" />
            <el-option label="质量检验" value="inspection" />
            <el-option label="包装" value="packaging" />
            <el-option label="仓储" value="storage" />
            <el-option label="物流运输" value="logistics" />
            <el-option label="销售" value="sales" />
          </el-select>
        </el-form-item>
        <el-form-item label="环节名称" prop="stageName">
          <el-input v-model="flowForm.stageName" placeholder="请输入环节名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="操作时间" prop="timestamp">
              <el-date-picker
                v-model="flowForm.timestamp"
                type="datetime"
                placeholder="选择操作时间"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作地点" prop="location">
              <el-input v-model="flowForm.location" placeholder="请输入操作地点" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="操作人" prop="operator">
              <el-input v-model="flowForm.operator" placeholder="请输入操作人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="responsiblePerson">
              <el-input v-model="flowForm.responsiblePerson" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="环节描述" prop="description">
          <el-input v-model="flowForm.description" placeholder="请输入环节详细描述" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input v-model="flowForm.notes" placeholder="请输入备注信息" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleFlowDialogClose">取消</el-button>
        <el-button type="primary" @click="handleFlowSubmit">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 引入Chart.js用于数据可视化
// import Chart from 'chart.js'
export default {
  name: 'Traceability',
  data() {
    return {
      loading: false,
      // 统计数据
      totalStats: {
        totalCount: 0,
        activeCount: 0,
        inactiveCount: 0,
        avgSteps: 0
      },
      // Chart实例
      categoryChart: null,
      timeChart: null,
      // 查询条件
      searchForm: {
        code: '',
        productName: '',
        brand: '',
        category: ''
      },
      // 批量操作相关数据
      multipleSelection: [],
      // 批量生成对话框
      batchGenerateVisible: false,
      // 批量生成表单
      batchForm: {
        productName: '',
        count: 1,
        brand: '',
        specs: '',
        category: '',
        productionDate: '',
        shelfLife: '',
        productionPlace: '',
        description: ''
      },
      // 批量生成验证规则
      batchRules: {
        productName: [
          { required: true, message: '请输入产品名称', trigger: 'blur' }
        ],
        count: [
          { required: true, message: '请输入生成数量', trigger: 'blur' }
        ]
      },
      // 文件上传相关
      uploadHeaders: {
        Authorization: 'Bearer token'
      },
      importLoading: false,
      traceabilityList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      dialogTitle: '新增溯源码',
      flowDialogVisible: false,
      flowDialogTitle: '添加生产环节',
      currentFlowIndex: -1,
      // 图片查看器
      showImageViewer: false,
      previewImages: [],
      // 表单
      form: {
        id: '',
        code: '',
        productName: '',
        brand: '',
        model: '',
        category: '',
        specifications: '',
        batchNo: '',
        productionDate: '',
        expiryDate: '',
        manufacturer: '',
        contactPerson: '',
        contactPhone: '',
        status: true,
        processSteps: [],
        images: [],
        videos: [],
        certificates: [],
        symptomImages: []
      },
      flowForm: {
        stageType: 'material', // 环节类型：原料采购
        stageName: '', // 环节名称
        operator: '', // 操作人
        timestamp: '', // 时间
        location: '', // 地点
        description: '', // 描述
        responsiblePerson: '', // 负责人
        notes: '' // 备注
      },
      rules: {
        productName: [
          { required: true, message: '请输入产品名称', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        brand: [
          { required: true, message: '请输入品牌名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        model: [
          { required: true, message: '请输入规格型号', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择产品类别', trigger: 'change' }
        ],
        batchNo: [
          { required: true, message: '请输入批次号', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        productionDate: [
          { required: true, message: '请选择生产日期', trigger: 'change' }
        ],
        expiryDate: [
          { required: true, message: '请选择有效期至', trigger: 'change' }
        ],
        manufacturer: [
          { required: true, message: '请输入生产厂家', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getTraceabilityList()
  },
  methods: {
    // 生成溯源码
    generateUniqueCode() {
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
      return `TRACE_${timestamp}_${random}`
    },

    // 获取溯源码列表
    getTraceabilityList() {
      this.loading = true
      try {
        const data = JSON.parse(localStorage.getItem('traceabilityCodes') || '[]')

        // 搜索过滤
        let filteredData = data
        if (this.searchForm.code) {
          filteredData = filteredData.filter(item => item.code.includes(this.searchForm.code.toUpperCase()))
        }
        if (this.searchForm.productName) {
          filteredData = filteredData.filter(item => item.productName.includes(this.searchForm.productName))
        }

        this.total = filteredData.length
        // 分页
        this.traceabilityList = filteredData.slice(
          (this.currentPage - 1) * this.pageSize,
          this.currentPage * this.pageSize
        )

        // 更新统计数据
        this.updateStatistics(data)
        // 更新图表（暂时注释）
        // this.updateCharts(data)
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    // 更新统计数据
    updateStatistics(data) {
      const totalCount = data.length
      const activeCount = data.filter(item => item.status).length
      const inactiveCount = totalCount - activeCount

      // 计算平均流程环节数
      const totalSteps = data.reduce((sum, item) => {
        const steps = item.processSteps || item.productionFlows || []
        return sum + steps.length
      }, 0)
      const avgSteps = totalCount > 0 ? (totalSteps / totalCount).toFixed(1) : '0.0'

      this.totalStats = {
        totalCount,
        activeCount,
        inactiveCount,
        avgSteps
      }
    },

    // 更新图表（暂时注释，等待Chart.js兼容性问题解决）
    updateCharts(data) {
      // this.updateCategoryChart(data)
      // this.updateTimeChart(data)
    },

    // 更新产品类别分布图表（暂时注释）
    updateCategoryChart(data) {
      // const ctx = this.$refs.categoryChart
      // if (!ctx) return
      //
      // // 销毁旧图表
      // if (this.categoryChart) {
      //   this.categoryChart.destroy()
      // }
      //
      // // 统计类别数据
      // const categoryCount = {}
      // data.forEach(item => {
      //   const category = item.category || '未分类'
      //   categoryCount[category] = (categoryCount[category] || 0) + 1
      // })
      //
      // // 准备图表数据
      // const labels = Object.keys(categoryCount)
      // const values = Object.values(categoryCount)
      // const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#C0C4CC']
      //
      // // 创建新图表
      // this.categoryChart = new Chart(ctx, {
      //   type: 'pie',
      //   data: {
      //     labels: labels,
      //     datasets: [{
      //       data: values,
      //       backgroundColor: colors.slice(0, labels.length),
      //       borderWidth: 1
      //     }]
      //   },
      //   options: {
      //     responsive: true,
      //     maintainAspectRatio: false,
      //     plugins: {
      //       legend: {
      //         position: 'right'
      //       }
      //     }
      //   }
      // })
    },

    // 更新时间分布趋势图表（暂时注释）
    updateTimeChart(data) {
      // const ctx = this.$refs.timeChart
      // if (!ctx) return
      //
      // // 销毁旧图表
      // if (this.timeChart) {
      //   this.timeChart.destroy()
      // }
      //
      // // 按日期分组数据
      // const dateCount = {}
      // data.forEach(item => {
      //   const date = new Date(item.createdAt)
      //   const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      //   dateCount[dateStr] = (dateCount[dateStr] || 0) + 1
      // })
      //
      // // 获取最近7天的日期
      // const today = new Date()
      // const dates = []
      // const counts = []
      //
      // for (let i = 6; i >= 0; i--) {
      //   const date = new Date(today)
      //   date.setDate(date.getDate() - i)
      //   const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      //   dates.push(dateStr)
      //   counts.push(dateCount[dateStr] || 0)
      // }
      //
      // // 创建新图表
      // this.timeChart = new Chart(ctx, {
      //   type: 'line',
      //   data: {
      //     labels: dates,
      //     datasets: [{
      //       label: '新增溯源码数量',
      //       data: counts,
      //       borderColor: '#409EFF',
      //       backgroundColor: 'rgba(64, 158, 255, 0.1)',
      //       fill: true,
      //       tension: 0.4
      //     }]
      //   },
      //   options: {
      //     responsive: true,
      //     maintainAspectRatio: false,
      //     scales: {
      //       y: {
      //         beginAtZero: true,
      //         ticks: {
      //           stepSize: 1
      //         }
      //       }
      //     }
      //   }
      // })
    },

    // 组件挂载后初始化
    mounted() {
      this.getTraceabilityList()
    },

    // 组件销毁前清理（暂时注释图表相关）
    beforeDestroy() {
      // if (this.categoryChart) {
      //   this.categoryChart.destroy()
      // }
      // if (this.timeChart) {
      //   this.timeChart.destroy()
      // }
    },

    // 原始的getTraceabilityList方法内容已被上面的实现替换
    // this.loading = true
    // // 从localStorage获取数据
    // const data = JSON.parse(localStorage.getItem('traceabilityCodes') || '[]')
    //
    // // 搜索过滤
    // let filteredData = data
    // if (this.searchForm.code) {
    //   filteredData = filteredData.filter(item => item.code.includes(this.searchForm.code.toUpperCase()))
    // }
    // if (this.searchForm.productName) {
    //   filteredData = filteredData.filter(item => item.productName.includes(this.searchForm.productName))
    // }
    //
    // this.total = filteredData.length
    // // 分页
    // this.traceabilityList = filteredData.slice(
    //   (this.currentPage - 1) * this.pageSize,
    //   this.currentPage * this.pageSize
    // )
    // this.loading = false

    // 查询
    handleSearch() {
      this.currentPage = 1
      this.getTraceabilityList()
    },

    // 重置
    resetSearch() {
      this.searchForm = {
        code: '',
        productName: ''
      }
      this.currentPage = 1
      this.getTraceabilityList()
    },

    // 新增
    handleCreate() {
      this.dialogTitle = '新增溯源码'
      this.form = {
        id: '',
        code: this.generateUniqueCode(),
        productName: '',
        description: '',
        status: true,
        createdAt: '',
        productionFlows: [],
        images: [],
        videos: [],
        certificates: [],
        symptomImages: []
      }
      this.dialogVisible = true
    },

    // 编辑
    handleEdit(row) {
      this.dialogTitle = '编辑溯源码'
      this.form = { ...row }
      this.dialogVisible = true
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除该溯源码吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const data = JSON.parse(localStorage.getItem('traceabilityCodes') || '[]')
        const newData = data.filter(item => item.id !== row.id)
        localStorage.setItem('traceabilityCodes', JSON.stringify(newData))
        this.$message({ type: 'success', message: '删除成功' })
        this.getTraceabilityList()
      })
    },

    // 处理选择变化
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    // 批量删除
    handleBatchDelete() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择要删除的溯源码')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.multipleSelection.length} 个溯源码吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const data = JSON.parse(localStorage.getItem('traceabilityCodes') || '[]')
        const ids = this.multipleSelection.map(item => item.id)
        const newData = data.filter(item => !ids.includes(item.id))
        localStorage.setItem('traceabilityCodes', JSON.stringify(newData))
        this.$message.success(`成功删除 ${this.multipleSelection.length} 个溯源码`)
        this.getTraceabilityList()
        this.multipleSelection = []
      })
    },

    // 批量生成对话框
    handleBatchGenerate() {
      this.batchGenerateForm = {
        count: 10,
        productName: '',
        brand: '',
        specs: '',
        category: '',
        productionDate: '',
        shelfLife: '',
        productionPlace: '',
        description: ''
      }
      this.batchGenerateVisible = true
    },

    // 处理批量生成
    executeBatchGenerate() {
      this.$refs.batchForm.validate((valid) => {
        if (valid) {
          const data = JSON.parse(localStorage.getItem('traceabilityCodes') || '[]')
          const count = this.batchForm.count
          const newItems = []

          for (let i = 0; i < count; i++) {
            const newItem = {
              ...this.batchForm,
              id: Date.now().toString() + i,
              code: this.generateUniqueCode(),
              status: true,
              createdAt: new Date().toLocaleString('zh-CN'),
              processSteps: []
            }
            newItems.push(newItem)
          }

          data.push(...newItems)
          localStorage.setItem('traceabilityCodes', JSON.stringify(data))
          this.$message({ type: 'success', message: `成功生成 ${count} 个溯源码` })
          this.batchGenerateVisible = false
          this.getList()
        }
      })
    },

    // 导出数据
    handleExport() {
      const data = JSON.parse(localStorage.getItem('traceabilityCodes') || '[]')

      if (data.length === 0) {
        this.$message.warning('没有数据可导出')
        return
      }

      // 准备导出数据
      const exportData = data.map(item => ({
        '溯源码': item.code,
        '产品名称': item.productName,
        '品牌': item.brand || '-',
        '规格': item.specs || '-',
        '类别': item.category || '-',
        '描述': item.description || '-',
        '创建时间': new Date(item.createdAt).toLocaleString('zh-CN'),
        '状态': item.status ? '启用' : '禁用',
        '环节数量': item.processSteps ? item.processSteps.length : 0
      }))

      // 创建CSV内容
      const headers = Object.keys(exportData[0])
      const csvContent = [
        headers.join(','), // 表头
        ...exportData.map(row =>
          headers.map(header => {
            const cell = row[header]
            // 处理包含逗号或换行符的单元格
            return `"${(cell || '').toString().replace(/"/g, '""')}"`
          }).join(',')
        )
      ].join('\n')

      // 创建下载链接
      const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `溯源码数据_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      this.$message.success('导出成功')
    },

    // 导入数据
    handleImport() {
      this.$confirm('导入将追加到现有数据中，确定继续吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        // 触发文件选择对话框
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.csv,.xlsx,.xls'
        input.onchange = (event) => {
          const file = event.target.files[0]
          if (!file) return

          this.importFile(file)
        }
        input.click()
      })
    },

    // 处理文件导入
    importFile(file) {
      this.importLoading = true

      // 模拟导入过程
      setTimeout(() => {
        try {
          // 在实际项目中，这里应该使用FileReader和CSV解析库
          // 这里简化处理，仅做演示

          this.$message.success(`文件 ${file.name} 导入成功（模拟）`)
          this.getList()
        } catch (error) {
          this.$message.error('导入失败，请检查文件格式')
          console.error('导入错误:', error)
        } finally {
          this.importLoading = false
        }
      }, 1000)
    },

    // 复制溯源码
    handleCopy(code) {
      const textarea = document.createElement('textarea')
      textarea.value = code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      this.$message({ type: 'success', message: '复制成功' })
    },

    // 图片上传处理
    handleImageChange(file, fileList) {
      // 在实际应用中，这里应该调用上传接口
      // 这里模拟上传成功，返回一个临时URL
      const reader = new FileReader()
      reader.readAsDataURL(file.raw)
      reader.onload = (e) => {
        // 保存图片信息到表单中
        const index = fileList.findIndex(f => f.uid === file.uid)
        if (index !== -1) {
          fileList[index].url = e.target.result
        }
        // 更新表单中的图片列表
        this.form.images = fileList.map(f => ({
          name: f.name,
          url: f.url || '',
          size: f.size,
          type: f.type
        }))
      }
    },

    // 视频上传处理
    handleVideoChange(file, fileList) {
      // 在实际应用中，这里应该调用上传接口
      // 这里模拟上传成功，保存文件信息
      this.form.videos = fileList.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        raw: f.raw // 在实际应用中，这里应该保存服务器返回的URL
      }))
    },

    // 图片预览
    handleImagePreview(file) {
      this.previewImages = this.form.images.map(img => img.url)
      this.showImageViewer = true
    },

    // 关闭图片查看器
    closeImageViewer() {
      this.showImageViewer = false
    },

    // 验证报告上传处理
    handleCertificateChange(file, fileList) {
      // 在实际应用中，这里应该调用上传接口
      // 这里模拟上传成功，保存文件信息
      this.form.certificates = fileList.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        raw: f.raw, // 在实际应用中，这里应该保存服务器返回的URL
        uploadTime: new Date().toLocaleString()
      }))
    },

    // 下载验证报告
    handleCertificateDownload(file) {
      if (file.raw) {
        const blob = new Blob([file.raw], { type: file.type })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
      }
    },

    // 征兆图片上传处理
    handleSymptomImageChange(file, fileList) {
      // 在实际应用中，这里应该调用上传接口
      // 这里模拟上传成功，返回一个临时URL
      const reader = new FileReader()
      reader.readAsDataURL(file.raw)
      reader.onload = (e) => {
        // 保存图片信息到表单中
        const index = fileList.findIndex(f => f.uid === file.uid)
        if (index !== -1) {
          fileList[index].url = e.target.result
        }
        // 更新表单中的征兆图片列表
        this.form.symptomImages = fileList.map(f => ({
          name: f.name,
          url: f.url || '',
          size: f.size,
          type: f.type,
          uploadTime: new Date().toLocaleString(),
          description: '' // 可以添加图片描述
        }))
      }
    },

    // 征兆图片预览
    handleSymptomImagePreview(file) {
      this.previewImages = this.form.symptomImages.map(img => img.url)
      this.showImageViewer = true
    },

    // 提交表单
    // 验证文件大小
    validateFileSizes() {
      // 图片限制 5MB
      const maxImageSize = 5 * 1024 * 1024
      // 视频限制 100MB
      const maxVideoSize = 100 * 1024 * 1024
      // 证书限制 20MB
      const maxCertificateSize = 20 * 1024 * 1024

      // 检查图片大小
      for (const file of this.form.images) {
        if (file.size > maxImageSize) {
          this.$message.error(`图片 ${file.name} 大小超过 5MB 限制`)
          return false
        }
      }

      // 检查征兆图片大小
      for (const file of this.form.symptomImages) {
        if (file.size > maxImageSize) {
          this.$message.error(`征兆图片 ${file.name} 大小超过 5MB 限制`)
          return false
        }
      }

      // 检查视频大小
      for (const file of this.form.videos) {
        if (file.size > maxVideoSize) {
          this.$message.error(`视频 ${file.name} 大小超过 100MB 限制`)
          return false
        }
      }

      // 检查证书大小
      for (const file of this.form.certificates) {
        if (file.size > maxCertificateSize) {
          this.$message.error(`证书 ${file.name} 大小超过 20MB 限制`)
          return false
        }
      }

      return true
    },

    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 验证文件大小
          if (!this.validateFileSizes()) {
            return
          }

          // 处理文件数据
          const formData = {
            ...this.form,
            // 转换文件对象为可存储格式
            images: this.form.images.map(file => ({
              name: file.name,
              url: URL.createObjectURL(file),
              size: file.size,
              type: file.type,
              lastModified: file.lastModified
            })),
            videos: this.form.videos.map(file => ({
              name: file.name,
              url: URL.createObjectURL(file),
              size: file.size,
              type: file.type,
              lastModified: file.lastModified
            })),
            certificates: this.form.certificates.map(file => ({
              name: file.name,
              url: URL.createObjectURL(file),
              size: file.size,
              type: file.type,
              lastModified: file.lastModified
            })),
            symptomImages: this.form.symptomImages.map(file => ({
              name: file.name,
              url: URL.createObjectURL(file),
              size: file.size,
              type: file.type,
              lastModified: file.lastModified
            }))
          }

          const data = JSON.parse(localStorage.getItem('traceabilityCodes') || '[]')
          if (this.form.id) {
            // 编辑
            const index = data.findIndex(item => item.id === this.form.id)
            if (index !== -1) {
              data[index] = formData
            }
          } else {
            // 新增
            const newItem = {
              ...formData,
              id: Date.now().toString(),
              createdAt: new Date().toLocaleString('zh-CN')
            }
            data.push(newItem)
          }
          localStorage.setItem('traceabilityCodes', JSON.stringify(data))
          this.$message({ type: 'success', message: this.form.id ? '编辑成功' : '新增成功' })
          this.dialogVisible = false
          this.getTraceabilityList()
        }
      })
    },

    // 关闭对话框
    handleClose() {
      this.$refs.form.resetFields()
      this.resetFlowForm()
      this.form.images = []
      this.form.videos = []
      this.form.certificates = []
      this.form.symptomImages = []
      this.showImageViewer = false
    },

    // 重置流程表单
    resetFlowForm() {
      this.flowForm = {
        stageType: 'material',
        stageName: '',
        operator: '',
        timestamp: new Date().toISOString(),
        location: '',
        description: '',
        responsiblePerson: '',
        notes: ''
      }
      this.currentFlowIndex = -1
    },

    // 获取环节类型名称
    getStageTypeName(type) {
      const typeMap = {
        'material': '原料采购',
        'processing': '生产加工',
        'inspection': '质量检验',
        'packaging': '包装',
        'storage': '仓储',
        'logistics': '物流运输',
        'sales': '销售'
      }
      return typeMap[type] || type
    },

    // 添加流程环节
    handleAddFlow() {
      this.flowDialogTitle = '添加生产环节'
      this.resetFlowForm()
      this.flowDialogVisible = true
    },

    // 编辑流程环节
    handleEditFlow(flow, index) {
      this.flowDialogTitle = '编辑生产环节'
      this.flowForm = { ...flow }
      this.currentFlowIndex = index
      this.flowDialogVisible = true
    },

    // 删除流程环节
    handleDeleteFlow(index) {
      this.$confirm('确定要删除该生产环节吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.form.productionFlows.splice(index, 1)
        this.$message({ type: 'success', message: '删除成功' })
      }).catch(() => {
        // 取消删除
      })
    },

    // 关闭流程对话框
    handleFlowDialogClose() {
      this.flowDialogVisible = false
      this.resetFlowForm()
    },

    // 提交流程环节
    handleFlowSubmit() {
      if (this.currentFlowIndex === -1) {
        // 添加新环节
        this.form.productionFlows.push({ ...this.flowForm })
        // 按时间排序
        this.form.productionFlows.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      } else {
        // 编辑现有环节
        this.form.productionFlows[this.currentFlowIndex] = { ...this.flowForm }
      }
      this.flowDialogVisible = false
      this.$message({ type: 'success', message: '保存成功' })
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.getTraceabilityList()
    },

    // 页码改变
    handleCurrentChange(val) {
      this.currentPage = val
      this.getTraceabilityList()
    }
  }
}
</script>

<style scoped>
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 数据统计仪表盘样式 */
.dashboard-section {
  margin-bottom: 30px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 20px;
  color: #fff;
}

.stat-icon.primary {
  background: linear-gradient(135deg, #409EFF, #67C23A);
}

.stat-icon.success {
  background: linear-gradient(135deg, #67C23A, #13ce66);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #E6A23C, #F56C6C);
}

.stat-icon.info {
  background: linear-gradient(135deg, #909399, #409EFF);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

/* 图表容器样式 */
.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-item {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-item h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.chart-wrapper {
  position: relative;
  height: 300px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }

  .chart-wrapper {
    height: 250px;
  }
}

/* 生产流程样式 */
.flow-container {
  margin-top: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.flow-item {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.flow-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.flow-type {
  background-color: #409EFF;
  color: white;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  margin-right: 8px;
}

.flow-name {
  font-weight: bold;
  flex: 1;
}

.flow-actions {
  display: flex;
  gap: 5px;
}

.flow-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.flow-notes {
  font-size: 13px;
  color: #909399;
  font-style: italic;
  margin: 0;
}

.no-flow-tip {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-style: italic;
}
</style>
