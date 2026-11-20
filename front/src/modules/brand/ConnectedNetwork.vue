<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// Fixed geometry avoids layout work, random particles and pointer listeners.
const nodes = [ [115,100], [310,65], [490,140], [550,315], [420,445], [210,470], [65,340], [185,260], [380,230], [320,360], [95,200], [485,390] ]
const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[0,7],[7,8],[8,2],[8,3],[7,9],[9,4],[9,5],[6,7],[1,8],[10,7],[11,9]]
const labels = [{ x: 18, y: 21, icon: 'mdi-account-multiple-outline', key: 'people' }, { x: 70, y: 30, icon: 'mdi-storefront-outline', key: 'businesses' }, { x: 33, y: 76, icon: 'mdi-ticket-percent-outline', key: 'benefits' }]
</script>
<template>
  <div class="connected-network" aria-hidden="true">
    <div class="network-orbit orbit-one" /><div class="network-orbit orbit-two" />
    <svg viewBox="0 0 620 540" class="network-geometry" focusable="false">
      <defs><radialGradient id="nodeHalo"><stop stop-color="#00C2D9" stop-opacity=".24"/><stop offset="1" stop-color="#00C2D9" stop-opacity="0"/></radialGradient></defs>
      <g class="network-lines"><line v-for="([a,b], i) in edges" :key="i" :x1="nodes[a!]![0]" :y1="nodes[a!]![1]" :x2="nodes[b!]![0]" :y2="nodes[b!]![1]" /></g>
      <path class="network-signal" d="M115 100 L185 260 L380 230 L490 140" />
      <g v-for="([x,y], i) in nodes" :key="i">
        <circle :cx="x" :cy="y" :r="i % 3 === 0 ? 42 : 20" fill="url(#nodeHalo)" />
        <circle :cx="x" :cy="y" :r="i % 3 === 0 ? 6 : 3" :fill="i === 4 ? '#8B5CF6' : '#00C2D9'" />
      </g>
      <circle cx="310" cy="270" r="66" fill="#0B1220" stroke="#00C2D9" stroke-opacity=".35" />
      <circle cx="310" cy="270" r="54" fill="#17243A" />
      <text x="310" y="283" text-anchor="middle" fill="#F6F8FC" font-size="36" font-weight="600" font-family="sans-serif">LA</text>
    </svg>
    <div v-for="label in labels" :key="label.key" class="network-label" :style="{left: label.x + '%', top: label.y + '%'}"><v-icon :icon="label.icon" size="22" /><span>{{ t(`brand.nodes.${label.key}`) }}</span></div>
    <span class="network-caption">{{ t('brand.essence') }}</span>
  </div>
</template>
<style scoped>
.connected-network { position: relative; width: 100%; aspect-ratio: 1.1; isolation: isolate; background: radial-gradient(ellipse, #00c2d913, transparent 68%); }
.network-geometry { position: absolute; inset: 0; width: 100%; height: 100%; }
.network-lines { stroke: #00C2D9; stroke-opacity: .23; stroke-width: 1; }
.network-signal { fill: none; stroke: #77e8f5; stroke-width: 2; stroke-dasharray: 8 420; animation: signal 10s linear infinite; }
.network-orbit { position: absolute; inset: 13%; border: 1px solid #ffffff09; border-radius: 50%; transform: rotate(-25deg) scaleY(.75); }
.orbit-two { inset: 3%; transform: rotate(35deg) scaleY(.8); }
.network-label { position: absolute; display: flex; align-items: center; gap: 10px; padding: 13px 18px; background: #17243aeb; border: 1px solid #ffffff25; border-radius: 14px; box-shadow: 0 12px 36px #0003; font-size: .875rem; color: #f6f8fc; }
.network-label .v-icon { color: var(--network-cyan); }
.network-caption { position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #acbfd4; font-size: .875rem; letter-spacing: .06em; }
@keyframes signal { to { stroke-dashoffset: -856; } }
@media (max-width: 599px) { .network-label { padding: 10px; gap: 6px; font-size: .75rem; } }
</style>
