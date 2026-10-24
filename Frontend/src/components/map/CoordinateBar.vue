<template>
  <div class="absolute bottom-4 right-3 z-30 hidden md:block">
    <div class="rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-lg shadow-slate-900/10 backdrop-blur">
      <span class="font-semibold text-slate-900">{{ toolLabel }}</span>
      <span class="mx-2 text-slate-300">|</span>
      <span>{{ cursor.longitude.toFixed(5) }}, {{ cursor.latitude.toFixed(5) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useMapStore } from '@/stores/map.store'

const mapStore = useMapStore()
const { cursor, activeTool } = storeToRefs(mapStore)

const toolLabel = computed(() => {
    switch (activeTool.value) {
    case 'create-site':
      return 'Create Site'
    case 'draw-cable':
      return 'Draw Cable'
    default:
      return 'Navigate'
  }
})
</script>
