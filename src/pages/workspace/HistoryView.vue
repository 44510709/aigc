<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VideoPlay, Delete } from '@element-plus/icons-vue'

const { t } = useI18n()

const historyItems = ref([
  { id: 1, title: 'Adventure Story Opening', type: 'Image to Video', time: '2 hours ago', progress: 38, status: 'processing', tone: 'pink' },
  { id: 2, title: 'Product Demo Trailer', type: 'Script to Video', time: '5 hours ago', progress: 100, status: 'done', tone: 'mint' },
  { id: 3, title: 'Social Media Ad', type: 'Image to Video', time: '1 day ago', progress: 100, status: 'done', tone: 'sunset' },
  { id: 4, title: 'Mountain Documentary', type: 'Script to Video', time: '2 days ago', progress: 100, status: 'done', tone: 'sky' },
  { id: 5, title: 'City Timelapse', type: 'Image to Video', time: '3 days ago', progress: 100, status: 'done', tone: 'purple' },
])

function deleteItem(id) {
  historyItems.value = historyItems.value.filter(item => item.id !== id)
}
</script>

<template>
  <div class="workspace-page">
    <div class="page-heading">
      <div>
        <h1>{{ t('history.title') }}</h1>
        <p>{{ t('history.subtitle') }}</p>
      </div>
    </div>

    <section class="panel history-panel">
      <h3>{{ t('workspace.recentGenerations') }}</h3>
      <div class="history-grid">
        <div v-for="item in historyItems" :key="item.id" class="history-card">
          <div class="history-thumb" :class="item.tone">
            <img v-if="item.status === 'done'" src="https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=900&q=80" :alt="item.title" />
            <div v-else class="generating-overlay">
              <el-icon class="is-loading"><VideoPlay /></el-icon>
              <span>{{ item.progress }}%</span>
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

      <div v-if="historyItems.length === 0" class="history-empty">
        <p>{{ t('history.empty') }}</p>
      </div>
    </section>
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

.history-thumb img {
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
}

.history-thumb:hover .delete-btn {
  opacity: 1;
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
