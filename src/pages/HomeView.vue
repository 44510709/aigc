<script setup>
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { Box, Film, Picture, VideoPlay } from '@element-plus/icons-vue'
import AppHeader from '../components/AppHeader.vue'

const { t } = useI18n()

const featureCards = [
  {
    icon: Film,
    titleKey: 'nav.scriptToVideo',
    descKey: 'home.scriptDesc',
    actionKey: 'home.tryScript',
    name: 'script-to-video',
    tags: ['Multi-scene', 'Style Selection'],
  },
  {
    icon: Picture,
    titleKey: 'nav.imageToVideo',
    descKey: 'home.imageDesc',
    actionKey: 'home.tryImage',
    name: 'image-to-video',
    tags: ['Animation Presets', 'BGM'],
  },
  {
    icon: Box,
    titleKey: 'nav.assetLibrary',
    descKey: 'home.assetDesc',
    actionKey: 'home.browseAssets',
    name: 'asset-library',
    tags: ['Smart Search', 'One-click Use'],
  },
]

const testimonials = ['Sarah Chen', 'Marcus Rodriguez', 'Emily Johnson']
</script>

<template>
  <div class="page home-page">
    <AppHeader />

    <section class="hero container">
      <h1>{{ t('home.heroTitle') }}</h1>
      <p>{{ t('home.heroDesc') }}</p>
      <div class="hero-actions">
        <RouterLink :to="{ name: 'image-to-video' }">
          <el-button type="primary" size="large">{{ t('common.startFree') }}</el-button>
        </RouterLink>
      </div>
      <video
        class="hero-video"
        src="https://d.tmpfile.link/public/2026-06-10/0b09bc32-34f3-4bde-95c2-54339d22a3e4/秦PLS.mp4"
        controls
        autoplay
        muted
        loop
        playsinline
      ></video>
    </section>

    <section class="features container">
      <article v-for="card in featureCards" :key="card.name" class="feature-card panel">
        <el-icon class="feature-icon"><component :is="card.icon" /></el-icon>
        <h2>{{ t(card.titleKey) }}</h2>
        <p>{{ t(card.descKey) }}</p>
        <div class="tag-row">
          <el-tag v-for="tag in card.tags" :key="tag" effect="plain" round>{{ tag }}</el-tag>
        </div>
        <RouterLink :to="{ name: card.name }" class="feature-link">{{ t(card.actionKey) }} -></RouterLink>
      </article>
    </section>

    <section class="how-section">
      <div class="container how-grid">
        <div>
          <h2 class="section-title">{{ t('home.howTitle') }}</h2>
          <ol class="steps-list">
            <li>
              <span>1</span>
              <strong>{{ t('home.steps.input') }}</strong>
              <p>{{ t('home.steps.inputDesc') }}</p>
            </li>
            <li>
              <span>2</span>
              <strong>{{ t('home.steps.style') }}</strong>
              <p>{{ t('home.steps.styleDesc') }}</p>
            </li>
            <li>
              <span>3</span>
              <strong>{{ t('home.steps.generate') }}</strong>
              <p>{{ t('home.steps.generateDesc') }}</p>
            </li>
          </ol>
        </div>
        <video
          class="process-video"
          src="https://d.tmpfile.link/public/2026-06-05/de7604fd-db18-49bf-8471-eb14a5c4410f/6月5日.mp4"
          controls
          autoplay
          muted
          loop
          playsinline
        ></video>
      </div>
    </section>

    <section class="container love-section">
      <h2 class="section-title">{{ t('home.loved') }}</h2>
      <div class="testimonial-grid">
        <article v-for="name in testimonials" :key="name" class="testimonial-card panel">
          <div class="avatar-line">
            <el-avatar :size="34">{{ name.charAt(0) }}</el-avatar>
            <div>
              <strong>{{ name }}</strong>
              <div class="stars">★★★★★</div>
            </div>
          </div>
          <p>"AI Studio made video creation feel fast and approachable."</p>
        </article>
      </div>
    </section>

    <footer class="home-footer">
      <div class="container">
        <strong>{{ t('common.logo') }}</strong>
        <p>© 2026 {{ t('common.appName') }}. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home-page {
  background: #fff;
}

.hero {
  padding: 70px 0 58px;
  text-align: center;
}

.hero h1 {
  max-width: 780px;
  margin: 0 auto 16px;
  font-size: clamp(34px, 5vw, 52px);
  line-height: 1.1;
}

.hero p {
  margin: 0;
  color: #667085;
  font-size: 17px;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin: 30px 0 38px;
}

.hero-preview {
  display: grid;
  min-height: 300px;
  place-items: center;
  border-radius: 8px;
  color: #7a8497;
  background:
    linear-gradient(135deg, rgb(97 92 237 / 16%), rgb(15 23 42 / 5%)),
    #e8ebf1;
}

.hero-video {
  width: 100%;
  max-width: 960px;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  background: #000;
  object-fit: contain;
}

.hero-preview .el-icon {
  width: 54px;
  height: 54px;
  margin-bottom: 8px;
  color: #615ced;
  font-size: 54px;
}

.features {
  display: grid;
  gap: 22px;
  grid-template-columns: repeat(3, 1fr);
  padding: 28px 0 70px;
}

.feature-card {
  padding: 24px;
}

.feature-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  color: #615ced;
  background: #eef0ff;
  font-size: 19px;
}

.feature-card h2 {
  margin: 18px 0 8px;
  font-size: 18px;
}

.feature-card p {
  min-height: 44px;
  margin: 0 0 14px;
  color: #667085;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.feature-link {
  color: #514be2;
  font-weight: 700;
}

.how-section {
  padding: 62px 0;
  background: #f7f8fb;
}

.how-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 72px;
  align-items: center;
}

.process-video {
  width: 100%;
  max-height: 360px;
  border-radius: 8px;
  background: #000;
  object-fit: contain;
}

.steps-list {
  display: grid;
  gap: 22px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.steps-list li {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 4px 12px;
}

.steps-list span {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: #615ced;
  font-weight: 800;
}

.steps-list p {
  grid-column: 2;
  margin: 0;
  color: #667085;
}

.love-section {
  padding: 62px 0;
  text-align: center;
}

.testimonial-grid {
  display: grid;
  gap: 22px;
  grid-template-columns: repeat(3, 1fr);
  text-align: left;
}

.testimonial-card {
  padding: 20px;
}

.avatar-line {
  display: flex;
  gap: 10px;
  align-items: center;
}

.stars {
  color: #f5a524;
  font-size: 13px;
}

.testimonial-card p {
  margin: 14px 0 0;
  color: #475467;
}

.home-footer {
  padding: 44px 0;
  border-top: 1px solid #eef0f5;
  color: #667085;
}

.home-footer strong {
  color: #615ced;
}

@media (max-width: 820px) {
  .features,
  .how-grid,
  .testimonial-grid {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    flex-direction: column;
  }
}
</style>
