<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { demoSubjects } from '../../utils/demoData'

const route = useRoute()
const { t } = useI18n()
const subject = computed(
  () => demoSubjects.find((item) => item.id === Number(route.params.id)) || demoSubjects[0],
)
</script>

<template>
  <div class="subject-detail">
    <section class="panel hero-panel">
      <div>
        <h1>{{ subject.name }}</h1>
        <p>{{ t('subjects.detail') }}</p>
      </div>
      <el-tag :type="subject.status === 'Ready' ? 'success' : 'info'">{{ subject.status }}</el-tag>
    </section>

    <section class="panel gallery-panel">
      <h2>{{ t('subjects.upload') }}</h2>
      <div class="reference-grid">
        <div v-for="index in 3" :key="index">REF {{ index }}</div>
      </div>
    </section>

    <section class="panel">
      <h2>{{ t('subjects.training') }}</h2>
      <el-progress :percentage="subject.progress" />
    </section>
  </div>
</template>

<style scoped>
.subject-detail {
  display: grid;
  gap: 20px;
}

.panel {
  padding: 20px;
}

.hero-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

h1,
h2 {
  margin: 0 0 12px;
}

.hero-panel p {
  margin: 0;
  color: #667085;
}

.reference-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, 1fr);
}

.reference-grid div {
  display: grid;
  min-height: 160px;
  place-items: center;
  border-radius: 8px;
  color: #615ced;
  background: #eef0ff;
  font-weight: 800;
}

@media (max-width: 720px) {
  .reference-grid {
    grid-template-columns: 1fr;
  }
}
</style>
