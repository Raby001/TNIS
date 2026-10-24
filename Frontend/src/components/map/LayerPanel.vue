<template>
  <AppCollapsible
    title="Layers"
    :icon="Layers3"
    :default-open="false"
    compact
  >
    <div class="space-y-2.5 p-2.5">
      <!-- Current tool -->
      <div
        class="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2"
      >
        <span
          class="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
        >
          Tool
        </span>

        <span class="text-xs font-bold text-slate-700">
          {{ toolLabel }}
        </span>
      </div>

      <!-- Layers -->
      <button
        v-for="item in layerItems"
        :key="item.key"
        type="button"
        class="group flex w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-2.5 text-left transition-all duration-150 hover:-translate-y-px hover:border-slate-300 hover:shadow-md"
        :class="
          item.enabled
            ? 'border-slate-200 bg-white'
            : 'border-slate-200 bg-slate-50 opacity-70'
        "
        @click="toggleLayer(item.key)"
      >
        <!-- Label -->
        <span
          class="inline-flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-700"
        >
          <span
            class="h-2 w-2 shrink-0 rounded-full ring-2 ring-white"
            :class="item.dotClass"
          />

          <span class="truncate">
            {{ item.label }}
          </span>
        </span>

        <!-- Status + count -->
        <span class="inline-flex shrink-0 items-center gap-1.5">
          <span
            class="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
            :class="
              item.enabled
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-200 text-slate-500'
            "
          >
            {{ item.enabled ? 'On' : 'Off' }}
          </span>

          <span
            class="min-w-[1rem] text-right text-[11px] font-medium text-slate-400"
          >
            {{ item.count }}
          </span>
        </span>
      </button>
    </div>
  </AppCollapsible>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Layers3 } from 'lucide-vue-next'

import AppCollapsible from '@/components/common/AppCollapsible.vue'
import { useMapStore } from '@/stores/map.store'

const mapStore = useMapStore()

const {
  layerCounts,
  activeTool,
  filters,
} = storeToRefs(mapStore)

const layerItems = computed(() => [
  {
    key: 'sites' as const,
    label: 'Sites',
    dotClass: 'bg-emerald-500',
    count: layerCounts.value.sites,
    enabled: filters.value.sites,
  },

  {
    key: 'assetPoints' as const,
    label: 'Asset Points',
    dotClass: 'bg-blue-500',
    count: layerCounts.value.assetPoints,
    enabled: filters.value.assetPoints,
  },

  {
    key: 'fieldObservations' as const,
    label: 'Field Observations',
    dotClass: 'bg-amber-500',
    count: layerCounts.value.fieldObservations,
    enabled: filters.value.fieldObservations,
  },

  {
    key: 'cables' as const,
    label: 'Cables',
    dotClass: 'bg-indigo-500',
    count: layerCounts.value.cables,
    enabled: filters.value.cables,
  },
])

const toolLabel = computed(() => {
  switch (activeTool.value) {
    case 'create-site':
      return 'Create Site'
    
    case 'create-field-observation':
      return 'Mark Temp Point'

    case 'create-asset-point':
      return 'Create Asset Point'

    case 'draw-cable':
      return 'Draw Cable'

    default:
      return 'Pan'
  }
})

const toggleLayer = (
  key:
    | 'sites'
    | 'assetPoints'
    | 'fieldObservations'
    | 'cables',
) => {
  mapStore.setFilter(
    key,
    !filters.value[key],
  )
}
</script>