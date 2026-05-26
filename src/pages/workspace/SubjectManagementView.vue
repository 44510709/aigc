<script setup>
import { useI18n } from 'vue-i18n'
import { demoSubjects } from '../../utils/demoData'

const { t } = useI18n()
</script>

<template>
  <div class="workspace-page">
    <div class="page-heading">
      <div>
        <h1>{{ t('subjects.title') }}</h1>
        <p>{{ t('home.assetDesc') }}</p>
      </div>
      <RouterLink to="/workspace/subjects/new">
        <el-button type="primary">{{ t('subjects.create') }}</el-button>
      </RouterLink>
    </div>

    <div class="subject-grid">
      <RouterLink
        v-for="subject in demoSubjects"
        :key="subject.id"
        class="panel subject-card"
        :to="`/workspace/subjects/${subject.id}`"
      >
        <div class="subject-thumb">{{ subject.name.slice(0, 2).toUpperCase() }}</div>
        <h2>{{ subject.name }}</h2>
        <el-progress :percentage="subject.progress" />
        <el-tag :type="subject.status === 'Ready' ? 'success' : 'info'">{{ subject.status }}</el-tag>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.page-heading h1 {
  margin: 0;
}

.page-heading p {
  margin: 8px 0 0;
  color: #667085;
}

.subject-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.subject-card {
  display: grid;
  gap: 12px;
  padding: 18px;
}

.subject-thumb {
  display: grid;
  height: 112px;
  place-items: center;
  border-radius: 8px;
  color: #615ced;
  background: #eef0ff;
  font-weight: 800;
}

.subject-card h2 {
  margin: 0;
  font-size: 18px;
}
</style>
