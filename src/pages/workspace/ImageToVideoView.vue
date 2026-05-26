<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { UploadFilled, VideoPlay } from '@element-plus/icons-vue'

const { t } = useI18n()

const form = reactive({
  prompt: '',
  style: 'cinematic',
  duration: 5,
  ratio: '16:9',
})
</script>

<template>
  <div class="workspace-page">
    <div class="page-heading">
      <div>
        <h1>{{ t('nav.imageToVideo') }}</h1>
        <p>{{ t('home.imageDesc') }}</p>
      </div>
      <el-button type="primary">{{ t('workspace.generate') }}</el-button>
    </div>

    <div class="creation-grid">
      <section class="panel form-panel">
        <el-form label-position="top" :model="form">
          <el-form-item :label="t('workspace.uploadImage')">
            <el-upload drag action="#" :auto-upload="false">
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">{{ t('workspace.uploadHint') }}</div>
            </el-upload>
          </el-form-item>

          <el-form-item :label="t('workspace.prompt')">
            <el-input
              v-model="form.prompt"
              type="textarea"
              :rows="5"
              :placeholder="t('workspace.promptPlaceholder')"
            />
          </el-form-item>

          <div class="inline-fields">
            <el-form-item :label="t('workspace.style')">
              <el-select v-model="form.style">
                <el-option label="Cinematic" value="cinematic" />
                <el-option label="Anime" value="anime" />
                <el-option label="Commercial" value="commercial" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('workspace.duration')">
              <el-input-number v-model="form.duration" :min="3" :max="15" />
            </el-form-item>
            <el-form-item :label="t('workspace.ratio')">
              <el-select v-model="form.ratio">
                <el-option label="16:9" value="16:9" />
                <el-option label="9:16" value="9:16" />
                <el-option label="1:1" value="1:1" />
              </el-select>
            </el-form-item>
          </div>
        </el-form>
      </section>

      <section class="panel result-panel">
        <h2>{{ t('workspace.outputPreview') }}</h2>
        <div class="preview-box">
          <el-icon><VideoPlay /></el-icon>
          <span>{{ t('workspace.noResult') }}</span>
        </div>
        <div class="result-actions">
          <el-button type="success">{{ t('common.download') }}</el-button>
          <el-button>{{ t('common.preview') }}</el-button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.workspace-page {
  display: grid;
  gap: 20px;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.page-heading h1,
.result-panel h2 {
  margin: 0;
}

.page-heading p {
  margin: 8px 0 0;
  color: #667085;
}

.creation-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) 380px;
}

.form-panel,
.result-panel {
  padding: 20px;
}

.inline-fields {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, 1fr);
}

.preview-box {
  display: grid;
  min-height: 280px;
  margin: 18px 0;
  place-items: center;
  border-radius: 8px;
  color: #667085;
  background: linear-gradient(135deg, #dff4ff, #edf0ff);
}

.preview-box .el-icon {
  font-size: 46px;
}

.result-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 1040px) {
  .creation-grid,
  .inline-fields {
    grid-template-columns: 1fr;
  }
}
</style>
