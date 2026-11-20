<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { brand } from './brand'
import ConnectedNetwork from './ConnectedNetwork.vue'

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
              <v-btn :to="{ name: 'Catalog' }" color="network-cyan" size="large" rounded="lg" class="hero-cta">
                {{ t('brand.catalog') }}
              </v-btn>
              <v-btn href="#leandro" variant="outlined" size="large" rounded="lg">
                {{ t('brand.about') }}
              </v-btn>
            </div>
            <p class="hero-note mt-8 mb-0">{{ t('brand.heroNote') }}</p>
          </v-col>
          <v-col cols="12" md="6">
            <ConnectedNetwork />
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
            <v-btn :href="brand.whatsappHref" color="primary" variant="outlined" size="large" rounded="lg" prepend-icon="mdi-whatsapp">
              {{ t('brand.whatsapp') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="section-space network-section" aria-labelledby="network-title">
      <v-container class="editorial-container">
        <v-row align="center" class="gy-6 mb-8">
          <v-col cols="12" md="9">
            <p class="eyebrow mb-4">{{ t('brand.networkEyebrow') }}</p>
            <h2 id="network-title" class="editorial-heading section-title">{{ t('brand.networkTitle') }}</h2>
            <p class="intro mt-6 mb-0">{{ t('brand.networkIntro') }}</p>
          </v-col>

        </v-row>
        <v-row>
          <v-col v-for="category in categories" :key="category.key" cols="12" sm="6" md="4">
            <v-card :to="{ name: 'Catalog', query: { q: t(`brand.categories.${category.key}.search`) } }" class="category-card h-100 pa-6" variant="flat" rounded="lg">
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
              <v-btn :to="{ name: 'Catalog' }" color="network-cyan" size="large" rounded="lg" class="hero-cta">
                {{ t('brand.catalog') }}
              </v-btn>
              <v-btn :href="brand.whatsappHref" variant="outlined" size="large" rounded="lg" prepend-icon="mdi-whatsapp">
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
.leandro-landing { color: rgb(var(--v-theme-on-background)); background: rgb(var(--v-theme-background)); overflow: clip; }
.editorial-container { max-width: 1240px; padding-inline: clamp(24px, 4vw, 48px); }
.section-space { padding-block: var(--network-section); }
.editorial-heading { font-family: var(--network-font); font-weight: 700; }
.eyebrow { font-size: .875rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; line-height: 1.8; color: rgb(var(--v-theme-primary)); }
.hero { position: relative; background: var(--network-navy); color: var(--network-ice); padding-top: clamp(48px, 7vw, 96px); }
.hero .eyebrow { color: var(--network-cyan); }
.hero-title { font-size: clamp(3rem, 4.2vw, 3.8rem); letter-spacing: -.055em; line-height: 1.07; }
.hero-accent { display: block; color: var(--network-cyan); }
.hero .intro { color: #bfccdd; }
.hero-cta { color: var(--network-navy) !important; font-weight: 700; box-shadow: 0 6px 28px #00c2d91f; }
.section-title { font-size: clamp(2.2rem, 4vw, 3.5rem); letter-spacing: -.045em; line-height: 1.12; }
.intro { max-width: 38rem; font-size: clamp(1rem, 1.4vw, 1.2rem); line-height: 1.8; }
.body-copy { line-height: 1.75; }
.hero-note { color: #bfccdd; font-size: .875rem; line-height: 1.6; }
.profile-section { scroll-margin-top: 100px; }
.portrait-frame { max-width: 440px; overflow: hidden; border-radius: var(--network-radius); background: rgb(var(--v-theme-surface)); border: var(--network-border); box-shadow: var(--network-shadow); }
.portrait { display: block; width: 100%; height: auto; aspect-ratio: 1; object-fit: cover; }
.portrait-caption { border-inline-start: 3px solid var(--network-cyan); }
.signature { font-size: 1.5rem; }
.network-section { background: rgb(var(--v-theme-surface)); border-block: var(--network-border); }
.category-card { background: rgb(var(--v-theme-background)); border: var(--network-border); transition: transform var(--network-motion), border-color var(--network-motion); }
.category-card:hover { transform: translateY(-4px); border-color: rgb(var(--v-theme-primary)); }
.category-icon { color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary),.08); border-radius: 12px; padding: 24px; }
.category-title { font-size: 1.35rem; line-height: 1.3; }
.steps-list { list-style: none; padding: 0; }
.step-panel { border-top: 1px solid rgba(var(--v-theme-primary),.4); position: relative; }
.step-panel::before { content: ''; position: absolute; top: -5px; width: 9px; height: 9px; background: rgb(var(--v-theme-primary)); border-radius: 50%; box-shadow: 0 0 0 6px rgba(var(--v-theme-primary),.08); }
.step-number { color: rgb(var(--v-theme-primary)); font-size: 2rem; line-height: 1; }
.contact-section { background: var(--network-slate); color: var(--network-ice); }
.contact-section .eyebrow { color: var(--network-cyan); }
.phone-link { color: inherit; text-underline-offset: 4px; line-height: 1.7; }
.landing-actions :deep(.v-btn) { max-width: 100%; min-height: 50px; height: auto; padding-block: 14px; }
.landing-actions :deep(.v-btn__content) { white-space: normal; text-align: center; }
@media (max-width: 599px) { .hero-title { font-size: clamp(2.65rem, 10.5vw, 3.6rem); } .landing-actions { align-items: stretch !important; } .landing-actions :deep(.v-btn) { width: 100%; } }
</style>
