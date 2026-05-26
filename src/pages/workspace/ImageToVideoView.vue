<script setup>
import { reactive, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { UploadFilled, VideoPlay, Download, Link, Close } from '@element-plus/icons-vue'
import { demoAssets, demoSubjects, demoHistory } from '../../utils/demoData.js'

const { t } = useI18n()
const router = useRouter()

const form = reactive({
  title: '',
  image: null,
  imagePreview: null,
  assetSource: null,
  subjectSource: null,
  script: '',
  ratio: '16:9',
  duration: 5,
})

const pageState = ref('empty') // empty | hasImage | generating | generated
const selectedAsset = ref(null)
const recentGenerations = ref([
  { id: 1, title: 'Adventure Story Opening', progress: 38, status: 'processing' },
  { id: 2, title: 'TOYOTA HIGHLAND & Product Demo Trailer', progress: 100, status: 'done' },
  { id: 3, title: 'Social Media Ad', progress: 100, status: 'done' },
])

const uploadHint = computed(() => `JPG/PNG/WebP, Max 20MB`)
const scriptCharCount = computed(() => form.script.length)
const maxChars = 2000
const assetName = computed(() => selectedAsset.value?.title || selectedAsset.value?.name || '')

function handleUpload(rawFile) {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.imagePreview = e.target.result
    form.image = rawFile
    pageState.value = 'hasImage'
  }
  reader.readAsDataURL(rawFile)
  return false
}

function chooseFromAsset() {
  if (demoAssets.length > 0) {
    selectedAsset.value = demoAssets[0]
    form.assetSource = demoAssets[0]
    form.subjectSource = null
  }
}

function chooseFromSubject() {
  if (demoSubjects.length > 0) {
    selectedAsset.value = { title: demoSubjects[0].name }
    form.subjectSource = demoSubjects[0]
    form.assetSource = null
  }
}

function removeSelectedAsset() {
  selectedAsset.value = null
  form.assetSource = null
  form.subjectSource = null
}

function generateVideo() {
  pageState.value = 'generating'
  setTimeout(() => {
    pageState.value = 'generated'
  }, 3000)
}

function formatDuration(val) {
  return `${val}s`
}
</script>

<template>
  <div class="workspace-page">
    <div class="page-heading">
      <div>
        <h1>{{ t('nav.imageToVideo') }}</h1>
        <p>{{ t('home.imageDesc') }}</p>
      </div>
    </div>

    <div class="creation-grid">
      <!-- Left: Form Panel -->
      <section class="panel form-panel">
        <h3 class="form-heading">Generate Video from Image</h3>

        <el-form label-position="top" :model="form">
          <el-form-item :label="t('workspace.title')">
            <el-input
              v-model="form.title"
              :placeholder="t('workspace.titlePlaceholder')"
            />
          </el-form-item>

          <el-form-item :label="t('workspace.uploadImage')">
            <el-upload
              drag
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleUpload"
              accept="image/jpeg,image/png,image/webp"
            >
              <template v-if="!form.imagePreview">
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">{{ t('workspace.uploadHint') }}</div>
              </template>
              <template v-else>
                <el-image :src="form.imagePreview" fit="contain" style="max-height:160px" />
                <div class="el-upload__text">{{ t('workspace.clickReplace') }}</div>
              </template>
              <template #tip>
                <div class="el-upload__tip">{{ uploadHint }}</div>
              </template>
            </el-upload>
          </el-form-item>

          <!-- Script Input -->
          <el-form-item :label="t('workspace.prompt')">
            <div class="script-input-wrapper">
              <el-input
                v-model="form.script"
                type="textarea"
                :rows="6"
                placeholder="Paste or write your script here... (max 2000 chars)"
                :maxlength="maxChars"
                show-word-limit
              />
            </div>
          </el-form-item>

          <!-- Choose from Asset Library -->
          <el-button class="source-btn" @click="chooseFromAsset">
            {{ t('workspace.chooseAsset') }}
          </el-button>

          <!-- Selected Asset Preview Card -->
          <div v-if="selectedAsset" class="asset-preview-card">
            <div class="asset-thumb">
              <el-icon :size="20"><VideoPlay /></el-icon>
            </div>
            <div class="asset-info">
              <span class="asset-name">{{ assetName }}</span>
              <span class="asset-hint">{{ t('workspace.chooseAsset') }}</span>
            </div>
            <el-button
              :icon="Close"
              circle
              size="small"
              class="asset-remove"
              @click="removeSelectedAsset"
            />
          </div>

          <!-- Choose from Subject -->
          <el-button class="source-btn" @click="chooseFromSubject">
            {{ t('workspace.chooseSubject') }}
          </el-button>

          <!-- Duration -->
          <div class="duration-section">
            <el-form-item :label="t('workspace.duration')">
              <el-slider
                v-model="form.duration"
                :min="3"
                :max="15"
                :step="1"
                :format-tooltip="formatDuration"
              />
            </el-form-item>
            <div class="slider-labels">
              <span>3s</span>
              <span>15s</span>
            </div>
          </div>

          <!-- Ratio -->
          <div class="ratio-section">
            <el-form-item :label="t('workspace.ratio')">
              <el-radio-group v-model="form.ratio">
                <el-radio-button value="16:9">16:9</el-radio-button>
                <el-radio-button value="9:16">9:16</el-radio-button>
                <el-radio-button value="1:1">1:1</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="generate-btn"
              :loading="pageState === 'generating'"
              @click="generateVideo"
            >
              {{ t('workspace.generate') }}
            </el-button>
          </el-form-item>
        </el-form>
      </section>

      <!-- Right: Preview Panel -->
      <section class="panel result-panel">
        <h3>Preview & Result</h3>

        <div class="preview-box">
          <template v-if="pageState === 'empty'">
            <el-icon><VideoPlay /></el-icon>
            <span>{{ t('workspace.noResult') }}</span>
          </template>
          <template v-else-if="pageState === 'hasImage' && form.imagePreview">
            <el-image :src="form.imagePreview" fit="contain" style="width:100%;height:100%" />
          </template>
          <template v-else-if="pageState === 'generating'">
            <el-icon class="is-loading" style="font-size:48px"><VideoPlay /></el-icon>
            <span>{{ t('workspace.generating') }}</span>
          </template>
          <template v-else-if="pageState === 'generated'">
            <div class="video-mock">
              <el-icon style="font-size:48px;color:#fff"><VideoPlay /></el-icon>
            </div>
          </template>
        </div>

        <div class="result-actions">
          <el-button type="primary" :icon="Download">
            {{ t('workspace.downloadMp4') }}
          </el-button>
          <el-button :icon="Link">
            {{ t('workspace.copyLink') }}
          </el-button>
        </div>

        <p class="quality-note">{{ t('workspace.qualityNote') }}</p>

        <div class="recent-section">
          <h4>{{ t('workspace.recentGenerations') }}</h4>
          <div
            v-for="item in recentGenerations"
            :key="item.id"
            class="recent-item"
          >
            <div class="recent-info">
              <span class="recent-title">{{ item.title }}</span>
              <span class="recent-status" :class="item.status">
                {{ item.status === 'done' ? 'finish 100%' : item.progress + '%' }}
              </span>
            </div>
            <el-progress
              :percentage="item.progress"
              :stroke-width="4"
              :color="item.status === 'done' ? '#10b981' : '#615ced'"
            />
          </div>
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
.result-panel h3 {
  margin: 0;
}

.page-heading p {
  margin: 8px 0 0;
  color: #667085;
}

.form-heading {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
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

.form-panel :deep(.el-form-item) {
  margin-bottom: 18px;
}

.source-btn {
  width: 100%;
  margin-bottom: 10px;
}

/* Asset Preview Card */
.asset-preview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  margin-bottom: 10px;
  border: 1px solid #e8ebf2;
  border-radius: 8px;
  background: #f9fafb;
}

.asset-thumb {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: linear-gradient(135deg, #dff4ff, #edf0ff);
  flex-shrink: 0;
}

.asset-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.asset-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-hint {
  font-size: 12px;
  color: #667085;
}

.asset-remove {
  flex-shrink: 0;
}

/* Duration */
.duration-section {
  margin-bottom: 18px;
}

.duration-section :deep(.el-form-item) {
  margin-bottom: 0;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #667085;
  margin-top: 4px;
}

/* Ratio */
.ratio-section {
  margin-bottom: 18px;
}

.generate-btn {
  width: 100%;
}

/* Right Panel */
.result-panel h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.preview-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  margin: 18px 0;
  border-radius: 8px;
  color: #667085;
  background: linear-gradient(135deg, #dff4ff, #edf0ff);
  overflow: hidden;
}

.preview-box .el-icon {
  font-size: 46px;
}

.video-mock {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  min-height: 240px;
  background: #1a1a2e;
  border-radius: 6px;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.result-actions .el-button {
  flex: 1;
}

.quality-note {
  margin: 10px 0 0;
  color: #667085;
  font-size: 13px;
}

.recent-section {
  margin-top: 24px;
}

.recent-section h4 {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
}

.recent-item {
  margin-bottom: 14px;
}

.recent-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.recent-title {
  font-size: 13px;
  color: #344054;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.recent-status {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.recent-status.processing {
  color: #615ced;
}

.recent-status.done {
  color: #10b981;
}

@media (max-width: 1040px) {
  .creation-grid {
    grid-template-columns: 1fr;
  }
}
</style>
