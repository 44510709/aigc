<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { UploadFilled } from '@element-plus/icons-vue'

const { t } = useI18n()
const form = reactive({ name: '', description: '', progress: 20 })
</script>

<template>
  <div class="create-grid">
    <section class="panel form-panel">
      <h1>{{ t('subjects.create') }}</h1>
      <el-form label-position="top" :model="form">
        <el-form-item :label="t('subjects.name')">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="t('subjects.description')">
          <el-input v-model="form.description" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item :label="t('subjects.upload')">
          <el-upload drag action="#" :auto-upload="false">
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">{{ t('workspace.uploadHint') }}</div>
          </el-upload>
        </el-form-item>
        <el-button type="primary">{{ t('subjects.startTraining') }}</el-button>
      </el-form>
    </section>

    <aside class="panel tip-panel">
      <h2>Tips</h2>
      <p>Use clear front, side, and detail references to keep generated subjects consistent.</p>
      <el-progress :percentage="form.progress" />
    </aside>
  </div>
</template>

<style scoped>
.create-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) 320px;
}

.form-panel,
.tip-panel {
  padding: 20px;
}

.form-panel h1,
.tip-panel h2 {
  margin: 0 0 20px;
}

.tip-panel p {
  color: #667085;
}

@media (max-width: 920px) {
  .create-grid {
    grid-template-columns: 1fr;
  }
}
</style>
