<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { VideoPlay, Delete, Download, Link } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getVideoList } from '../../api/modules/video.js'

const { t } = useI18n()

const historyItems = ref([])
const loading = ref(false)
const playDialogVisible = ref(false)
const currentVideoUrl = ref('')

function fetchHistory() {
  loading.value = true
  getVideoList({ pageSize: 100 })
    .then(res => {
      if ((res.code === 0 || res.code === 200) && res.data?.rows) {
        historyItems.value = res.data.rows.map(item => ({
          id: item.id,
          title: item.title,
          type: item.taskType === 1 ? 'Image to Video' : 'Script to Video',
          time: item.createTime ? formatTime(item.createTime) : '',
          progress: item.status === 2 ? 100 : (item.status === 1 ? 50 : 0),
          status: item.status === 2 ? 'done' : (item.status === 1 ? 'processing' : 'pending'),
          tone: ['pink', 'mint', 'sunset', 'sky', 'purple'][item.id % 5],
          url: item.videoUrl,
        }))
      }
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

function playVideo(url) {
  if (!url) return
  currentVideoUrl.value = url
  playDialogVisible.value = true
}

function downloadVideo(item) {
  if (!item.url) return
  const link = document.createElement('a')
  link.href = item.url
  link.download = item.title + '.mp4'
  link.click()
}

async function copyLink(url) {
  if (!url) return
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制')
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('链接已复制')
  }
}

function deleteItem(id) {
  historyItems.value = historyItems.value.filter(item => item.id !== id)
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
      <h3>{{ t('workspace.recentGenerations') }}</h3>
      <div class="history-grid">
        <div v-for="item in historyItems" :key="item.id" class="history-card">
          <div class="history-thumb" :class="item.tone">
            <video
              v-if="item.status === 'done' && item.url"
              :src="item.url"
              class="history-video"
            />
            <div v-else class="generating-overlay">
              <el-icon class="is-loading"><VideoPlay /></el-icon>
              <span>{{ item.progress }}%</span>
            </div>
            <div v-if="item.status === 'done' && item.url" class="thumb-actions">
              <el-button size="small" :icon="VideoPlay" circle @click="playVideo(item.url)" />
              <el-button size="small" :icon="Download" circle @click="downloadVideo(item)" />
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
              <span class="history-type">{{ item.type }}</span>
              <span class="history-time">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="historyItems.length === 0 && !loading" class="history-empty">
        <p>{{ t('history.empty') }}</p>
      </div>
    </section>

    <el-dialog v-model="playDialogVisible" title="视频播放" width="720px">
      <video v-if="currentVideoUrl" :src="currentVideoUrl" controls style="width:100%" />
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

@media (max-width: 1040px) {
  .history-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 680px) {
  .history-grid {
    grid-template-columns: 1fr;
  }
}
</style>
