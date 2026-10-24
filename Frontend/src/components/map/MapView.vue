<template>
  <div
    ref="viewport"
    class="relative h-full w-full"
  >
    <div
      ref="mapContainer"
      class="absolute inset-0 h-full w-full"
    />

    <CableOverlay
    v-if="filters.cables"
      ref="cableOverlayRef"
      :map="map"
      :cables="cables"
      :draft-route="draftCablePreviewRoute"
      :draft-sub-points="draftCable.subPoints"
      :selected-cable-id="selectedCableId"
    />

    <ConfirmDialog
      :open="deleteDialogOpen"
      :title="`Delete ${deleteTarget?.type ?? 'item'}`"
      :message="`Are you sure you want to delete ${deleteTarget?.name ?? 'this item'}? This action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      :loading="deleting"
      loading-text="Deleting..."
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
} from 'vue'
import { useMap } from '@/composables/useMap'
import { storeToRefs } from 'pinia'

import { useMapStore } from '@/stores/map.store'
import CableOverlay from '@/components/map/cable/CableOverlay.vue'
import ConfirmDialog from '../common/ConfirmDialog.vue'

const mapStore = useMapStore()

const {
  map,
  cables,
  filters,
  draftCable,
  draftCablePreviewRoute,
  selectedCableId,
  deleting,
  deleteTarget,
  deleteDialogOpen,
} = storeToRefs(mapStore)

const {
  mapContainer,
  cableHitTest,
  confirmDelete,
  cancelDelete,
} = useMap()

const cableOverlayRef =
  ref<InstanceType<typeof CableOverlay> | null>(null)

watch(
  cableOverlayRef,
  (overlay) => {
    cableHitTest.value =
      overlay?.findCableAtPoint ?? null
  },
  {
    immediate: true,
  },
)
</script>