<template>
  <div class="app-container">
    <el-card>
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item>生产信息管理</el-breadcrumb-item>
        <el-breadcrumb-item>上游生产信息</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 操作按钮 -->
      <div class="operation-bar mb-4">
        <el-button type="primary" @click="addUpstreamInfo">添加上游信息</el-button>
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="batchDelete">
          批量删除 ({{ selectedRows.length }})
        </el-button>
      </div>

      <!-- 搜索和筛选 -->
      <el-form :inline="true" class="search-form mb-4">
        <el-form-item label="信息名称">
          <el-input v-model="searchParams.name" placeholder="请输入信息名称" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="searchParams.supplier" placeholder="请输入供应商名称" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="信息类型">
          <el-select v-model="searchParams.type" placeholder="全部">
            <el-option label="全部" value="" />
            <el-option label="原料信息" value="raw_material" />
            <el-option label="加工过程" value="processing" />
            <el-option label="包装信息" value="packaging" />
            <el-option label="其他" value="other" />
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
        :data="filteredUpstreamList"
        style="width: 100%"
        row-key="id"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="name" label="信息名称" min-width="180" />
        <el-table-column prop="type" label="信息类型" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" width="180" />
        <el-table-column prop="location" label="产地" width="150" />
        <el-table-column prop="productionDate" label="生产日期" width="150" />
        <el-table-column prop="relatedProducts" label="关联产品" min-width="200">
          <template slot-scope="scope">
            <el-tag v-for="product in scope.row.relatedProducts" :key="product.id" size="small" class="mr-1 mb-1">
              {{ product.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="mediaCount" label="媒体数量" width="100" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.mediaCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewUpstreamInfo(scope.row)">查看</el-button>
            <el-button size="mini" type="primary" @click="editUpstreamInfo(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteUpstreamInfo(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :total="filteredUpstreamList.length"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :current-page="currentPage"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑上游信息对话框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="isEditing ? '编辑上游信息' : '添加上游信息'"
      :width="'800px'"
    >
      <el-form
        ref="upstreamForm"
        :model="upstreamForm"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="信息名称" prop="name">
          <el-input v-model="upstreamForm.name" placeholder="请输入信息名称" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="信息类型" prop="type">
          <el-select v-model="upstreamForm.type" placeholder="请选择信息类型">
            <el-option label="原料信息" value="raw_material" />
            <el-option label="加工过程" value="processing" />
            <el-option label="包装信息" value="packaging" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="upstreamForm.supplier" placeholder="请输入供应商名称" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="供应商联系方式">
          <el-input v-model="upstreamForm.supplierContact" placeholder="请输入供应商联系方式" maxlength="100" />
        </el-form-item>

        <el-form-item label="产地">
          <el-input v-model="upstreamForm.location" placeholder="请输入产地" maxlength="100" />
        </el-form-item>

        <el-form-item label="生产日期">
          <el-date-picker
            v-model="upstreamForm.productionDate"
            type="date"
            placeholder="选择生产日期"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="信息描述" prop="description">
          <el-input
            v-model="upstreamForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入详细描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="关联产品" prop="relatedProducts">
          <el-select
            v-model="upstreamForm.relatedProducts"
            multiple
            placeholder="请选择关联产品"
            value-key="id"
            :filterable="true"
            :remote="true"
            :remote-method="remoteSearchProducts"
            loading-text="搜索中"
            no-data-text="没有找到匹配的产品"
          >
            <el-option
              v-for="product in availableProducts"
              :key="product.id"
              :label="product.name"
              :value="product"
            />
          </el-select>
          <div class="form-hint">输入产品名称关键词进行搜索</div>
        </el-form-item>

        <el-form-item label="媒体文件">
          <el-upload
            class="media-uploader"
            action="#"
            :on-success="handleMediaUploadSuccess"
            :before-upload="beforeMediaUpload"
            :file-list="tempMediaFiles"
            :multiple="true"
            :auto-upload="false"
            list-type="picture-card"
            :limit="10"
            :on-exceed="handleExceed"
          >
            <i class="el-icon-plus" />
            <div class="el-upload__text">点击上传或拖拽文件到此处</div>
            <div slot="tip" class="el-upload__tip">
              支持jpg、jpeg、png、gif、mp4等格式，单个文件不超过50MB，最多上传10个文件
            </div>
          </el-upload>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUpstreamInfo">保存</el-button>
      </div>
    </el-dialog>

    <!-- 查看上游信息对话框 -->
    <el-dialog
      :visible.sync="viewDialogVisible"
      title="查看上游信息"
      :width="'800px'"
    >
      <el-descriptions border :column="2">
        <el-descriptions-item label="信息名称">{{ viewingUpstream.name }}</el-descriptions-item>
        <el-descriptions-item label="信息类型">
          <el-tag :type="getTypeTagType(viewingUpstream.type)">
            {{ getTypeName(viewingUpstream.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="供应商">{{ viewingUpstream.supplier }}</el-descriptions-item>
        <el-descriptions-item label="供应商联系方式">{{ viewingUpstream.supplierContact || '-' }}</el-descriptions-item>
        <el-descriptions-item label="产地">{{ viewingUpstream.location || '-' }}</el-descriptions-item>
        <el-descriptions-item label="生产日期">{{ viewingUpstream.productionDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewingUpstream.createdTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ viewingUpstream.updatedTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="信息描述" :span="2">{{ viewingUpstream.description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="关联产品" :span="2">
          <div class="related-products">
            <el-tag v-for="product in viewingUpstream.relatedProducts" :key="product.id" size="small" class="mr-1 mb-1">
              {{ product.name }}
            </el-tag>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 媒体文件展示 -->
      <div v-if="viewingUpstream.media && viewingUpstream.media.length > 0" class="media-display">
        <h3 class="media-title">相关媒体文件</h3>
        <div class="media-grid">
          <div
            v-for="(item, index) in viewingUpstream.media"
            :key="index"
            class="media-item"
            @click="previewMedia(item)"
          >
            <template v-if="item.type === 'image'">
              <el-image :src="item.url" fit="cover" class="media-thumbnail" />
            </template>
            <template v-else>
              <div class="video-thumbnail">
                <el-image :src="item.thumbnailUrl" fit="cover" class="media-thumbnail" />
                <div class="play-icon">
                  <i class="el-icon-video-play" />
                </div>
              </div>
            </template>
            <div class="media-name">{{ item.name }}</div>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 媒体预览对话框 -->
    <el-dialog
      :visible.sync="previewDialogVisible"
      :title="previewMediaItem.name || '预览媒体'"
      width="800px"
    >
      <div class="preview-container">
        <template v-if="previewMediaItem.type === 'image'">
          <el-image :src="previewMediaItem.url" fit="contain" style="width: 100%; height: 500px;" />
        </template>
        <template v-else>
          <video :src="previewMediaItem.url" controls style="width: 100%; max-height: 500px;" />
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UpstreamProductionInfo',
  data() {
    return {
      // 上游信息列表
      upstreamList: [],
      // 选中的行
      selectedRows: [],
      // 搜索参数
      searchParams: {
        name: '',
        supplier: '',
        type: ''
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
      upstreamForm: {
        id: '',
        name: '',
        type: '',
        supplier: '',
        supplierContact: '',
        location: '',
        productionDate: '',
        description: '',
        relatedProducts: []
      },
      // 表单验证规则
      formRules: {
        name: [
          { required: true, message: '请输入信息名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择信息类型', trigger: 'change' }
        ],
        supplier: [
          { required: true, message: '请输入供应商名称', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入详细描述', trigger: 'blur' }
        ],
        relatedProducts: [
          { required: true, message: '请至少选择一个关联产品', trigger: 'change' }
        ]
      },
      // 临时媒体文件列表
      tempMediaFiles: [],
      // 可选择的产品列表
      availableProducts: [],
      // 查看对话框数据
      viewDialogVisible: false,
      viewingUpstream: {},
      // 预览对话框数据
      previewDialogVisible: false,
      previewMediaItem: {}
    }
  },
  computed: {
    // 过滤后的上游信息列表
    filteredUpstreamList() {
      let result = [...this.upstreamList]

      // 按名称搜索
      if (this.searchParams.name) {
        const keyword = this.searchParams.name.toLowerCase()
        result = result.filter(item => item.name.toLowerCase().includes(keyword))
      }

      // 按供应商搜索
      if (this.searchParams.supplier) {
        const keyword = this.searchParams.supplier.toLowerCase()
        result = result.filter(item => item.supplier.toLowerCase().includes(keyword))
      }

      // 按类型过滤
      if (this.searchParams.type) {
        result = result.filter(item => item.type === this.searchParams.type)
      }

      // 按创建时间倒序排列
      result.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))

      return result
    }
  },
  created() {
    this.fetchUpstreamList()
    this.fetchAvailableProducts()
  },
  methods: {
    // 获取上游信息列表
    fetchUpstreamList() {
      this.loading = true
      // 模拟API请求
      setTimeout(() => {
        this.upstreamList = [
          {
            id: '1',
            name: '优质大米原料采购',
            type: 'raw_material',
            supplier: '湖南优质农产品有限公司',
            supplierContact: '张先生 13800138001',
            location: '湖南长沙',
            productionDate: '2023-05-15',
            description: '采购自湖南优质大米种植基地，采用有机种植方式，无农药残留，品质优良。',
            relatedProducts: [
              { id: '101', name: '香泰优质大米' },
              { id: '102', name: '香泰生态米' }
            ],
            media: [
              {
                id: '1001',
                name: '种植基地全景',
                url: 'https://via.placeholder.com/800x600?text=Rice+Farm',
                type: 'image'
              },
              {
                id: '1002',
                name: '收割过程',
                url: 'https://via.placeholder.com/800x600?text=Harvesting',
                type: 'image'
              }
            ],
            mediaCount: 2,
            createdTime: '2023-05-20 14:30:00',
            updatedTime: '2023-06-05 10:15:00'
          },
          {
            id: '2',
            name: '大米加工流程',
            type: 'processing',
            supplier: '湖南香泰供应链管理有限公司',
            supplierContact: '李经理 13900139002',
            location: '湖南岳阳',
            productionDate: '2023-05-20',
            description: '采用现代化加工设备，严格按照食品加工标准进行生产，确保产品质量和安全。',
            relatedProducts: [
              { id: '101', name: '香泰优质大米' },
              { id: '102', name: '香泰生态米' }
            ],
            media: [
              {
                id: '2001',
                name: '加工车间',
                url: 'https://via.placeholder.com/800x600?text=Processing+Plant',
                type: 'image'
              },
              {
                id: '2002',
                name: '加工过程视频',
                url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                thumbnailUrl: 'https://via.placeholder.com/800x450?text=Processing+Video',
                type: 'video'
              }
            ],
            mediaCount: 2,
            createdTime: '2023-05-25 09:15:00',
            updatedTime: '2023-06-10 16:40:00'
          },
          {
            id: '3',
            name: '环保包装材料',
            type: 'packaging',
            supplier: '绿色包装科技有限公司',
            supplierContact: '王总 13700137003',
            location: '广东深圳',
            productionDate: '2023-06-01',
            description: '采用可降解环保包装材料，符合现代环保理念，对环境友好。',
            relatedProducts: [
              { id: '101', name: '香泰优质大米' },
              { id: '102', name: '香泰生态米' },
              { id: '103', name: '香泰有机大米' }
            ],
            media: [
              {
                id: '3001',
                name: '包装材料展示',
                url: 'https://via.placeholder.com/800x600?text=Packaging+Materials',
                type: 'image'
              }
            ],
            mediaCount: 1,
            createdTime: '2023-06-05 11:20:00',
            updatedTime: '2023-06-05 11:20:00'
          }
        ]
        this.loading = false
      }, 1000)
    },

    // 获取可用产品列表
    fetchAvailableProducts() {
      // 模拟API请求
      setTimeout(() => {
        this.availableProducts = [
          { id: '101', name: '香泰优质大米' },
          { id: '102', name: '香泰生态米' },
          { id: '103', name: '香泰有机大米' },
          { id: '104', name: '香泰红米' },
          { id: '105', name: '香泰糙米' }
        ]
      }, 500)
    },

    // 远程搜索产品
    remoteSearchProducts(query) {
      if (query) {
        // 模拟搜索过程
        setTimeout(() => {
          this.availableProducts = [
            { id: '101', name: '香泰优质大米' },
            { id: '102', name: '香泰生态米' },
            { id: '103', name: '香泰有机大米' },
            { id: '104', name: '香泰红米' },
            { id: '105', name: '香泰糙米' }
          ].filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
        }, 300)
      } else {
        this.fetchAvailableProducts()
      }
    },

    // 搜索
    search() {
      this.currentPage = 1 // 重置到第一页
    },

    // 重置搜索
    resetSearch() {
      this.searchParams = {
        name: '',
        supplier: '',
        type: ''
      }
      this.currentPage = 1
    },

    // 处理选择变化
    handleSelectionChange(val) {
      this.selectedRows = val
    },

    // 处理行点击
    handleRowClick(row) {
      this.$refs['upstreamTable'].toggleRowSelection(row)
    },

    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },

    handleCurrentChange(val) {
      this.currentPage = val
    },

    // 获取类型名称
    getTypeName(type) {
      const typeMap = {
        'raw_material': '原料信息',
        'processing': '加工过程',
        'packaging': '包装信息',
        'other': '其他'
      }
      return typeMap[type] || '未知类型'
    },

    // 获取类型标签类型
    getTypeTagType(type) {
      const typeTagMap = {
        'raw_material': 'success',
        'processing': 'primary',
        'packaging': 'warning',
        'other': 'info'
      }
      return typeTagMap[type] || 'default'
    },

    // 添加上游信息
    addUpstreamInfo() {
      this.isEditing = false
      this.upstreamForm = {
        id: '',
        name: '',
        type: '',
        supplier: '',
        supplierContact: '',
        location: '',
        productionDate: '',
        description: '',
        relatedProducts: []
      }
      this.tempMediaFiles = []
      this.dialogVisible = true
    },

    // 编辑上游信息
    editUpstreamInfo(row) {
      this.isEditing = true
      this.upstreamForm = JSON.parse(JSON.stringify(row))
      // 转换媒体文件为上传组件所需格式
      this.tempMediaFiles = row.media ? row.media.map(item => ({
        name: item.name,
        url: item.url,
        uid: item.id
      })) : []
      this.dialogVisible = true
    },

    // 查看上游信息
    viewUpstreamInfo(row) {
      this.viewingUpstream = JSON.parse(JSON.stringify(row))
      this.viewDialogVisible = true
    },

    // 预览媒体
    previewMedia(item) {
      this.previewMediaItem = item
      this.previewDialogVisible = true
    },

    // 文件上传前检查
    beforeMediaUpload(file) {
      // 允许的文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
      // 检查文件类型
      if (!allowedTypes.includes(file.type)) {
        this.$message.error('只支持jpg、jpeg、png、gif、mp4格式文件!')
        return false
      }
      // 检查文件大小
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        this.$message.error('文件大小不能超过50MB!')
        return false
      }
      return true
    },

    // 处理文件上传成功
    handleMediaUploadSuccess(response, file, fileList) {
      // 上传成功后的处理逻辑
    },

    // 处理文件超出限制
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制最多上传10个文件`)
    },

    // 保存上游信息
    saveUpstreamInfo() {
      this.$refs.upstreamForm.validate((valid) => {
        if (valid) {
          this.loading = true
          // 模拟保存操作
          setTimeout(() => {
            // 准备媒体数据
            const media = this.tempMediaFiles.map((file, index) => ({
              id: file.uid || Date.now() + index.toString(),
              name: file.name,
              url: file.url,
              type: file.raw ? (file.raw.type.startsWith('image/') ? 'image' : 'video')
                : (file.url.includes('.mp4') ? 'video' : 'image'),
              thumbnailUrl: file.url.includes('.mp4') ? 'https://via.placeholder.com/800x450?text=Video+Thumbnail' : undefined
            }))

            const upstreamData = {
              ...this.upstreamForm,
              media,
              mediaCount: media.length,
              updatedTime: new Date().toLocaleString('zh-CN')
            }

            if (this.isEditing) {
              // 编辑现有记录
              const index = this.upstreamList.findIndex(item => item.id === upstreamData.id)
              if (index > -1) {
                this.upstreamList.splice(index, 1, upstreamData)
              }
              this.$message.success('编辑成功')
            } else {
              // 添加新记录
              upstreamData.id = Date.now().toString()
              upstreamData.createdTime = new Date().toLocaleString('zh-CN')
              this.upstreamList.push(upstreamData)
              this.$message.success('添加成功')
            }

            this.dialogVisible = false
            this.loading = false
          }, 1000)
        }
      })
    },

    // 删除上游信息
    deleteUpstreamInfo(id) {
      this.$confirm('确定要删除这条上游信息吗？删除后将无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        // 模拟删除操作
        setTimeout(() => {
          this.upstreamList = this.upstreamList.filter(item => item.id !== id)
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

      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 条上游信息吗？删除后将无法恢复`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        // 模拟批量删除操作
        setTimeout(() => {
          const idsToDelete = this.selectedRows.map(item => item.id)
          this.upstreamList = this.upstreamList.filter(item => !idsToDelete.includes(item.id))
          this.selectedRows = []
          this.$message.success(`成功删除 ${idsToDelete.length} 条上游信息`)
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

.form-hint {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

.media-display {
  margin-top: 30px;
}

.media-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 15px;
}

.media-item {
  cursor: pointer;
  text-align: center;
}

.media-thumbnail {
  width: 100%;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.play-icon i {
  color: white;
  font-size: 18px;
}

.media-name {
  margin-top: 8px;
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.related-products {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mr-1 {
  margin-right: 8px;
}

.mb-1 {
  margin-bottom: 8px;
}
</style>
