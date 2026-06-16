<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { VideoPlay, Picture as PictureIcon, Delete, Download, Link } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getImageList } from '../../api/modules/image.js'

const { t } = useI18n()

const historyItems = ref([])
const loading = ref(false)
const playDialogVisible = ref(false)
const currentMedia = ref(null) // { urls, index, kind, title }
const previewIndex = ref(0)
const activeTab = ref('all') // 'all' | 'image' | 'video'

const filteredItems = computed(() => {
  if (activeTab.value === 'image') return historyItems.value.filter(i => i.kind === 'image')
  if (activeTab.value === 'video') return historyItems.value.filter(i => i.kind === 'video')
  return historyItems.value
})

const TASK_TYPE = {
  IMAGE_TO_VIDEO: 1,
  SCRIPT_TO_VIDEO: 2,
  TEXT_TO_IMAGE_V1: 3,
  TEXT_TO_IMAGE_V2: 4,
}

const IMAGE_TASK_TYPES = new Set([TASK_TYPE.TEXT_TO_IMAGE_V1, TASK_TYPE.TEXT_TO_IMAGE_V2])

function isImageTaskType(taskType) {
  return IMAGE_TASK_TYPES.has(taskType)
}

function parseUrls(field) {
  if (!field || typeof field !== 'string') return []
  return Array.from(new Set(field.split(',').map(s => s.trim()).filter(Boolean)))
}

function extractMedia(item) {
  if (isImageTaskType(item.taskType)) {
    // 图片只取 internalVideoUrl（多张逗号分隔），videoUrl 是同组图片的外网 CDN 副本
    return parseUrls(item.internalVideoUrl)
  }
  // 视频：取一条
  const url = item.internalVideoUrl || item.videoUrl || ''
  return url ? [url] : []
}

function kindForTaskType(taskType) {
  return isImageTaskType(taskType) ? 'image' : 'video'
}

function typeKeyForTaskType(taskType) {
  if (taskType === TASK_TYPE.IMAGE_TO_VIDEO) return 'imageToVideo'
  if (taskType === TASK_TYPE.SCRIPT_TO_VIDEO) return 'scriptToVideo'
  if (isImageTaskType(taskType)) return 'textToImage'
  return 'unknown'
}

function fetchHistory() {
  loading.value = true
  getImageList({ pageSize: 100 })
    .then((res) => {
      if (!((res.code === 0 || res.code === 200) && res.data?.rows)) {
        historyItems.value = []
        return
      }
      const items = res.data.rows.map((item) => {
        const urls = extractMedia(item)
        const kind = kindForTaskType(item.taskType)
        return {
          id: `task-${item.id}`,
          rawId: item.id,
          kind,
          typeKey: typeKeyForTaskType(item.taskType),
          title: item.title,
          time: item.createTime || '',
          progress: item.status === 2 ? 100 : (item.status === 1 ? 50 : 0),
          status: item.status === 2 ? 'done' : (item.status === 1 ? 'processing' : 'pending'),
          tone: ['pink', 'mint', 'sunset', 'sky', 'purple'][item.id % 5],
          urls,
          url: urls[0] || '',
        }
      })
      items.sort((a, b) => new Date(b.time) - new Date(a.time))
      historyItems.value = items
    })
    .finally(() => {
      loading.value = false
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

function previewMedia(item) {
  if (!item.urls?.length) return
  previewIndex.value = 0
  currentMedia.value = { urls: item.urls, kind: item.kind, title: item.title }
  playDialogVisible.value = true
}

function previewPrev() {
  if (!currentMedia.value?.urls?.length) return
  const len = currentMedia.value.urls.length
  previewIndex.value = (previewIndex.value - 1 + len) % len
}

function previewNext() {
  if (!currentMedia.value?.urls?.length) return
  const len = currentMedia.value.urls.length
  previewIndex.value = (previewIndex.value + 1) % len
}

function downloadMedia(item) {
  if (!item.url) return
  const ext = item.kind === 'image' ? 'png' : 'mp4'
  const link = document.createElement('a')
  link.href = item.url
  link.download = item.title + '.' + ext
  link.click()
}

async function copyLink(url) {
  if (!url) return
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success(t('workspace.msg.linkCopied'))
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success(t('workspace.msg.linkCopied'))
  }
}

function deleteItem(id) {
  historyItems.value = historyItems.value.filter(item => item.id !== id)
}

function typeLabel(typeKey) {
  return t(`workspace.historyType.${typeKey}`)
}

onMounted(() => {
  fetchHistory()
})
</script>

<template>
  <div class="workspace-page">
    <div class="page-heading">
      <div>
        <h1>{{ t('history.title') }}</h1>
        <p>{{ t('history.subtitle') }}</p>
      </div>
    </div>

    <section class="panel history-panel" v-loading="loading">
      <div class="history-panel-header">
        <h3>{{ t('workspace.recentGenerations') }}</h3>
        <el-radio-group v-model="activeTab" size="small">
          <el-radio-button value="all">{{ t('history.tabAll') }}</el-radio-button>
          <el-radio-button value="image">{{ t('history.tabImage') }}</el-radio-button>
          <el-radio-button value="video">{{ t('history.tabVideo') }}</el-radio-button>
        </el-radio-group>
      </div>
      <div class="history-grid">
        <div v-for="item in filteredItems" :key="item.id" class="history-card">
          <div
            class="history-thumb"
            :class="[item.tone, { image: item.kind === 'image', video: item.kind === 'video' }]"
          >
            <video
              v-if="item.kind === 'video' && item.status === 'done' && item.url"
              :src="item.url"
              class="history-media"
            />
            <img
              v-else-if="item.kind === 'image' && item.status === 'done' && item.url"
              :src="item.url"
              class="history-media"
              :alt="item.title"
            />
            <div v-else class="generating-overlay">
              <el-icon class="is-loading"><VideoPlay /></el-icon>
              <span>{{ item.progress }}%</span>
            </div>
            <div v-if="item.status === 'done' && item.url" class="thumb-actions">
              <el-button size="small" :icon="item.kind === 'image' ? PictureIcon : VideoPlay" circle @click="previewMedia(item)" />
              <el-button size="small" :icon="Download" circle @click="downloadMedia(item)" />
              <el-button size="small" :icon="Link" circle @click="copyLink(item.url)" />
            </div>
            <button class="delete-btn" @click="deleteItem(item.id)">
              <el-icon><Delete /></el-icon>
            </button>
          </div>
          <div class="history-info">
            <div class="history-header">
              <span class="history-title">{{ item.title }}</span>
              <span class="history-status" :class="item.status">
                {{ item.status === 'done' ? '100%' : item.progress + '%' }}
              </span>
            </div>
            <div class="history-meta">
              <span class="history-type" :class="`type-${item.kind}`">{{ typeLabel(item.typeKey) }}</span>
              <span class="history-time">{{ formatTime(item.time) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="historyItems.length === 0 && !loading" class="history-empty">
        <p>{{ t('history.empty') }}</p>
      </div>
    </section>

    <el-dialog
      v-model="playDialogVisible"
      :title="currentMedia?.kind === 'image' ? t('history.imagePreview') : t('history.videoPlay')"
      width="720px"
    >
      <video
        v-if="currentMedia?.kind === 'video'"
        :src="currentMedia.urls[0]"
        controls
        style="width:100%"
      />
      <div v-else-if="currentMedia?.kind === 'image'" class="preview-image-wrap">
        <img
          :src="currentMedia.urls[previewIndex]"
          :alt="currentMedia.title"
          class="preview-image"
        />
        <button
          v-if="currentMedia.urls.length > 1"
          class="preview-nav preview-prev"
          @click="previewPrev"
        >‹</button>
        <button
          v-if="currentMedia.urls.length > 1"
          class="preview-nav preview-next"
          @click="previewNext"
        >›</button>
        <div v-if="currentMedia.urls.length > 1" class="preview-counter">
          {{ previewIndex + 1 }} / {{ currentMedia.urls.length }}
        </div>
      </div>
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

.page-heading h1 {
  margin: 0;
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

.history-panel {
  padding: 22px 20px 18px;
  box-shadow: 0 1px 3px rgba(18, 27, 43, 0.08);
}

.history-panel h3 {
  margin: 0 0 18px;
  color: #202536;
  font-size: 18px;
  font-weight: 750;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.history-card {
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e8ebf2;
}

.history-thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.history-thumb.image {
  aspect-ratio: 1 / 1;
}

.history-thumb img,
.history-thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-thumb .generating-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e9c8f3, #f7c8de);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.history-thumb.pink {
  background: linear-gradient(135deg, #e9c8f3, #f7c8de);
}

.history-thumb.mint {
  background: linear-gradient(135deg, #acd9ff, #b8f4c9);
}

.history-thumb.sunset {
  background: linear-gradient(135deg, #ffef84, #ffb4bd);
}

.history-thumb.sky {
  background: linear-gradient(135deg, #a8e6ff, #c8f4ff);
}

.history-thumb.purple {
  background: linear-gradient(135deg, #d4c8f3, #e8d8ff);
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
}

.history-thumb:hover .delete-btn {
  opacity: 1;
}

.thumb-actions {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s;
}

.history-thumb:hover .thumb-actions {
  opacity: 1;
}

.thumb-actions .el-button {
  background: rgba(255, 255, 255, 0.9);
  border: none;
}

.history-info {
  padding: 14px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.history-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

.history-status {
  font-size: 12px;
  font-weight: 600;
  color: #667085;
}

.history-status.done {
  color: #19a94f;
}

.history-meta {
  display: flex;
  gap: 12px;
}

.history-type,
.history-time {
  font-size: 12px;
  color: #667085;
}

.history-empty {
  text-align: center;
  padding: 40px;
  color: #667085;
}

.preview-image-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f1116;
  border-radius: 6px;
  overflow: hidden;
}

.preview-image {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  margin: 0 auto;
}

.preview-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-nav:hover {
  background: rgba(0, 0, 0, 0.7);
}

.preview-prev {
  left: 12px;
}

.preview-next {
  right: 12px;
}

.preview-counter {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

@media (max-width: 1040px) {
  .history-grid {
    grid-template-columns: repeat(2, 1fr);
    margin-top: 20px;
  }
}

@media (max-width: 680px) {
  .history-grid {
    grid-template-columns: 1fr;
    margin-top: 20px;
  }
}
.history-panel-header{
  margin-bottom: 20px;
}
</style>
