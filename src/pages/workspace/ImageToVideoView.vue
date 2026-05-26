<script setup>
import { reactive, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UploadFilled, VideoPlay, Download, Link, Delete } from '@element-plus/icons-vue'
import { demoAssets, demoSubjects } from '../../utils/demoData.js'

const { t } = useI18n()

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

const pageState = ref('generated') // empty | hasImage | generating | generated
const previewImage =
  'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=900&q=80'
const selectedVisualAssets = ref([
  {
    id: 1,
    title: 'TOYOTA HIGHLAND',
    caption: 'Custom Asset',
    image:
      'https://images.unsplash.com/photo-1549927681-0b673b8243ab?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 2,
    title: 'MODERN SKTLINE',
    caption: 'Custom Asset',
    image: previewImage,
  },
])
const recentGenerations = ref([
  {
    id: 1,
    title: 'Adventure Story Opening',
    time: '2 hours ago',
    progress: 38,
    status: 'processing',
    tone: 'pink',
  },
  {
    id: 2,
    title: 'Product Demo Trailer',
    time: '5 hours ago',
    progress: 100,
    status: 'done',
    tone: 'mint',
  },
  {
    id: 3,
    title: 'Social Media Ad',
    time: '1 day ago',
    progress: 100,
    status: 'done',
    tone: 'sunset',
  },
])

const uploadHint = computed(() => `JPG/PNG/WebP, Max 20MB`)
const maxChars = 2000
const scriptCharCount = computed(() => form.script.length)

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
    form.assetSource = demoAssets[0]
    form.subjectSource = null
  }
}

function chooseFromSubject() {
  if (demoSubjects.length > 0) {
    form.subjectSource = demoSubjects[0]
    form.assetSource = null
  }
}

function removeVisualAsset(id) {
  selectedVisualAssets.value = selectedVisualAssets.value.filter((asset) => asset.id !== id)
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
            <el-input v-model="form.title" placeholder="Video title" />
          </el-form-item>

          <el-form-item :label="t('workspace.uploadImage')">
            <div class="upload-shell">
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
            </div>
          </el-form-item>

          <!-- Script Input -->
          <el-form-item :label="t('workspace.prompt')">
            <div class="script-input-wrapper">
              <el-input
                v-model="form.script"
                type="textarea"
                :rows="7"
                placeholder="Paste or write your script here... (max 2000 chars)"
                :maxlength="maxChars"
              />
              <span class="script-counter">{{ scriptCharCount }} / {{ maxChars }}</span>
            </div>
          </el-form-item>

          <div class="selected-assets">
            <div
              v-for="asset in selectedVisualAssets"
              :key="asset.id"
              class="selected-asset"
            >
              <img :src="asset.image" :alt="asset.title" />
              <div class="selected-asset-name">
                <span>{{ asset.title }}</span>
                <el-button
                  :icon="Delete"
                  text
                  class="selected-asset-delete"
                  :aria-label="`Remove ${asset.title}`"
                  @click="removeVisualAsset(asset.id)"
                />
              </div>
              <p>{{ asset.caption }}</p>
            </div>
          </div>

          <!-- Choose from Asset Library -->
          <el-button class="source-btn" @click="chooseFromAsset">
            Choose from Asset Library
          </el-button>

          <!-- Choose from Subject -->
          <el-button class="source-btn" @click="chooseFromSubject">
            Choose from Subject
          </el-button>

          <!-- Ratio -->
          <div class="ratio-section">
            <el-form-item label="Video Ratio">
              <el-radio-group v-model="form.ratio">
                <el-radio-button value="16:9">16:9</el-radio-button>
                <el-radio-button value="9:16">9:16</el-radio-button>
                <el-radio-button value="1:1">1:1</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </div>

          <!-- Duration -->
          <div class="duration-section">
            <el-form-item :label="`Duration: ${form.duration}s`">
              <el-slider
                v-model="form.duration"
                :min="3"
                :max="30"
                :step="1"
                :format-tooltip="formatDuration"
              />
            </el-form-item>
            <div class="slider-labels">
              <span>3s</span>
              <span>30s</span>
            </div>
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
      <div class="result-stack">
        <section class="panel result-panel">
          <h3>Preview & Result</h3>

          <div class="preview-box">
            <template v-if="pageState === 'generating'">
              <el-icon class="is-loading"><VideoPlay /></el-icon>
              <span>{{ t('workspace.generating') }}</span>
            </template>
            <template v-else>
              <img :src="form.imagePreview || previewImage" alt="Generated city preview" />
              <button class="play-button" type="button" aria-label="Play preview">
                <el-icon><VideoPlay /></el-icon>
              </button>
            </template>
          </div>

          <div class="result-actions">
            <el-button type="success" :icon="Download">
              {{ t('workspace.downloadMp4') }}
            </el-button>
            <el-button :icon="Link">
              {{ t('workspace.copyLink') }}
            </el-button>
          </div>

          <p class="quality-note">{{ t('workspace.qualityNote') }}</p>
        </section>

        <section class="panel recent-section">
          <h4>{{ t('workspace.recentGenerations') }}</h4>
          <div
            v-for="item in recentGenerations"
            :key="item.id"
            class="recent-item"
          >
            <div class="recent-thumb" :class="item.tone"></div>
            <div class="recent-info">
              <span class="recent-title">{{ item.title }}</span>
              <span class="recent-time">{{ item.time }}</span>
            </div>
            <span class="recent-status" :class="item.status">
              {{ item.status === 'done' ? 'finish 100%' : item.progress + '%' }}
            </span>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workspace-page {
  display: grid;
  gap: 24px;
  width: 100%;
  max-width: 1120px;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e6e9f2;
}

.page-heading h1,
.result-panel h3 {
  margin: 0;
}

.page-heading h1 {
  color: #1d2433;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 750;
}

.page-heading p {
  margin: 7px 0 0;
  color: #596579;
  font-size: 14px;
}

.form-heading {
  margin: 0 0 12px;
  font-size: 18px;
  line-height: 1.25;
  font-weight: 750;
  color: #202536;
}

.creation-grid {
  display: grid;
  align-items: start;
  gap: 44px;
  grid-template-columns: minmax(360px, 428px) minmax(360px, 432px);
  justify-content: start;
}

.form-panel,
.result-panel {
  padding: 22px 20px 18px;
  box-shadow: 0 1px 3px rgba(18, 27, 43, 0.08);
}

.form-panel :deep(.el-form-item) {
  margin-bottom: 10px;
}

.form-panel :deep(.el-form-item__label) {
  margin-bottom: 5px;
  color: #4b5565;
  font-size: 12px;
  line-height: 1.3;
  font-weight: 750;
}

.form-panel :deep(.el-input__wrapper) {
  min-height: 40px;
  border-radius: 9px;
  box-shadow: 0 0 0 1px #d2d8e2 inset;
}

.form-panel :deep(.el-input__inner::placeholder),
.form-panel :deep(.el-textarea__inner::placeholder) {
  color: #9aa4b2;
}

.upload-shell {
  width: 100%;
}

.form-panel :deep(.el-upload),
.form-panel :deep(.el-upload--text),
.form-panel :deep(.el-upload.is-drag),
.form-panel :deep(.el-upload-dragger) {
  display: block;
  width: 100% !important;
}

.form-panel :deep(.el-upload-dragger) {
  display: grid;
  min-height: 132px;
  place-items: center;
  padding: 22px;
  border: 1px dashed #c6ced9;
  border-radius: 10px;
  background: #fff;
}

.form-panel :deep(.el-icon--upload) {
  margin: 0 0 7px;
  color: #9aa3af;
  font-size: 34px;
  line-height: 1;
}

.form-panel :deep(.el-upload__text) {
  color: #4e5969;
  font-size: 13px;
}

.form-panel :deep(.el-upload__tip) {
  margin-top: 6px;
  color: #697587;
  font-size: 10px;
  line-height: 1.1;
  text-align: center;
}

.script-input-wrapper {
  position: relative;
  width: 100%;
}

.script-input-wrapper :deep(.el-textarea__inner) {
  height: 132px !important;
  min-height: 132px !important;
  padding: 13px 14px 26px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #d2d8e2 inset;
  resize: none;
}

.script-counter {
  position: absolute;
  right: 10px;
  bottom: 9px;
  color: #7b8494;
  font-size: 10px;
  line-height: 1;
}

.selected-assets {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  min-height: 104px;
  padding: 2px 12px 5px;
}

.selected-asset {
  width: 118px;
  min-width: 0;
  text-align: center;
}

.selected-asset img {
  display: block;
  width: 84px;
  height: 58px;
  margin: 0 auto 3px;
  object-fit: cover;
}

.selected-asset-name {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 0;
}

.selected-asset-name span {
  min-width: 0;
  overflow: hidden;
  color: #1f2937;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-asset p {
  margin: 2px 0 0;
  color: #b2b8c3;
  font-size: 11px;
  line-height: 1.2;
}

.selected-asset-delete {
  width: 16px;
  height: 16px;
  min-height: 16px;
  min-width: 16px;
  margin-left: 0;
  padding: 0;
  color: #e11d2e;
  font-size: 13px;
  flex: 0 0 auto;
}

.source-btn {
  width: 100%;
  height: 30px;
  margin-bottom: 4px;
  border-color: #d0d6df;
  border-radius: 3px;
  color: #4b5565;
  font-size: 12px;
  font-weight: 650;
}

/* Ratio */
.ratio-section {
  margin: -3px 0 8px;
}

.ratio-section :deep(.el-form-item) {
  margin-bottom: 0;
}

.ratio-section :deep(.el-radio-group) {
  overflow: hidden;
  padding: 4px;
  border-radius: 9px;
  background: #f1f3f7;
}

.ratio-section :deep(.el-radio-button__inner) {
  min-width: 50px;
  height: 31px;
  padding: 0 13px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #111827;
  font-size: 12px;
  font-weight: 750;
  line-height: 31px;
  box-shadow: none;
}

.ratio-section :deep(.el-radio-button:first-child .el-radio-button__inner),
.ratio-section :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 7px;
}

.ratio-section :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #fff;
  color: #111827;
  box-shadow: 0 1px 3px rgba(18, 27, 43, 0.1);
}

.duration-section {
  margin-bottom: 8px;
  padding: 0 4px;
}

.duration-section :deep(.el-form-item) {
  margin-bottom: 0;
}

.duration-section :deep(.el-slider) {
  --el-slider-main-bg-color: #1d8cff;
  --el-slider-runway-bg-color: #e5e5e5;
  height: 22px;
}

.duration-section :deep(.el-slider__runway) {
  height: 6px;
  border-radius: 999px;
}

.duration-section :deep(.el-slider__button) {
  width: 13px;
  height: 13px;
  border: 0;
  background: #1687f8;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: -2px;
  color: #7b8494;
  font-size: 10px;
}

.generate-btn {
  width: 100%;
  height: 38px;
  border-radius: 3px;
  background: #2f63e6;
  font-weight: 750;
}

/* Right Panel */
.result-stack {
  display: grid;
  gap: 22px;
}

.result-panel h3 {
  color: #202536;
  font-size: 18px;
  font-weight: 750;
  margin-bottom: 18px;
}

.preview-box {
  position: relative;
  display: grid;
  aspect-ratio: 16 / 9;
  min-height: 216px;
  place-items: center;
  margin: 0 0 20px;
  padding: 5px 14px;
  border-radius: 8px;
  color: #667085;
  background: #d8f7ff;
  overflow: hidden;
}

.preview-box img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-button {
  position: absolute;
  inset: 50% auto auto 50%;
  display: grid;
  width: 50px;
  height: 50px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #fff;
  color: #17537d;
  cursor: pointer;
  transform: translate(-50%, -50%);
  place-items: center;
  box-shadow: 0 8px 18px rgba(16, 24, 40, 0.2);
}

.play-button .el-icon {
  margin-left: 3px;
  font-size: 26px;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.result-actions .el-button {
  flex: 1;
  height: 32px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 750;
}

.result-actions :deep(.el-button--success) {
  --el-button-bg-color: #19a94f;
  --el-button-border-color: #19a94f;
  --el-button-hover-bg-color: #148d43;
  --el-button-hover-border-color: #148d43;
}

.result-actions .el-button:not(.el-button--success) {
  border-color: #4b5565;
  background: #4b5565;
  color: #fff;
}

.quality-note {
  margin: 13px 0 0;
  color: #5d6878;
  font-size: 11px;
  text-align: center;
}

.recent-section {
  padding: 23px 25px 18px;
  box-shadow: 0 1px 3px rgba(18, 27, 43, 0.06);
}

.recent-section h4 {
  margin: 0 0 21px;
  color: #202536;
  font-size: 13px;
  font-weight: 750;
}

.recent-item {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  min-height: 56px;
  margin-bottom: 8px;
}

.recent-thumb {
  width: 52px;
  height: 38px;
  border-radius: 6px;
}

.recent-thumb.pink {
  background: linear-gradient(135deg, #e9c8f3, #f7c8de);
}

.recent-thumb.mint {
  background: linear-gradient(135deg, #acd9ff, #b8f4c9);
}

.recent-thumb.sunset {
  background: linear-gradient(135deg, #ffef84, #ffb4bd);
}

.recent-info {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.recent-title {
  overflow: hidden;
  color: #202536;
  font-size: 12px;
  font-weight: 750;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-time {
  color: #7b8494;
  font-size: 10px;
  line-height: 1.2;
}

.recent-status {
  color: #101828;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

@media (max-width: 1040px) {
  .workspace-page {
    max-width: 760px;
  }

  .creation-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .workspace-page {
    gap: 18px;
  }

  .creation-grid {
    gap: 18px;
    grid-template-columns: minmax(0, 1fr);
  }

  .selected-assets {
    gap: 18px;
    justify-content: space-around;
    padding-inline: 0;
  }

  .result-actions {
    flex-direction: column;
  }
}
</style>
