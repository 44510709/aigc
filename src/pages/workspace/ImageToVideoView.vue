<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { UploadFilled, VideoPlay, Download, Link, Delete, CircleCheckFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { demoAssets, demoSubjects } from '../../utils/demoData.js'
import { getMediaList, uploadFile } from '../../api/modules/assets.js'
import { createImageVideo, getVideoList, getVideoDetail } from '../../api/modules/video.js'
import enUS from '../../i18n/locales/en-US.js'
import zhCN from '../../i18n/locales/zh-CN.js'

const { t, locale } = useI18n()
const router = useRouter()
const LOCALES = { 'en-US': enUS, 'zh-CN': zhCN }

// 素材列表
const mediaList = ref([])
const mediaLoading = ref(false)

function fetchMediaList() {
  mediaLoading.value = true
  getMediaList({ pageSize: 100 })
    .then(res => {
      if ((res.code === 0 || res.code === 200) && res.data?.rows) {
        mediaList.value = res.data.rows
      }
    })
    .finally(() => {
      mediaLoading.value = false
    })
}

const form = reactive({
  title: '',
  image: null,
  imagePreview: null,
  assetSource: null,
  subjectSource: null,
  script: '',
  ratio: '16:9',
  duration: 5,
  resolution: '720',
})

const scenesOptions = computed(() => LOCALES[locale.value]?.workspace?.scenesOptions ?? [])
const styleOptions = computed(() => LOCALES[locale.value]?.workspace?.styleOptions ?? [])

const pageState = ref('empty') // empty | generating | generated
const previewImage = 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=900&q=80'

const generatedVideoUrl = ref('')
const generatedVideoName = ref('')
const isPlaying = ref(false)
const showResult = computed(() => pageState.value === 'generated' && generatedVideoUrl.value)

onMounted(() => {
  fetchMediaList()
  fetchRecentGenerations()
})

onUnmounted(() => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
})

async function generateVideo() {
  if (!form.title) {
    ElMessage.warning('请填写标题')
    return
  }
  if (!form.image && selectedVisualAssets.value.length === 0) {
    ElMessage.warning(t('workspace.uploadImage'))
    return
  }
  pageState.value = 'generating'

  try {
    const payload = {
      title: form.title,
      aspectRatio: form.ratio,
      duration: form.duration,
      resolution: form.resolution + 'p',
    }
    if (form.script) payload.prompt = form.script
    if (selectedVisualAssets.value.length > 0) {
      payload.materialIds = selectedVisualAssets.value.map(a => a.id)
    }
    if (form.image) {
      const uploadRes = await uploadFile(form.image)
      const url = uploadRes?.data?.url || uploadRes?.data || uploadRes?.url
      if (!url) {
        pageState.value = 'empty'
        ElMessage.error('图片上传失败')
        return
      }
      payload.imageUrls = [url]
    }

    const res = await createImageVideo(payload)
    if (res.code === 0 || res.code === 200) {
      if (res.data != null) {
        const videoId = typeof res.data === 'object' ? (res.data.id || res.data.videoId) : res.data
        if (videoId) {
          startPolling(videoId)
        } else {
          pageState.value = 'empty'
          ElMessage.error('生成失败：未返回视频ID')
        }
      } else {
        pageState.value = 'empty'
        ElMessage.error(res.msg || '生成失败')
      }
    } else {
      pageState.value = 'empty'
      ElMessage.error(res.msg || '生成失败')
    }
  } catch (err) {
    pageState.value = 'empty'
    console.error('createImageVideo error:', err)
    const msg = err?.response?.data?.msg || err?.msg || err?.message || '生成失败'
    ElMessage.error(msg)
  }
}

let pollingTimer = null

function startPolling(videoId) {
  pollingTimer = setInterval(() => {
    getVideoDetail(videoId).then(res => {
      if ((res.code === 0 || res.code === 200) && res.data) {
        const item = res.data
        // status: 0=待处理, 1=处理中, 2=已完成, 3=失败
        if (item.status === 2) {
          clearInterval(pollingTimer)
          pollingTimer = null
          generatedVideoUrl.value = item.videoUrl || form.imagePreview
          generatedVideoName.value = item.title || form.title
          isPlaying.value = false
          pageState.value = 'generated'
          ElMessage.success('视频生成完成')
          // 刷新最近生成列表
          fetchRecentGenerations()
        } else if (item.status === 3) {
          clearInterval(pollingTimer)
          pollingTimer = null
          pageState.value = 'empty'
          ElMessage.error(item.errorMsg || '视频生成失败')
        }
        // status === 0 或 1 继续轮询，不做任何处理
      }
    }).catch(() => {
      // 网络错误继续轮询
    })
  }, 2000)
}

function handleDownload() {
  if (!generatedVideoUrl.value) return
  const link = document.createElement('a')
  link.href = generatedVideoUrl.value
  link.download = generatedVideoName.value + '.mp4'
  link.click()
}

async function handleCopyLink() {
  if (!generatedVideoUrl.value) return
  try {
    await navigator.clipboard.writeText(generatedVideoUrl.value)
    ElMessage.success('链接已复制')
  } catch {
    // Fallback for browsers that don't support clipboard API
    const textarea = document.createElement('textarea')
    textarea.value = generatedVideoUrl.value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('链接已复制')
  }
}

const selectedVisualAssets = ref([])
const recentGenerations = ref([])

function fetchRecentGenerations() {
  getVideoList({ pageSize: 10 }).then(res => {
    if ((res.code === 0 || res.code === 200) && res.data?.rows) {
      recentGenerations.value = res.data.rows.map(item => ({
        id: item.id,
        title: item.title,
        time: item.createTime ? formatTime(item.createTime) : '',
        progress: item.status === 2 ? 100 : (item.status === 1 ? 50 : 0),
        status: item.status === 2 ? 'done' : (item.status === 1 ? 'processing' : 'pending'),
        tone: ['pink', 'mint', 'sunset'][item.id % 3],
        url: item.url,
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

const uploadHint = computed(() => `JPG/PNG/WebP, Max 20MB`)
const maxChars = 2000
const scriptCharCount = computed(() => form.script.length)

function handleUpload(uploadFile) {
  const rawFile = uploadFile.raw
  if (!rawFile || typeof rawFile.arrayBuffer !== 'function') return
  const reader = new FileReader()
  reader.onload = (e) => {
    form.imagePreview = e.target.result
    form.image = rawFile
    pageState.value = 'hasImage'
  }
  reader.readAsDataURL(rawFile)
  return false
}

function addAssetToSelection(asset) {
  const exists = selectedVisualAssets.value.find(a => a.id === asset.id)
  if (!exists) {
    selectedVisualAssets.value.push({
      id: asset.id,
      title: asset.title || asset.name,
      caption: asset.type || 'Custom Asset',
      image: asset.image || asset.thumbnail,
    })
  }
}

function chooseFromAsset() {
  assetDialogVisible.value = true
}

const assetDialogVisible = ref(false)
const tempSelectedAssets = ref([])

function openAssetDialog() {
  tempSelectedAssets.value = selectedVisualAssets.value.map(a => a.id)
  assetDialogVisible.value = true
}

function confirmAssetSelection() {
  const selected = mediaList.value.filter(a => tempSelectedAssets.value.includes(a.id))
  selectedVisualAssets.value = selected.map(a => ({
    id: a.id,
    title: a.title || a.name,
    caption: a.type || 'Custom Asset',
    image: a.image || a.url,
  }))
  assetDialogVisible.value = false
}

function toggleAssetSelection(id) {
  const idx = tempSelectedAssets.value.indexOf(id)
  if (idx > -1) {
    tempSelectedAssets.value.splice(idx, 1)
  } else {
    tempSelectedAssets.value.push(id)
  }
}

function chooseFromSubject() {
  if (demoSubjects.length > 0) {
    const subject = demoSubjects[0]
    form.subjectSource = subject
    form.assetSource = null
    addAssetToSelection({ ...subject, title: subject.name, type: 'Subject' })
  }
}

function removeVisualAsset(id) {
  selectedVisualAssets.value = selectedVisualAssets.value.filter((asset) => asset.id !== id)
}

function formatDuration(val) {
  return `${val}s`
}

function appendToScript(text) {
  if (form.script && !form.script.endsWith(' ')) {
    form.script += ' '
  }
  form.script += text
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
        <h3 class="form-heading">{{ t('workspace.imageToVideoTitle') }}</h3>

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
                :placeholder="t('workspace.promptPlaceholder')"
                :maxlength="maxChars"
                show-word-limit
                class="script-textarea"
              />
              <div class="script-tags">
                <span class="tag-label">{{ t('workspace.scenes') || '场景:' }}</span>
                <el-button
                  v-for="scene in scenesOptions"
                  :key="scene"
                  size="small"
                  class="tag-btn"
                  @click="appendToScript(scene)"
                >
                  {{ scene }}
                </el-button>
              </div>
              <div class="script-tags">
                <span class="tag-label">{{ t('workspace.style') }}:</span>
                <el-button
                  v-for="style in styleOptions"
                  :key="style"
                  size="small"
                  class="tag-btn"
                  @click="appendToScript(style)"
                >
                  {{ style }}
                </el-button>
              </div>
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
            {{ t('workspace.chooseAsset') }}
          </el-button>

          <!-- Choose from Subject - hidden temporarily -->
          <!-- <el-button class="source-btn" @click="chooseFromSubject">
            {{ t('workspace.chooseSubject') }}
          </el-button> -->

          <!-- Ratio -->
          <div class="ratio-section">
            <el-form-item :label="t('workspace.videoRatio')">
              <el-radio-group v-model="form.ratio">
                <el-radio-button value="16:9">16:9</el-radio-button>
                <el-radio-button value="9:16">9:16</el-radio-button>
                <el-radio-button value="1:1">1:1</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </div>

          <!-- Resolution -->
          <div class="ratio-section">
            <el-form-item :label="t('workspace.resolution')">
              <el-radio-group v-model="form.resolution">
                <el-radio-button value="720">720</el-radio-button>
                <el-radio-button value="480">480</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </div>

          <!-- Duration -->
          <div class="duration-section">
            <el-form-item :label="`${t('workspace.duration')}: ${form.duration}s`">
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
          <h3>{{ t('workspace.outputPreview') }}</h3>

          <div class="preview-box">
            <template v-if="pageState === 'generating'">
              <el-icon class="is-loading"><VideoPlay /></el-icon>
              <span>{{ t('workspace.generating') }}</span>
            </template>
            <template v-else-if="showResult">
              <video
                :src="generatedVideoUrl"
                controls
                class="result-video"
                @play="isPlaying = true"
                @pause="isPlaying = false"
              />
            </template>
            <template v-else>
              <span class="empty-tip">{{ t('workspace.noResult') }}</span>
            </template>
          </div>

          <div v-if="showResult" class="result-actions">
            <el-button type="success" :icon="Download" @click="handleDownload">
              {{ t('workspace.downloadMp4') }}
            </el-button>
            <el-button :icon="Link" @click="handleCopyLink">
              {{ t('workspace.copyLink') }}
            </el-button>
          </div>

          <!-- <p class="quality-note">{{ t('workspace.qualityNote') }}</p> -->
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
            <div class="recent-thumb" :class="item.tone"></div>
            <div class="recent-info">
              <span class="recent-title">{{ item.title }}</span>
              <span class="recent-time">{{ item.time }}</span>
            </div>
            <div class="recent-actions">
              <el-button v-if="item.url" size="small" :icon="Download" circle @click="() => { if(item.url) { const l = document.createElement('a'); l.href = item.url; l.download = item.title + '.mp4'; l.click() } }"></el-button>
              <el-button v-if="item.url" size="small" :icon="Link" circle @click="() => { if(item.url) { navigator.clipboard.writeText(item.url); ElMessage.success('链接已复制') } }"></el-button>
              <span class="recent-status" :class="item.status">
                {{ item.status === 'done' ? '100%' : item.progress + '%' }}
              </span>
            </div>
          </div>
          <el-empty v-if="recentGenerations.length === 0" :description="t('history.empty')" />
        </section>
      </div>
    </div>

    <!-- Asset Selection Dialog -->
    <el-dialog v-model="assetDialogVisible" :title="t('assets.selectAsset')" width="880px">
      <div v-loading="mediaLoading" class="asset-dialog-grid">
        <div
          v-for="asset in mediaList"
          :key="asset.id"
          class="asset-dialog-item"
          :class="{ selected: tempSelectedAssets.includes(asset.id) }"
          @click="toggleAssetSelection(asset.id)"
        >
          <el-image :src="asset.url" fit="cover" class="asset-dialog-thumb" />
          <div class="asset-dialog-info">
            <strong>{{ asset.name }}</strong>
            <span>{{ asset.materialType === 1 ? '图片' : '视频' }}</span>
          </div>
          <el-icon v-if="tempSelectedAssets.includes(asset.id)" class="check-icon"><CircleCheckFilled /></el-icon>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="assetDialogVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="confirmAssetSelection">{{ t('common.confirm') }} ({{ tempSelectedAssets.length }})</el-button>
        </div>
      </template>
    </el-dialog>
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
  gap: 24px;
  grid-template-columns: minmax(320px, 1fr) minmax(320px, 1fr);
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

.script-textarea {
  display: block;
  width: 100%;
}

.script-textarea :deep(.el-textarea__inner) {
  height: 132px !important;
  min-height: 132px !important;
  padding: 13px 14px 26px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #d2d8e2 inset;
  resize: none;
}

.script-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-top: 8px;
}

.tag-label {
  color: #4b5565;
  font-size: 12px;
  font-weight: 750;
}

.tag-btn {
  height: 26px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 11px;
  color: #4b5565;
  background: #f1f3f7;
  border-color: #e5e7eb;
}

.selected-assets {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  align-items: flex-start;
  min-height: 104px;
  padding: 2px 12px 5px;
  max-width: 100%;
}

.selected-asset {
  width: calc(20% - 24px);
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
  margin-bottom: 24px;
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

.preview-box img,
.preview-box video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-tip {
  color: #667085;
  font-size: 13px;
  text-align: center;
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
.el-button+.el-button{
  margin-left: 0;
}
.el-radio-button{
  margin-right: 10px;
}

/* Asset Dialog */
.asset-dialog-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  max-height: 400px;
  overflow-y: auto;
}

.asset-dialog-item {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 10px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
  transition: border-color 0.15s;
}

.asset-dialog-item:hover {
  border-color: #d0d4e0;
}

.asset-dialog-item.selected {
  border-color: #615ced;
  background: #f5f4ff;
}

.asset-dialog-thumb {
  height: 80px;
  border-radius: 6px;
  background: #e4e7ec;
}

.asset-dialog-info {
  margin-top: 8px;
}

.asset-dialog-info strong {
  display: block;
  font-size: 12px;
  color: #1f2937;
}

.asset-dialog-info span {
  font-size: 11px;
  color: #667085;
}

.asset-dialog-item .check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #615ced;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-dialog__footer) {
  padding-top: 20px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.dialog-footer .el-button {
  min-width: 80px;
}
</style>
