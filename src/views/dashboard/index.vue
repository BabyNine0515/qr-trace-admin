<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 总销售额 -->
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card">
          <div class="card-content">
            <div class="left">
              <div class="title">总销售额</div>
              <div class="value">¥56,086</div>
              <div class="footer">
                <span class="trend">同比上涨 12%</span>
              </div>
            </div>
            <div class="right">
              <i class="el-icon-s-data" style="font-size: 48px; color: #409EFF;" />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 用户数量 -->
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card">
          <div class="card-content">
            <div class="left">
              <div class="title">用户数量</div>
              <div class="value">992</div>
              <div class="footer">
                <span class="trend">同比增长 8%</span>
              </div>
            </div>
            <div class="right">
              <i class="el-icon-user" style="font-size: 48px; color: #67C23A;" />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 总支付笔数 -->
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card">
          <div class="card-content">
            <div class="left">
              <div class="title">总支付笔数</div>
              <div class="value">7</div>
              <div class="footer">
                <span class="trend down">同比下降 5%</span>
              </div>
            </div>
            <div class="right">
              <i class="el-icon-sold-out" style="font-size: 48px; color: #E6A23C;" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 销售额统计 -->
      <el-col :xs="24" :sm="12">
        <el-card header="销售额统计">
          <div class="detail-stats">
            <div class="detail-item">
              <span>今日销售额</span>
              <span class="detail-value">¥0</span>
            </div>
            <div class="detail-item">
              <span>昨日销售额</span>
              <span class="detail-value">¥0</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 支付笔数统计 -->
      <el-col :xs="24" :sm="12">
        <el-card header="支付笔数统计">
          <div class="detail-stats">
            <div class="detail-item">
              <span>今日支付笔数</span>
              <span class="detail-value">0笔</span>
            </div>
            <div class="detail-item">
              <span>昨日支付笔数</span>
              <span class="detail-value">0笔</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
// 不需要导入 icons，直接使用 Element UI 内置的图标类名
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.value {
  color: #303133;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.footer {
  font-size: 12px;
}

.trend {
  color: #F56C6C;
}

.trend.down {
  color: #67C23A;
}

.detail-stats {
  padding: 10px 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-value {
  font-weight: 600;
  color: #303133;
}
</style>
