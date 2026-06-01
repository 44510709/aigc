<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMediaList, createMedia, deleteMedia, uploadFile } from '../../api/modules/assets.js'

const { t } = useI18n()
const mediaList = ref([])
const mediaLoading = ref(false)
const dialogVisible = ref(false)
const uploadLoading = ref(false)
const keyword = ref('')

const form = ref({
  name: '',
  materialType: 1,
  tags: '',
  url: '',
  fileSize: 0,
})

function fetchMediaList() {
  mediaLoading.value = true
  getMediaList({ pageSize: 100, keyword: keyword.value })
    .then(res => {
      if ((res.code === 0 || res.code === 200) && res.data?.rows) {
        mediaList.value = res.data.rows
      }
    })
    .finally(() => {
      mediaLoading.value = false
    })
}

function handleDelete(id) {
  deleteMedia(id).then(res => {
    if (res.code === 0) {
      mediaList.value = mediaList.value.filter(item => item.id !== id)
      ElMessage.success('删除成功')
    }
  })
}

function openCreateDialog() {
  form.value = { name: '', materialType: 1, tags: '', url: '', fileSize: 0 }
  dialogVisible.value = true
}

function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  form.value._file = file
  form.value.name = file.name.replace(/\.[^.]+$/, '')
  uploadLoading.value = true
  uploadFile(file).then(res => {
    if ((res.code === 0 || res.code === 200) && res.data) {
      form.value.url = typeof res.data === 'string' ? res.data : res.data.url
      ElMessage.success('上传成功')
    } else {
      ElMessage.error('上传失败')
    }
  }).finally(() => {
    uploadLoading.value = false
  })
}

function handleCreate() {
  if (!form.value.name || !form.value.url) {
    ElMessage.warning('请填写素材名称并上传图片')
    return
  }
  uploadLoading.value = true
  createMedia({
    name: form.value.name,
    url: form.value.url,
    materialType: 1,
    tags: form.value.tags,
    fileSize: form.value._file?.size || 0,
  }).then(res => {
    if ((res.code === 0 || res.code === 200) && res.data) {
      mediaList.value.unshift(res.data)
      dialogVisible.value = false
      ElMessage.success('创建成功')
    }
  }).finally(() => {
    uploadLoading.value = false
  })
}

onMounted(() => {
  fetchMediaList()
})
</script>

<template>
  <div class="workspace-page">
    <div class="page-heading">
      <div>
        <h1>{{ t('assets.title') }}</h1>
        <p>{{ t('assets.subtitle') }}</p>
      </div>
      <div class="heading-actions">
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">
          {{ t('common.create') }}
        </el-button>
      </div>
    </div>

    <div v-loading="mediaLoading" class="asset-grid">
      <div
        v-for="asset in mediaList"
        :key="asset.id"
        class="panel asset-card"
      >
        <div class="asset-thumb" :style="asset.url ? `background-image: url(${asset.url})` : ''"></div>
        <strong>{{ asset.name }}</strong>
        <span>{{ asset.materialType === 1 ? '图片' : '视频' }}</span>
        <el-button
          :icon="Delete"
          text
          class="delete-btn"
          @click="handleDelete(asset.id)"
        />
      </div>
    </div>

    <el-empty v-if="!mediaLoading && mediaList.length === 0" :description="t('history.empty')" />

    <el-dialog v-model="dialogVisible" :title="t('common.create')" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item :label="t('assets.select')">
          <input type="file" accept="image/*" @change="handleFileChange" />
          <div v-if="form._file" style="margin-top:8px;color:#667085;font-size:12px">已选择: {{ form._file.name }}</div>
        </el-form-item>
        <el-form-item :label="t('assets.name')" required>
          <el-input v-model="form.name" :placeholder="t('assets.namePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('assets.tags')">
          <el-input v-model="form.tags" :placeholder="t('assets.tagsPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="uploadLoading" @click="handleCreate">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.workspace-page {
  display: grid;
  gap: 20px;
}

.page-heading {
  display: flex;
  gap: 18px;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid #e6e9f2;
}

.page-heading > div {
  flex: 1;
}

.page-heading h1 {
  margin: 0;
}

.page-heading p {
  margin: 8px 0 0;
  color: #667085;
}

.heading-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.heading-actions .el-input {
  width: 260px;
}

.asset-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
}

.asset-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.asset-card:hover {
  border-color: #b8b5ff;
  transform: translateY(-2px);
}

.asset-card:hover .delete-btn {
  opacity: 1;
}

.asset-card strong,
.asset-card span {
  display: block;
  padding: 0 14px;
}

.asset-card strong {
  margin-top: 12px;
}

.asset-card span {
  margin: 6px 0 14px;
  color: #667085;
  font-size: 13px;
}

.asset-thumb {
  height: 130px;
  background: #e4e7ec;
  background-size: cover;
  background-position: center;
  border-radius: 4px;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  background: rgba(255,255,255,0.9);
  border-radius: 4px;
  transition: opacity 0.15s;
}

@media (max-width: 720px) {
  .page-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .heading-actions {
    width: 100%;
  }

  .heading-actions .el-input {
    flex: 1;
    width: auto;
  }
}
</style>