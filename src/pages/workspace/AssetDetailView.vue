<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { demoAssets } from '../../utils/demoData'

const route = useRoute()
const { t } = useI18n()

const asset = computed(() => demoAssets.find((item) => item.id === Number(route.params.id)) || demoAssets[0])
</script>

<template>
  <div class="detail-grid">
    <section class="panel preview-panel">
      <div class="asset-preview" :class="`tone-${asset.tone}`"></div>
      <div class="thumb-row">
        <span v-for="item in demoAssets.slice(0, 5)" :key="item.id" :class="`tone-${item.tone}`"></span>
      </div>
    </section>

    <section class="panel info-panel">
      <el-tag>{{ asset.type }}</el-tag>
      <h1>{{ t('assets.detailTitle') }}</h1>
      <p>
        A reusable visual reference for generating consistent AI video scenes. Metadata and
        licensing fields can be wired to the backend later.
      </p>
      <el-divider />
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ asset.id }}</el-descriptions-item>
        <el-descriptions-item label="Format">PNG / MP4</el-descriptions-item>
        <el-descriptions-item label="License">Royalty-free</el-descriptions-item>
      </el-descriptions>
      <RouterLink to="/workspace/image-to-video">
        <el-button type="primary" class="use-button">{{ t('assets.useAsset') }}</el-button>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.detail-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) 420px;
}

.preview-panel,
.info-panel {
  padding: 20px;
}

.asset-preview {
  min-height: 390px;
  border-radius: 8px;
}

.thumb-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.thumb-row span {
  width: 68px;
  height: 48px;
  border-radius: 6px;
}

.info-panel h1 {
  margin: 14px 0 10px;
  font-size: 28px;
}

.info-panel p {
  color: #667085;
}

.use-button {
  width: 100%;
  margin-top: 22px;
}

.tone-warm {
  background: linear-gradient(135deg, #f59e0b, #7c2d12);
}

.tone-blue {
  background: linear-gradient(135deg, #38bdf8, #1e3a8a);
}

.tone-dark {
  background: linear-gradient(135deg, #475569, #020617);
}

.tone-pink {
  background: linear-gradient(135deg, #f9a8d4, #7e22ce);
}

.tone-colorful {
  background: linear-gradient(135deg, #f97316, #06b6d4, #7c3aed);
}

.tone-green {
  background: linear-gradient(135deg, #84cc16, #166534);
}

@media (max-width: 980px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
