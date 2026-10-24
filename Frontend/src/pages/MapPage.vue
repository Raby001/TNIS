<template>
  <div
    class="relative flex h-full w-full overflow-hidden bg-slate-100"
  >
    <!-- Map -->
    <div class="relative min-w-0 flex-1">
      <MapView />

      <!-- Map panels -->
      <div
        v-if="!cableFormOpen"
        class="pointer-events-none absolute left-3 top-3 z-30 w-[min(18rem,calc(100vw-1.5rem))] space-y-2 md:left-4 md:top-4"
      >
        <div class="pointer-events-auto space-y-1">
          <LayerPanel />
          <FilterPanel />
          <LegendPanel />
        </div>
      </div>

      <MapControls />
      <MapToolbar />
      <CoordinateBar />
      <MapActionModal />
    </div>

    <!-- Cable form -->
    <CableFormModal
      v-if="cableFormOpen"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useMapStore } from '@/stores/map.store'

import CoordinateBar from '@/components/map/CoordinateBar.vue'
import FilterPanel from '@/components/map/FilterPanel.vue'
import LayerPanel from '@/components/map/LayerPanel.vue'
import LegendPanel from '@/components/map/LegendPanel.vue'
import MapActionModal from '@/components/map/MapActionModal.vue'
import MapControls from '@/components/map/MapControls.vue'
import MapToolbar from '@/components/map/MapToolbar.vue'
import MapView from '@/components/map/MapView.vue'
import CableFormModal from '@/components/map/cable/CableFormModal.vue'
import { onMounted } from 'vue'

const mapStore = useMapStore()

const {
  cableFormOpen,
} = storeToRefs(mapStore)

onMounted(() => {
  mapStore.loadSites()
})
</script>
