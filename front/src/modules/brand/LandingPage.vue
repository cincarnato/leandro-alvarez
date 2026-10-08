<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { brand } from './brand'
import neighborhood from '../../assets/brand/neighborhood.svg'
import connections from '../../assets/brand/connections.svg'

const { t } = useI18n()

const categories = [
  { key: 'home', icon: 'mdi-home-outline' },
  { key: 'moving', icon: 'mdi-truck-outline' },
  { key: 'building', icon: 'mdi-hammer-wrench' },
  { key: 'decoration', icon: 'mdi-lamp-outline' },
  { key: 'garden', icon: 'mdi-sprout-outline' },
  { key: 'services', icon: 'mdi-handshake-outline' },
] as const

const steps = ['choose', 'save', 'present'] as const
</script>

<template>
  <article class="leandro-landing" aria-labelledby="landing-title">
    <section class="hero section-space" aria-labelledby="landing-title">
      <v-container class="editorial-container">
        <v-row align="center" class="gy-8">
          <v-col cols="12" md="6">
            <p class="eyebrow mb-6">{{ t('brand.heroEyebrow') }}</p>
            <h1 id="landing-title" class="editorial-heading hero-title">
              {{ t('brand.heroTitle') }}
              <span class="hero-accent">{{ t('brand.heroTitleAccent') }}</span>
            </h1>
            <p class="intro mt-6 mb-8">{{ t('brand.heroIntro') }}</p>
            <div class="d-flex flex-wrap ga-3 landing-actions">
              <v-btn :to="{ name: 'Root' }" color="primary" size="large" rounded="pill" append-icon="mdi-arrow-right">
                {{ t('brand.catalog') }}
              </v-btn>
              <v-btn href="#leandro" variant="outlined" size="large" rounded="pill">
                {{ t('brand.about') }}
              </v-btn>
            </div>
            <p class="hero-note mt-8 mb-0">{{ t('brand.heroNote') }}</p>
          </v-col>
          <v-col cols="12" md="6">
            <figure class="hero-art ma-0">
              <img :src="neighborhood" :alt="t('brand.neighborhoodAlt')" class="neighborhood-image" width="720" height="600" fetchpriority="high" decoding="async">
              <figcaption class="art-caption px-6 py-4">{{ t('brand.illustrationNote') }}</figcaption>
            </figure>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section id="leandro" class="section-space profile-section" aria-labelledby="profile-title" tabindex="-1">
      <v-container class="editorial-container">
        <v-row align="center" justify="space-between" class="gy-8">
          <v-col cols="12" sm="8" md="5">
            <figure class="portrait-frame ma-0">
              <img :src="brand.portrait" :alt="t('brand.portraitAlt')" class="portrait" width="600" height="600" loading="lazy" decoding="async">
              <figcaption class="portrait-caption pa-5">
                <span class="d-block editorial-heading signature">{{ t('brand.profileSignature') }}</span>
                <span class="d-block mt-1 text-body-2">{{ t('brand.profileRole') }}</span>
              </figcaption>
            </figure>
          </v-col>
          <v-col cols="12" md="6">
            <p class="eyebrow mb-4">{{ t('brand.profileEyebrow') }}</p>
            <h2 id="profile-title" class="editorial-heading section-title">{{ t('brand.profileTitle') }}</h2>
            <p class="intro mt-6">{{ t('brand.profileIntro') }}</p>
            <p class="body-copy mt-4 mb-7">{{ t('brand.profileBody') }}</p>
            <v-btn :href="brand.whatsappHref" color="primary" variant="outlined" size="large" rounded="pill" prepend-icon="mdi-whatsapp">
              {{ t('brand.whatsapp') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="section-space network-section" aria-labelledby="network-title">
      <v-container class="editorial-container">
        <v-row align="center" class="gy-6 mb-8">
          <v-col cols="12" md="7">
            <p class="eyebrow mb-4">{{ t('brand.networkEyebrow') }}</p>
            <h2 id="network-title" class="editorial-heading section-title">{{ t('brand.networkTitle') }}</h2>
            <p class="intro mt-6 mb-0">{{ t('brand.networkIntro') }}</p>
          </v-col>
          <v-col cols="12" md="5">
            <img :src="connections" :alt="t('brand.connectionsAlt')" class="connections-image" width="600" height="400" loading="lazy" decoding="async">
          </v-col>
        </v-row>
        <v-row>
          <v-col v-for="category in categories" :key="category.key" cols="12" sm="6" md="4">
            <v-card tag="article" class="category-card h-100 pa-6" variant="flat" rounded="lg">
              <v-icon :icon="category.icon" class="category-icon mb-5" size="30" aria-hidden="true" />
              <h3 class="editorial-heading category-title mb-3">{{ t(`brand.categories.${category.key}.title`) }}</h3>
              <p class="body-copy mb-0">{{ t(`brand.categories.${category.key}.description`) }}</p>
            </v-card>
          </v-col>
        </v-row>
        <p class="body-copy mt-6 mb-0">{{ t('brand.termsHint') }}</p>
      </v-container>
    </section>

    <section class="section-space" aria-labelledby="steps-title">
      <v-container class="editorial-container">
        <p class="eyebrow mb-4">{{ t('brand.stepsEyebrow') }}</p>
        <h2 id="steps-title" class="editorial-heading section-title">{{ t('brand.stepsTitle') }}</h2>
        <p class="intro mt-4 mb-8">{{ t('brand.stepsIntro') }}</p>
        <v-row tag="ol" class="steps-list">
          <v-col v-for="(step, index) in steps" :key="step" tag="li" cols="12" md="4">
            <div class="step-panel h-100 py-6 pr-md-6">
              <span class="step-number editorial-heading d-block mb-5" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
              <h3 class="editorial-heading category-title mb-3">{{ t(`brand.steps.${step}.title`) }}</h3>
              <p class="body-copy mb-0">{{ t(`brand.steps.${step}.description`) }}</p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="contact-section section-space" aria-labelledby="contact-title">
      <v-container class="editorial-container">
        <v-row align="center" justify="space-between" class="gy-6">
          <v-col cols="12" md="7">
            <p class="eyebrow mb-4">{{ t('brand.contactEyebrow') }}</p>
            <h2 id="contact-title" class="editorial-heading section-title">{{ t('brand.contactTitle') }}</h2>
            <p class="intro mt-5 mb-0">{{ t('brand.contactIntro') }}</p>
          </v-col>
          <v-col cols="12" md="5">
            <div class="d-flex flex-column align-start ga-4 landing-actions">
              <v-btn :to="{ name: 'Root' }" color="primary" size="large" rounded="pill" append-icon="mdi-arrow-right">
                {{ t('brand.catalog') }}
              </v-btn>
              <v-btn :href="brand.whatsappHref" variant="outlined" size="large" rounded="pill" prepend-icon="mdi-whatsapp">
                {{ t('brand.whatsapp') }}
              </v-btn>
              <a :href="brand.phoneHref" class="phone-link mt-2" :aria-label="`${t('brand.call')}: ${brand.phone}`">
                {{ t('brand.contactPhone', { phone: brand.phone }) }}
              </a>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </article>
</template>

<style scoped>
.leandro-landing {
  --editorial-ink: var(--v-theme-brand-ink, 24, 51, 72);
  --editorial-sand: var(--v-theme-brand-sand, 245, 240, 232);
  --editorial-terracotta: var(--v-theme-brand-terracotta, 184, 81, 61);
  color: rgb(var(--v-theme-on-background));
  background: rgb(var(--v-theme-background));
}

.editorial-container {
  max-width: 1200px;
  padding-inline: clamp(24px, 4vw, 48px);
}

.section-space { padding-block: clamp(56px, 8vw, 104px); }
.editorial-heading { font-family: Georgia, 'Times New Roman', serif; font-weight: 400; }
.eyebrow { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; line-height: 1.8; }
.hero { background: rgba(var(--editorial-sand), 0.14); }
.hero-title { font-size: clamp(3rem, 5.6vw, 5.2rem); letter-spacing: -0.055em; line-height: 1.06; text-wrap: balance; }
.hero-accent { display: block; color: rgb(var(--v-theme-secondary)); font-style: italic; }
.section-title { font-size: clamp(2.25rem, 4vw, 3.65rem); letter-spacing: -0.04em; line-height: 1.12; text-wrap: balance; }
.intro { max-width: 38rem; font-size: clamp(1.05rem, 1.4vw, 1.2rem); line-height: 1.8; }
.body-copy { line-height: 1.75; }
.hero-note { font-size: 0.8rem; line-height: 1.6; }

.hero-art {
  overflow: hidden;
  border-radius: 48% 48% 12px 12px;
  background: rgb(var(--editorial-sand));
  color: rgb(var(--editorial-ink));
  border: 1px solid rgba(var(--editorial-ink), 0.12);
}

.neighborhood-image { display: block; width: 100%; height: auto; aspect-ratio: 6 / 5; object-fit: contain; }
.art-caption { border-top: 1px solid rgba(var(--editorial-ink), 0.12); font-family: Georgia, 'Times New Roman', serif; font-style: italic; text-align: center; line-height: 1.6; }
.profile-section { scroll-margin-top: 100px; }
.portrait-frame { max-width: 440px; overflow: hidden; border-radius: 12px; background: rgb(var(--v-theme-surface)); }
.portrait { display: block; width: 100%; height: auto; aspect-ratio: 1; object-fit: cover; }
.portrait-caption { border-inline-start: 3px solid rgb(var(--editorial-terracotta)); color: rgb(var(--v-theme-on-surface)); }
.signature { font-size: 1.7rem; }
.network-section { background: rgba(var(--editorial-sand), 0.14); }
.connections-image { display: block; width: 100%; height: auto; max-height: 300px; object-fit: contain; border-radius: 12px; background: rgb(var(--editorial-sand)); }
.category-card { background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface)); border: 1px solid rgba(var(--v-theme-on-surface), 0.14); }
.category-icon { color: rgb(var(--v-theme-secondary)); }
.category-title { font-size: 1.6rem; line-height: 1.25; }
.steps-list { list-style: none; padding: 0; }
.step-panel { border-top: 1px solid rgba(var(--v-theme-on-background), 0.25); }
.step-number { color: rgb(var(--v-theme-secondary)); font-size: 2.6rem; line-height: 1; }
.contact-section { border-top: 1px solid rgba(var(--v-theme-on-background), 0.15); background: rgba(var(--editorial-sand), 0.14); }
.phone-link { color: inherit; text-underline-offset: 4px; line-height: 1.7; }

.leandro-landing :deep(a:focus-visible) { outline: 3px solid rgb(var(--v-theme-secondary)); outline-offset: 5px; }
.landing-actions :deep(.v-btn) { max-width: 100%; min-height: 48px; height: auto; padding-block: 12px; }
.landing-actions :deep(.v-btn__content) { white-space: normal; text-align: center; }

@media (max-width: 599px) {
  .hero-title { font-size: clamp(2.65rem, 11vw, 3.6rem); }
  .hero-art { max-width: 420px; margin-inline: auto !important; }
  .landing-actions { align-items: stretch !important; }
  .landing-actions :deep(.v-btn) { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .leandro-landing :deep(*) { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
</style>
