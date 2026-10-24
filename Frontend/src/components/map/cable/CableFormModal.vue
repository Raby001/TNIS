<template>
  <aside
    v-if="cableFormOpen"
    class=" relative z-30 flex shrink-0 flex-col border-slate-200 bg-white shadow-xl w-[24rem] h-full border-l
          max-md:absolute
          max-md:bottom-0
          max-md:left-0
          max-md:right-0
          max-md:h-auto
          max-md:max-h-[65vh]
          max-md:w-full
          max-md:rounded-t-2xl
          max-md:border-t
          max-md:border-l-0
        "
  >
    <!-- Header -->
    <div
      class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3"
    >
      <div>
        <p
          class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400"
        >
          Network Infrastructure
        </p>

        <h2 class="mt-1 text-base font-semibold text-slate-900">
          {{ editingCable ? 'Edit Cable' : 'Create Cable' }}
        </h2>
      </div>

      <button
        type="button"
        class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        @click="close"
      >
        <X :size="18" />
      </button>
    </div>

    <!-- Form Content -->
    <div class="min-h-0 flex-1 overflow-y-auto p-4">
      <CableForm />
    </div>

    <!-- Actions -->
    <div
      class="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-white p-4"
    >
      <button
        type="button"
        class="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        @click="close"
      >
        Cancel
      </button>

      <button
        type="button"
        class="flex-1 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!canSave"
        @click="saveCable"
      >
        {{ editingCable ? 'Update Cable' : 'Save Cable' }}
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { X } from 'lucide-vue-next'

import CableForm from './form/CableForm.vue'

import { useMapStore } from '@/stores/map.store'
import {
  fiberCableApi,
} from '@/services/api/fiber-cable.api'
import type {
  CreateFiberCableRequest,
  UpdateFiberCableRequest,
  CableTargetRequest,
  // RouteSegmentRequest,
  InstallationSegmentRequest,
} from '@/types/cable'

const mapStore = useMapStore()

const {
  cableFormOpen,
  draftCable,
  editingCable,
} = storeToRefs(mapStore)

const canSave = computed(() => {
  const cable = draftCable.value

  return Boolean(
    cable.name.trim() &&
    cable.assetTypeId &&
    cable.siteId &&
    cable.statusId &&
    cable.cableTypeId &&
    cable.coreCountId &&
    cable.installationMethodId &&
    cable.startTarget &&
    cable.endTarget,
  )
})

const close = () => {
  mapStore.cancelCableDrawing()
}

const toTargetRequest = (
  target: NonNullable<typeof draftCable.value.startTarget>,
): CableTargetRequest => ({
  targetType: target.type,
  ...(target.type === 'ASSET'
    ? { assetId: target.id }
    : { siteId: target.id }),
})

const buildInstallationSegments =
  (): InstallationSegmentRequest[] => {
    return draftCable.value.installationSegments.map(
      (segment) => ({
        fromTarget: toTargetRequest({
          id: segment.fromTarget.id,
          type: segment.fromTarget.type,
          name: '',
          latitude: 0,
          longitude: 0,
        }),

        toTarget: toTargetRequest({
          id: segment.toTarget.id,
          type: segment.toTarget.type,
          name: '',
          latitude: 0,
          longitude: 0,
        }),

        installationMethodId:
          segment.installationMethodId ??
          draftCable.value.installationMethodId,
      }),
    )
  }

// const buildRouteSegment =
//   (): RouteSegmentRequest | undefined => {
//     const startTarget = draftCable.value.startTarget
//     const endTarget = draftCable.value.endTarget

//     if (!startTarget || !endTarget) {
//       return undefined
//     }

//     return {
//       fromTarget: toTargetRequest(startTarget),

//       toTarget: toTargetRequest(endTarget),

//       targets: draftCable.value.middleTargets.map(
//         toTargetRequest,
//       ),

//       geometry: {
//         type: 'LineString',
//         coordinates: draftCable.value.route,
//       },
//     }
//   }

const saveCable = async () => {
  if (!canSave.value) return

  const cable = draftCable.value

  const startTarget = cable.startTarget
  const endTarget = cable.endTarget

  if (!startTarget || !endTarget) return

  try {
    if (editingCable.value) {
      const request: UpdateFiberCableRequest = {
          name: cable.name,
          description: cable.description || null,

          assetTag: cable.assetTag || null,
          serialNumber: cable.serialNumber || null,

          purchaseDate: cable.purchaseDate || null,
          installationDate: cable.installationDate || null,

          statusId: cable.statusId,
          cableTypeId: cable.cableTypeId,
          installationMethodId:
              cable.installationMethodId,
          coreCountId: cable.coreCountId,
          segmentTypeId:
              cable.segmentTypeId || null,

          startTarget: toTargetRequest(startTarget),

          middleTargets:
              cable.middleTargets.map(
                  toTargetRequest,
              ),

          endTarget: toTargetRequest(endTarget),

          geometry: {
              type: 'LineString',
              coordinates: cable.route,
          },

          installationSegments:
              buildInstallationSegments(),
      }

      await fiberCableApi.update(
          editingCable.value.id,
          request,
      )

      mapStore.cancelCableDrawing()
      return
    }

    // CREATE
    const request: CreateFiberCableRequest = {
      name: cable.name,
      assetTypeId: cable.assetTypeId,
      statusId: cable.statusId,
      siteId: cable.siteId,
      cableTypeId: cable.cableTypeId,
      coreCountId: cable.coreCountId,
      installationMethodId:
        cable.installationMethodId,

      segmentTypeId:
        cable.segmentTypeId || null,

      description:
        cable.description || null,

      startTarget: toTargetRequest(
        startTarget,
      ),

      middleTargets:
        cable.middleTargets.map(
          toTargetRequest,
        ),

      endTarget: toTargetRequest(
        endTarget,
      ),

      installationSegments:
        buildInstallationSegments(),

      geometry: {
        type: 'LineString',
        coordinates: cable.route,
      },

      assetTag: cable.assetTag || null,
      serialNumber: cable.serialNumber || null,

      purchaseDate:
        cable.purchaseDate || null,

      installationDate:
        cable.installationDate || null,
    }

    console.log(
      '[CableFormModal] CREATE FIBER CABLE REQUEST:',
      JSON.stringify(request, null, 2),
    )

    await fiberCableApi.create(request)

    mapStore.cancelCableDrawing()
  } catch (error: any) {
    console.error(
      `Failed to ${
        editingCable.value
          ? 'update'
          : 'create'
      } fiber cable:`,
      error,
    )

    console.error(
      'Fiber cable request:',
      error.config?.data,
    )

    console.error(
      'Backend response:',
      JSON.stringify(
        error.response?.data,
        null,
        2,
      ),
    )

    console.error(
      'Backend status:',
      error.response?.status,
    )
  }
}
</script>
