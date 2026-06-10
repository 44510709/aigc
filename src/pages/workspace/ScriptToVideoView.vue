<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { VideoPlay, Download, Link } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMediaList } from '../../api/modules/assets.js'
import { createScriptVideo, getVideoList, getVideoDetail } from '../../api/modules/video.js'
import enUS from '../../i18n/locales/en-US.js'
import zhCN from '../../i18n/locales/zh-CN.js'
import { useRouter } from 'vue-router'

const { t, locale } = useI18n()
const LOCALES = { 'en-US': enUS, 'zh-CN': zhCN }
const router = useRouter()

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

const scenesOptions = computed(() => LOCALES[locale.value]?.workspace?.scenesOptions ?? [])
const styleOptions = computed(() => LOCALES[locale.value]?.workspace?.styleOptions ?? [])

const form = reactive({
  title: '',
  script: '',
  ratio: '16:9',
  duration: 8,
  resolution: '720',
})

const pageState = ref('empty') // empty | generating | generated
const maxChars = 2000
const scriptCharCount = computed(() => form.script.length)

const generatedVideoUrl = ref('')
const generatedVideoName = ref('')
const showResult = computed(() => pageState.value === 'generated' && generatedVideoUrl.value)

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
        url: item.videoUrl,
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

function onRecentVideoLoaded(e) {
  const v = e.target
  if (v && v.currentTime === 0) v.currentTime = 0.5
}

function goToHistory() {
  router.push({ name: 'history' })
}

function adjustDuration(delta) {
  const newVal = form.duration + delta
  if (newVal >= 5 && newVal <= 60) {
    form.duration = newVal
  }
}

function appendToScript(text) {
  if (form.script && !form.script.endsWith(' ')) {
    form.script += ' '
  }
  form.script += text
}

function formatDuration(val) {
  return `${val}s`
}

function generateVideo() {
  if (!form.title) {
    ElMessage.warning('请填写标题')
    return
  }
  pageState.value = 'generating'

  const payload = {
    title: form.title,
    prompt: form.script,
    aspectRatio: form.ratio,
    duration: form.duration,
    resolution: form.resolution + 'p',
  }

  createScriptVideo(payload).then(res => {
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
  }).catch(err => {
    pageState.value = 'empty'
    const msg = err?.response?.data?.msg || err?.msg || err?.message || '生成失败'
    ElMessage.error(msg)
  })
}

let pollingTimer = null

function startPolling(videoId) {
  pollingTimer = setInterval(() => {
    getVideoDetail(videoId).then(res => {
      if ((res.code === 0 || res.code === 200) && res.data) {
        const item = res.data
        if (item.status === 2) {
          clearInterval(pollingTimer)
          pollingTimer = null
          generatedVideoUrl.value = item.videoUrl || ''
          generatedVideoName.value = item.title || form.title
          pageState.value = 'generated'
          ElMessage.success('视频生成完成')
          fetchRecentGenerations()
        } else if (item.status === 3) {
          clearInterval(pollingTimer)
          pollingTimer = null
          pageState.value = 'empty'
          ElMessage.error(item.errorMsg || '视频生成失败')
        }
      }
    }).catch(() => {})
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
</script>

<template>
  <div class="workspace-page">
    <div class="page-heading">
      <div>
        <h1>{{ t('nav.scriptToVideo') }}</h1>
        <p>{{ t('home.scriptDesc') }}</p>
      </div>
    </div>

    <div class="creation-grid">
      <!-- Left: Form Panel -->
      <section class="panel form-panel">
        <el-form label-position="top" :model="form">
          <el-form-item :label="t('workspace.title')">
            <el-input v-model="form.title" placeholder="Video title" />
          </el-form-item>

          <el-form-item :label="t('workspace.prompt')">
            <div class="script-input-wrapper">
              <el-input
                v-model="form.script"
                type="textarea"
                :rows="7"
                :placeholder="t('workspace.scriptPlaceholder')"
                :maxlength="maxChars"
                show-word-limit
                class="script-textarea"
              />
              <div class="script-tags">
                <span class="tag-label">{{ t('workspace.scenes') }}</span>
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
                :min="5"
                :max="60"
                :step="1"
                :format-tooltip="formatDuration"
              />
            </el-form-item>
            <div class="slider-labels">
              <span>5s</span>
              <span>60s</span>
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

      <!-- Right: Preview + Recent -->
      <div class="result-stack">
        <section class="panel result-panel">
          <h3>{{ t('workspace.outputPreview') }}</h3>
          <div class="preview-box">
            <template v-if="pageState === 'generating'">
              <el-icon class="is-loading"><VideoPlay /></el-icon>
              <span>{{ t('workspace.generating') }}</span>
            </template>
            <template v-else-if="showResult">
              <video :src="generatedVideoUrl" controls style="width:100%;height:100%;object-fit:cover;" />
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
          <div v-for="item in recentGenerations" :key="item.id" class="recent-item">
            <div v-if="item.url" class="recent-thumb recent-thumb-video">
              <video
                :src="item.url"
                muted
                playsinline
                preload="metadata"
                @loadeddata="onRecentVideoLoaded"
              ></video>
            </div>
            <div v-else class="recent-thumb" :class="item.tone"></div>
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

.form-panel :deep(.el-input__wrapper),
.form-panel :deep(.el-textarea__inner) {
  min-height: 40px;
  border-radius: 9px;
  box-shadow: 0 0 0 1px #d2d8e2 inset;
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

.duration-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.duration-control .el-button {
  width: 32px;
  height: 32px;
  padding: 0;
}

.duration-value {
  min-width: 50px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
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

.recent-section h4 {
  margin: 0 0 21px;
  color: #202536;
  font-size: 13px;
  font-weight: 750;
}

.recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 21px;
}

.recent-header h4 {
  margin: 0;
}

.view-more {
  color: #615ced;
  font-size: 12px;
  cursor: pointer;
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
  overflow: hidden;
  border-radius: 6px;
}

.recent-thumb-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
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

.el-radio-button {
  margin-right: 10px;
}

@media (max-width: 1040px) {
  .workspace-page {
    max-width: 760px;
  }

  .creation-grid {
    grid-template-columns: 1fr;
  }
}
</style>
