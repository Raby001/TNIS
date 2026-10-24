<template>
  <SiteFormModal
    :open="siteFormOpen"
  />
  
  <CableFormModal />

  <AssetPointTypeSelector
    :open="assetPointSelectorOpen"
    @select="handleAssetPointType"
    @conversion-select="handleConversionAssetPointType"
    @cancel="cancelAssetPointCreation"
  />

  <AssetPointFormModal
    :open="assetPointFormOpen"
    :asset-point-type="assetPointType"
    :draft-asset-point="draftAssetPoint"
    :editing-asset-point="editingAssetPoint"
    @cancel="handleAssetPointFormCancel"
    @save="handleAssetPointSave"
  />

  <ObservationForm
    @save="handleFieldObservationSave"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import SiteFormModal from '@/components/map/site/SiteFormModal.vue'

import CableFormModal from '@/components/map/cable/CableFormModal.vue'

import AssetPointTypeSelector from '@/components/map/asset-point/AssetPointTypeSelector.vue'
import AssetPointFormModal from '@/components/map/asset-point/AssetPointFormModal.vue'
import ObservationForm from './asset-point/forms/ObservationForm.vue'

import { useMapStore } from '@/stores/map.store'
import { mapService } from '@/services/index.ts'

import type { AssetType } from '@/types/reference-data'

const mapStore = useMapStore()

const {
  activeTool,
  siteFormOpen,
  assetPointType,
  assetPointFormOpen,
  draftAssetPoint,
  editingAssetPoint,
} = storeToRefs(mapStore)

const assetPointSelectorOpen = ref(false)

watch(
  activeTool,
  (tool) => {
    if (tool === 'create-asset-point') {
      assetPointSelectorOpen.value = true
    } else {
      assetPointSelectorOpen.value = false
    }
  },
  {
    immediate: true,
  },
)

const handleAssetPointType = (
  type: AssetType,
) => {
  mapStore.selectAssetPointType(type)

  assetPointSelectorOpen.value = false
}

const cancelAssetPointCreation = () => {
  assetPointSelectorOpen.value = false

  mapStore.clearFieldObservationConversion()
  mapStore.setActiveTool('navigate')
}

const handleConversionAssetPointType = (
  _type: AssetType,
) => {
  assetPointSelectorOpen.value = false
}

const handleAssetPointFormCancel = () => {
  mapStore.clearFieldObservationConversion()
  mapStore.closeAssetPointForm()
}

const handleAssetPointSave = () => {
  mapService.closePopup()
  mapStore.closeAssetPointForm()
}

const handleFieldObservationSave = () => {
    mapStore.closeFieldObservationForm()
}
</script>
