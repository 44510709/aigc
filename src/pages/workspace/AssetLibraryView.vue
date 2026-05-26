<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search } from '@element-plus/icons-vue'
import { demoAssets } from '../../utils/demoData'

const { t } = useI18n()
const keyword = ref('')
</script>

<template>
  <div class="workspace-page">
    <div class="page-heading">
      <div>
        <h1>{{ t('assets.title') }}</h1>
        <p>{{ t('assets.subtitle') }}</p>
      </div>
      <el-input v-model="keyword" :prefix-icon="Search" :placeholder="t('assets.search')" />
    </div>

    <div class="asset-grid">
      <RouterLink
        v-for="asset in demoAssets"
        :key="asset.id"
        class="panel asset-card"
        :to="`/workspace/assets/${asset.id}`"
      >
        <div class="asset-thumb" :class="`tone-${asset.tone}`"></div>
        <strong>{{ asset.title }}</strong>
        <span>{{ asset.type }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.workspace-page {
  display: grid;
  gap: 20px;
}

.page-heading {
  display: grid;
  gap: 18px;
  grid-template-columns: 1fr minmax(260px, 360px);
  align-items: center;
}

.page-heading h1 {
  margin: 0;
}

.page-heading p {
  margin: 8px 0 0;
  color: #667085;
}

.asset-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
}

.asset-card {
  overflow: hidden;
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.asset-card:hover {
  border-color: #b8b5ff;
  transform: translateY(-2px);
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

@media (max-width: 720px) {
  .page-heading {
    grid-template-columns: 1fr;
  }
}
</style>
