<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const form = reactive({ script: '', style: 'documentary', duration: 8 })
</script>

<template>
  <div class="workspace-page">
    <div class="page-heading">
      <div>
        <h1>{{ t('nav.scriptToVideo') }}</h1>
        <p>{{ t('home.scriptDesc') }}</p>
      </div>
      <el-button type="primary">{{ t('workspace.generate') }}</el-button>
    </div>

    <div class="script-grid">
      <section class="panel form-panel">
        <el-form label-position="top" :model="form">
          <el-form-item :label="t('workspace.prompt')">
            <el-input
              v-model="form.script"
              type="textarea"
              :rows="14"
              :placeholder="t('workspace.scriptPlaceholder')"
            />
          </el-form-item>
          <div class="inline-fields">
            <el-form-item :label="t('workspace.style')">
              <el-select v-model="form.style">
                <el-option label="Documentary" value="documentary" />
                <el-option label="Commercial" value="commercial" />
                <el-option label="Social Short" value="social" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('workspace.duration')">
              <el-input-number v-model="form.duration" :min="5" :max="60" />
            </el-form-item>
          </div>
        </el-form>
      </section>

      <section class="panel scene-panel">
        <h2>{{ t('workspace.sceneList') }}</h2>
        <el-timeline>
          <el-timeline-item timestamp="Scene 01">Opening visual and title.</el-timeline-item>
          <el-timeline-item timestamp="Scene 02">Main story with camera movement.</el-timeline-item>
          <el-timeline-item timestamp="Scene 03">Closing shot and call to action.</el-timeline-item>
        </el-timeline>
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
.scene-panel h2 {
  margin: 0;
}

.page-heading p {
  margin: 8px 0 0;
  color: #667085;
}

.script-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) 360px;
}

.form-panel,
.scene-panel {
  padding: 20px;
}

.inline-fields {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 220px));
}

@media (max-width: 980px) {
  .script-grid,
  .inline-fields {
    grid-template-columns: 1fr;
  }
}
</style>
