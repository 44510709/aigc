<script setup>
import { useI18n } from 'vue-i18n'
import { demoHistory } from '../../utils/demoData'

const { t } = useI18n()
</script>

<template>
  <div class="workspace-page">
    <div class="page-heading">
      <h1>{{ t('history.title') }}</h1>
      <p>{{ t('history.subtitle') }}</p>
    </div>

    <section class="panel history-panel">
      <el-table :data="demoHistory" stripe>
        <el-table-column prop="title" label="Title" min-width="220" />
        <el-table-column prop="type" label="Type" min-width="150" />
        <el-table-column prop="status" :label="t('common.status')" min-width="140" />
        <el-table-column align="right" width="160">
          <template #default>
            <el-button size="small">{{ t('common.preview') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<style scoped>
.workspace-page {
  display: grid;
  gap: 20px;
}

.page-heading h1 {
  margin: 0;
}

.page-heading p {
  margin: 8px 0 0;
  color: #667085;
}

.history-panel {
  overflow: hidden;
  padding: 8px;
}
</style>
