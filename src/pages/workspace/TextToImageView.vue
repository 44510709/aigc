<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  UploadFilled,
  Picture as PictureIcon,
  Download,
  Link,
  Delete,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  CircleCheckFilled,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { uploadFile } from '../../api/modules/assets.js'
import { createTextToImage, getImageList, getImageDetail } from '../../api/modules/image.js'

const { t } = useI18n()
const router = useRouter()

const form = reactive({
  title: '',
  prompt: '',
  images: [], // File objects
  imagePreviews: [], // base64 preview urls
  resolution: '2K',
  customWidth: 2048,
  customHeight: 2048,
  aspectRatio: '1:1',
  count: 1,
})

const MAX_IMAGES = 15
const MIN_COUNT = 1
const MAX_COUNT = 4

const pageState = ref('empty') // empty | generating | generated

// multi-select state for reference images
const isSelectMode = ref(false)
const selectedIndices = ref([])

function toggleSelectMode() {
  isSelectMode.value = !isSelectMode.value
  if (!isSelectMode.value) selectedIndices.value = []
}

function toggleSelect(idx) {
  const i = selectedIndices.value.indexOf(idx)
  if (i > -1) selectedIndices.value.splice(i, 1)
  else selectedIndices.value.push(idx)
}

function deleteSelected() {
  if (selectedIndices.value.length === 0) {
    ElMessage.warning(t('workspace.msg.pleaseSelectToDelete'))
    return
  }
  const set = new Set(selectedIndices.value)
  form.images = form.images.filter((_, i) => !set.has(i))
  form.imagePreviews = form.imagePreviews.filter((_, i) => !set.has(i))
  selectedIndices.value = []
  isSelectMode.value = false
}

function handleUpload(uploadFile) {
  const rawFile = uploadFile.raw
  if (!rawFile || typeof rawFile.arrayBuffer !== 'function') return
  if (form.imagePreviews.length >= MAX_IMAGES) {
    ElMessage.warning(t('workspace.msg.maxImagesReached', { count: MAX_IMAGES }))
    return false
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    form.imagePreviews.push(e.target.result)
    form.images.push(rawFile)
  }
  reader.readAsDataURL(rawFile)
  return false
}

function removeImage(index) {
  form.images.splice(index, 1)
  form.imagePreviews.splice(index, 1)
}

// count stepper
function incCount() {
  if (form.count < MAX_COUNT) form.count += 1
}
function decCount() {
  if (form.count > MIN_COUNT) form.count -= 1
}

// resolution change
function onResolutionChange(val) {
  if (val === '2K') {
    form.customWidth = 2048
    form.customHeight = 2048
    if (form.aspectRatio === '1:1') form.customHeight = 2048
    else if (form.aspectRatio === '16:9') { form.customWidth = 2560; form.customHeight = 1440 }
    else if (form.aspectRatio === '9:16') { form.customWidth = 1440; form.customHeight = 2560 }
    else if (form.aspectRatio === '4:3') { form.customWidth = 2304; form.customHeight = 1728 }
    else if (form.aspectRatio === '3:4') { form.customWidth = 1728; form.customHeight = 2304 }
  } else if (val === '4K') {
    if (form.aspectRatio === '1:1') { form.customWidth = 4096; form.customHeight = 4096 }
    else if (form.aspectRatio === '16:9') { form.customWidth = 3840; form.customHeight = 2160 }
    else if (form.aspectRatio === '9:16') { form.customWidth = 2160; form.customHeight = 3840 }
    else if (form.aspectRatio === '4:3') { form.customWidth = 3840; form.customHeight = 2880 }
    else if (form.aspectRatio === '3:4') { form.customWidth = 2880; form.customHeight = 3840 }
  }
}

function onAspectRatioChange(val) {
  if (form.resolution === '2K') {
    if (val === '1:1') { form.customWidth = 2048; form.customHeight = 2048 }
    else if (val === '16:9') { form.customWidth = 2560; form.customHeight = 1440 }
    else if (val === '9:16') { form.customWidth = 1440; form.customHeight = 2560 }
    else if (val === '4:3') { form.customWidth = 2304; form.customHeight = 1728 }
    else if (val === '3:4') { form.customWidth = 1728; form.customHeight = 2304 }
  } else if (form.resolution === '4K') {
    if (val === '1:1') { form.customWidth = 4096; form.customHeight = 4096 }
    else if (val === '16:9') { form.customWidth = 3840; form.customHeight = 2160 }
    else if (val === '9:16') { form.customWidth = 2160; form.customHeight = 3840 }
    else if (val === '4:3') { form.customWidth = 3840; form.customHeight = 2880 }
    else if (val === '3:4') { form.customWidth = 2880; form.customHeight = 3840 }
  } else {
    // custom — only adjust aspect ratio if user hasn't manually changed (heuristic: keep current)
  }
}

const aspectOptions = computed(() => [
  { label: t('workspace.aspectSquare'), value: '1:1' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
])

// generated images and carousel
const generatedImages = ref([]) // [{ url, name }]
const currentIndex = ref(0)
const currentImage = computed(() => generatedImages.value[currentIndex.value] || null)
const showResult = computed(() => pageState.value === 'generated' && generatedImages.value.length > 0)

function prevImage() {
  if (generatedImages.value.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + generatedImages.value.length) % generatedImages.value.length
}
function nextImage() {
  if (generatedImages.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % generatedImages.value.length
}

// swipe support
let touchStartX = 0
let touchEndX = 0
function onTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX
}
function onTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX
  const dx = touchEndX - touchStartX
  if (Math.abs(dx) < 50) return
  if (dx < 0) nextImage()
  else prevImage()
}

async function generateImages() {
  if (!form.title) {
    ElMessage.warning(t('workspace.msg.fillTitle'))
    return
  }
  if (!form.prompt) {
    ElMessage.warning(t('workspace.msg.fillPrompt'))
    return
  }
  pageState.value = 'generating'

  try {
    const payload = {
      title: form.title,
      prompt: form.prompt,
      resolution: form.resolution,
      width: form.customWidth,
      height: form.customHeight,
      aspectRatio: form.aspectRatio,
      count: form.count,
    }
    if (form.images.length > 0) {
      const urls = []
      for (const file of form.images) {
        const uploadRes = await uploadFile(file)
        const url = uploadRes?.data?.url || uploadRes?.data || uploadRes?.url
        if (!url) {
          pageState.value = 'empty'
          ElMessage.error(t('workspace.msg.refImageUploadFailed'))
          return
        }
        urls.push(url)
      }
      payload.referenceUrls = urls
    }

    const res = await createTextToImage(payload)
    if (res.code === 0 || res.code === 200) {
      if (res.data != null) {
        const id = typeof res.data === 'object' ? (res.data.id || res.data.imageId) : res.data
        if (id) {
          startPolling(id)
        } else if (typeof res.data === 'object' && Array.isArray(res.data.urls)) {
          // immediate result with urls
          finishWithUrls(res.data.urls)
        } else {
          pageState.value = 'empty'
          ElMessage.error(t('workspace.msg.noTaskId'))
        }
      } else {
        pageState.value = 'empty'
        ElMessage.error(res.msg || t('workspace.msg.generateFailed'))
      }
    } else {
      pageState.value = 'empty'
      ElMessage.error(res.msg || t('workspace.msg.generateFailed'))
    }
  } catch (err) {
    pageState.value = 'empty'
    console.error('createTextToImage error:', err)
    const msg = err?.response?.data?.msg || err?.msg || err?.message || t('workspace.msg.generateFailed')
    ElMessage.error(msg)
  }
}

let pollingTimer = null

function startPolling(taskId) {
  pollingTimer = setInterval(() => {
    getImageDetail(taskId).then(res => {
      if ((res.code === 0 || res.code === 200) && res.data) {
        const item = res.data
        // status: 0=待处理, 1=处理中, 2=已完成, 3=失败
        if (item.status === 2) {
          clearInterval(pollingTimer)
          pollingTimer = null
          const urls = Array.isArray(item.imageUrls)
            ? item.imageUrls
            : (item.imageUrl ? [item.imageUrl] : [])
          if (urls.length > 0) finishWithUrls(urls, item.title || form.title)
          else { pageState.value = 'empty'; ElMessage.error(t('workspace.msg.noImageUrl')) }
        } else if (item.status === 3) {
          clearInterval(pollingTimer)
          pollingTimer = null
          pageState.value = 'empty'
          ElMessage.error(item.errorMsg || t('workspace.msg.imageGenerateFailed'))
        }
      }
    }).catch(() => {})
  }, 2000)
}

function finishWithUrls(urls, name) {
  generatedImages.value = urls.map((u, i) => ({
    url: u,
    name: `${name || form.title || 'image'}-${i + 1}`,
  }))
  currentIndex.value = 0
  pageState.value = 'generated'
  ElMessage.success(t('workspace.msg.imageGenerateSuccess'))
  fetchRecentGenerations()
}

function handleDownload() {
  const cur = currentImage.value
  if (!cur) return
  const link = document.createElement('a')
  link.href = cur.url
  link.download = cur.name + '.png'
  link.click()
}

async function handleCopyLink() {
  const cur = currentImage.value
  if (!cur) return
  try {
    await navigator.clipboard.writeText(cur.url)
    ElMessage.success(t('workspace.msg.linkCopied'))
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = cur.url
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success(t('workspace.msg.linkCopied'))
  }
}

// recent generations
const recentGenerations = ref([])
function fetchRecentGenerations() {
  getImageList({ pageSize: 10 }).then(res => {
    if ((res.code === 0 || res.code === 200) && res.data?.rows) {
      recentGenerations.value = res.data.rows.map(item => ({
        id: item.id,
        title: item.title,
        time: item.createTime ? formatTime(item.createTime) : '',
        progress: item.status === 2 ? 100 : (item.status === 1 ? 50 : 0),
        status: item.status === 2 ? 'done' : (item.status === 1 ? 'processing' : 'pending'),
        tone: ['pink', 'mint', 'sunset'][item.id % 3],
        url: item.imageUrl || (Array.isArray(item.imageUrls) ? item.imageUrls[0] : ''),
      }))
    }
  })
}

function formatTime(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}

function goToHistory() {
  router.push({ name: 'history' })
}

onMounted(() => {
  fetchRecentGenerations()
})

onUnmounted(() => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
})
</script>

<template>
  <div class="workspace-page">
    <div class="page-heading">
      <div>
        <h1>{{ t('workspace.textToImageTitle') }}</h1>
        <p>{{ t('workspace.textToImageSubtitle') }}</p>
      </div>
    </div>

    <div class="creation-grid">
      <!-- Left: Form Panel -->
      <section class="panel form-panel">
        <el-form label-position="top" :model="form">
          <el-form-item :label="t('workspace.title')">
            <el-input v-model="form.title" :placeholder="t('workspace.textToImageTitlePlaceholder')" />
          </el-form-item>

          <el-form-item :label="t('workspace.prompt')">
            <el-input
              v-model="form.prompt"
              type="textarea"
              :rows="5"
              :placeholder="t('workspace.textToImagePromptPlaceholder')"
              :maxlength="2000"
              show-word-limit
            />
          </el-form-item>

          <el-form-item :label="t('workspace.referenceImages')">
            <div class="upload-shell">
              <el-upload
                drag
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleUpload"
                accept="image/jpeg,image/png,image/webp"
                multiple
              >
                <template v-if="form.imagePreviews.length === 0">
                  <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                  <div class="el-upload__text">{{ t('workspace.referenceImagesHint') }}</div>
                </template>
                <template v-else>
                  <div class="upload-actions">
                    <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                    <div class="el-upload__text">{{ t('workspace.clickReplace') }}</div>
                  </div>
                </template>
                <template #tip>
                  <div class="el-upload__tip">{{ t('workspace.referenceImagesTip') }}</div>
                </template>
              </el-upload>

              <div v-if="form.imagePreviews.length > 0" class="ref-toolbar">
                <el-button size="small" plain @click="toggleSelectMode">
                  {{ isSelectMode ? t('common.cancel') : t('workspace.select') }}
                </el-button>
                <el-button
                  v-if="isSelectMode"
                  size="small"
                  type="danger"
                  plain
                  :icon="Delete"
                  @click="deleteSelected"
                >
                  {{ t('workspace.deleteSelected', { count: selectedIndices.length }) }}
                </el-button>
                <span class="ref-count">{{ form.imagePreviews.length }} / {{ MAX_IMAGES }}</span>
              </div>

              <div v-if="form.imagePreviews.length > 0" class="image-grid">
                <div
                  v-for="(src, i) in form.imagePreviews"
                  :key="i"
                  class="image-thumb"
                  :class="{ selected: selectedIndices.includes(i), 'select-mode': isSelectMode }"
                  @click="isSelectMode && toggleSelect(i)"
                >
                  <el-image :src="src" fit="cover" />
                  <div v-if="isSelectMode" class="select-mask">
                    <el-icon v-if="selectedIndices.includes(i)" class="check"><CircleCheckFilled /></el-icon>
                  </div>
                  <el-button
                    v-if="!isSelectMode"
                    class="remove-btn"
                    size="small"
                    circle
                    @click.stop="removeImage(i)"
                  >×</el-button>
                </div>
              </div>
            </div>
          </el-form-item>

          <div class="generation-options">
            <el-form-item :label="t('workspace.resolution')">
              <el-radio-group v-model="form.resolution" @change="onResolutionChange">
                <el-radio-button value="2K">{{ t('workspace.resolution2K') }}</el-radio-button>
                <el-radio-button value="4K">{{ t('workspace.resolution4K') }}</el-radio-button>
                <el-radio-button value="custom">{{ t('workspace.resolutionCustom') }}</el-radio-button>
              </el-radio-group>
              <div class="resolution-size">
                <el-input-number
                  v-model="form.customWidth"
                  :min="256"
                  :max="8192"
                  :step="64"
                  size="small"
                  controls-position="right"
                />
                <span class="size-x">×</span>
                <el-input-number
                  v-model="form.customHeight"
                  :min="256"
                  :max="8192"
                  :step="64"
                  size="small"
                  controls-position="right"
                />
                <span class="size-unit">px</span>
              </div>
            </el-form-item>

            <el-form-item :label="t('workspace.aspectRatio')">
              <el-select v-model="form.aspectRatio" class="aspect-select" @change="onAspectRatioChange">
                <el-option
                  v-for="opt in aspectOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item :label="t('workspace.numberOfImages')">
              <div class="count-stepper">
                <el-button class="step-btn" :disabled="form.count <= MIN_COUNT" @click="decCount">
                  <el-icon><Minus /></el-icon>
                </el-button>
                <span class="step-value">{{ form.count }}</span>
                <el-button class="step-btn" :disabled="form.count >= MAX_COUNT" @click="incCount">
                  <el-icon><Plus /></el-icon>
                </el-button>
              </div>
            </el-form-item>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="generate-btn"
              :loading="pageState === 'generating'"
              @click="generateImages"
            >
              {{ t('workspace.generateImg') }}
            </el-button>
          </el-form-item>
        </el-form>
      </section>

      <!-- Right: Preview + Recent -->
      <div class="result-stack">
        <section class="panel result-panel">
          <h3>{{ t('workspace.outputPreview') }}</h3>

          <div
            class="preview-box"
            @touchstart.passive="onTouchStart"
            @touchend.passive="onTouchEnd"
          >
            <template v-if="pageState === 'generating'">
              <el-icon class="is-loading"><PictureIcon /></el-icon>
              <span>{{ t('workspace.generatingImg') }}</span>
            </template>
            <template v-else-if="showResult">
              <img :src="currentImage.url" :alt="currentImage.name" class="result-image" />
              <button
                v-if="generatedImages.length > 1"
                class="nav-btn nav-prev"
                :aria-label="'Previous image'"
                @click="prevImage"
              >
                <el-icon><ArrowLeft /></el-icon>
              </button>
              <button
                v-if="generatedImages.length > 1"
                class="nav-btn nav-next"
                :aria-label="'Next image'"
                @click="nextImage"
              >
                <el-icon><ArrowRight /></el-icon>
              </button>
              <div v-if="generatedImages.length > 1" class="indicator">
                {{ currentIndex + 1 }} / {{ generatedImages.length }}
              </div>
            </template>
            <template v-else>
              <span class="empty-tip">{{ t('workspace.noResultImg') }}</span>
            </template>
          </div>

          <div v-if="showResult" class="result-actions">
            <el-button type="success" :icon="Download" @click="handleDownload">
              {{ t('workspace.downloadImg') }}
            </el-button>
            <el-button :icon="Link" @click="handleCopyLink">
              {{ t('workspace.copyLink') }}
            </el-button>
          </div>

          <p v-if="showResult" class="quality-note">
            {{ form.customWidth }} × {{ form.customHeight }}
          </p>
        </section>

        <section class="panel recent-section">
          <div class="recent-header">
            <h4>{{ t('workspace.recentGenerations') }}</h4>
            <span class="view-more" @click="goToHistory">{{ t('common.viewMore') }} &gt;</span>
          </div>
          <div
            v-for="item in recentGenerations"
            :key="item.id"
            class="recent-item"
          >
            <div v-if="item.url" class="recent-thumb">
              <img :src="item.url" :alt="item.title" />
            </div>
            <div v-else class="recent-thumb" :class="item.tone"></div>
            <div class="recent-info">
              <span class="recent-title">{{ item.title }}</span>
              <span class="recent-time">{{ item.time }}</span>
            </div>
            <div class="recent-actions">
              <el-button v-if="item.url" size="small" :icon="Download" circle @click="() => { if(item.url) { const l = document.createElement('a'); l.href = item.url; l.download = item.title + '.png'; l.click() } }"></el-button>
              <el-button v-if="item.url" size="small" :icon="Link" circle @click="() => { if(item.url) { navigator.clipboard.writeText(item.url); ElMessage.success(t('workspace.msg.linkCopied')) } }"></el-button>
              <span class="recent-status" :class="item.status">
                {{ item.status === 'done' ? '100%' : item.progress + '%' }}
              </span>
            </div>
          </div>
          <el-empty v-if="recentGenerations.length === 0" :description="t('history.empty')" />
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

.creation-grid {
  display: grid;
  align-items: start;
  gap: 24px;
  grid-template-columns: minmax(320px, 1fr) minmax(320px, 1fr);
  justify-content: start;
}

.form-panel,
.result-panel,
.recent-section {
  padding: 22px 20px 18px;
  box-shadow: 0 1px 3px rgba(18, 27, 43, 0.08);
  background: #fff;
  border-radius: 10px;
}

.form-panel :deep(.el-form-item) {
  margin-bottom: 18px;
}

.form-panel :deep(.el-form-item__label) {
  margin-bottom: 5px;
  color: #4b5565;
  font-size: 12px;
  line-height: 1.3;
  font-weight: 750;
}

.form-panel :deep(.el-input__wrapper),
.form-panel :deep(.el-textarea__inner) {
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

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
  gap: 8px;
  padding: 8px;
}

.upload-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  padding: 4px 8px;
  color: #615ced;
}

.image-thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  overflow: hidden;
  background: #f4f6fa;
  cursor: default;
}

.image-thumb.select-mode {
  cursor: pointer;
}

.image-thumb.selected {
  outline: 2px solid #615ced;
  outline-offset: -2px;
}

.image-thumb :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.image-thumb .remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  padding: 0;
  font-size: 14px;
  line-height: 18px;
}

.select-mask {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(97, 92, 237, 0.15);
}

.select-mask .check {
  color: #fff;
  background: #615ced;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  padding: 3px;
}

.ref-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding: 0 4px;
}

.ref-count {
  margin-left: auto;
  color: #7b8494;
  font-size: 11px;
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

.generation-options {
  margin-top: 4px;
}

.generation-options :deep(.el-radio-group) {
  overflow: hidden;
  padding: 4px;
  border-radius: 9px;
  background: #f1f3f7;
}

.generation-options :deep(.el-radio-button__inner) {
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

.generation-options :deep(.el-radio-button:first-child .el-radio-button__inner),
.generation-options :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 7px;
}

.generation-options :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #fff;
  color: #111827;
  box-shadow: 0 1px 3px rgba(18, 27, 43, 0.1);
}

.resolution-size {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding-left: 4px;
}

.resolution-size :deep(.el-input-number) {
  width: 110px;
}

.resolution-size :deep(.el-input-number .el-input__wrapper) {
  padding-left: 12px;
  padding-right: 30px;
  border-radius: 10px;
  box-shadow: 0 0 0 1px #d2d8e2 inset;
}

.resolution-size :deep(.el-input-number .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #615ced inset;
}

.resolution-size :deep(.el-input-number .el-input-number__decrease),
.resolution-size :deep(.el-input-number .el-input-number__increase) {
  width: 24px;
  height: calc(50% - 0.5px);
  background: transparent;
  border: 0;
  color: #7b8494;
}

.resolution-size :deep(.el-input-number .el-input-number__decrease) {
  bottom: 0;
  border-bottom-right-radius: 10px;
}

.resolution-size :deep(.el-input-number .el-input-number__increase) {
  top: 0;
  border-top-right-radius: 10px;
}

.resolution-size :deep(.el-input-number .el-input-number__decrease:hover),
.resolution-size :deep(.el-input-number .el-input-number__increase:hover) {
  color: #615ced;
}

.resolution-size .size-x,
.resolution-size .size-unit {
  color: #7b8494;
  font-size: 12px;
}

.aspect-select {
  width: 100%;
}

.aspect-select :deep(.el-input__wrapper) {
  border-radius: 9px;
  box-shadow: 0 0 0 1px #d2d8e2 inset;
}

.count-stepper {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 4px 6px;
  border-radius: 9px;
  background: #f1f3f7;
}

.count-stepper .step-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 7px;
  background: #fff;
  border-color: #e5e7eb;
}

.count-stepper .step-btn:disabled {
  opacity: 0.4;
}

.count-stepper .step-value {
  min-width: 24px;
  text-align: center;
  color: #111827;
  font-size: 14px;
  font-weight: 750;
}

.generate-btn {
  width: 100%;
  height: 38px;
  border-radius: 3px;
  background: #2f63e6;
  font-weight: 750;
}

/* Right panel */
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
  aspect-ratio: 1 / 1;
  min-height: 216px;
  place-items: center;
  margin: 0 0 20px;
  padding: 5px 14px;
  border-radius: 8px;
  color: #667085;
  background: #d8f7ff;
  overflow: hidden;
}

.preview-box .result-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.preview-box .is-loading {
  font-size: 36px;
  animation: rotating 1.5s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.preview-box .nav-btn {
  position: absolute;
  top: 50%;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  transform: translateY(-50%);
  z-index: 2;
}

.preview-box .nav-btn:hover {
  background: rgba(0, 0, 0, 0.65);
}

.preview-box .nav-prev {
  left: 10px;
}

.preview-box .nav-next {
  right: 10px;
}

.preview-box .indicator {
  position: absolute;
  bottom: 10px;
  left: 50%;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  transform: translateX(-50%);
}

.empty-tip {
  color: #667085;
  font-size: 13px;
  text-align: center;
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

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 21px;
}

.recent-header h4 {
  margin: 0;
  color: #202536;
  font-size: 13px;
  font-weight: 750;
}

.view-more {
  font-size: 12px;
  color: #615ced;
  cursor: pointer;
}

.recent-item {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
  min-height: 56px;
  margin-bottom: 8px;
}

.recent-thumb {
  width: 52px;
  height: 38px;
  overflow: hidden;
  border-radius: 6px;
  background: #f4f6fa;
}

.recent-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.recent-actions {
  display: flex;
  gap: 6px;
  align-items: center;
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

  .result-actions {
    flex-direction: column;
  }
}

.el-button + .el-button {
  margin-left: 0;
}

.el-radio-button {
  margin-right: 10px;
}
</style>