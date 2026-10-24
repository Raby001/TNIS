<template>
  <div class="space-y-6">

    <!-- Cable Information -->
    <section>
      <div class="mb-4">
        <h3 class="text-sm font-semibold text-slate-900">
          Cable Information
        </h3>

        <p class="mt-1 text-xs text-slate-500">
          Enter the basic information for this cable.
        </p>
      </div>

      <div class="space-y-4">

        <!-- Cable Name -->
        <FormLabel
          label="Cable Name"
          required
        />

          <input
            v-model="draftCable.name"
            type="text"
            placeholder="Cable name"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />

        <div v-if="!editingCable">
          <!-- Province -->
          <FormLabel
            label="Province"
          />

          <select
            v-model="selectedProvinceId"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            @change="handleProvinceChange(selectedProvinceId)"
          >
            <option value="">
              All provinces
            </option>

            <option
              v-for="province in provinces"
              :key="province.value"
              :value="province.value"
            >
              {{ province.label }}
            </option>
          </select>

          <p class="text-xs text-slate-500">
            <span v-if="loadingSites">
              Loading sites...
            </span>

            <span v-else>
              {{ sites.length }}
              {{ sites.length === 1 ? 'site' : 'sites' }}
              available
            </span>
          </p>
        </div>

        <div v-if="!editingCable">
          <!-- Site -->
          <FormLabel
            label="Site"
            required
          />

          <select
            v-model="draftCable.siteId"
            :disabled="loadingSites"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {{ loadingSites ? 'Loading sites...' : 'Select site' }}
            </option>

            <option
              v-for="site in sites"
              :key="site.value"
              :value="site.value"
            >
              {{ site.label }}
            </option>
          </select>
        </div>

        <!-- Cable Type -->
        <FormLabel
          label="Cable Type"
          required
        />

          <select
            v-model="draftCable.cableTypeId"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">
              Select cable type
            </option>

            <option
              v-for="type in cableTypes"
              :key="type.value"
              :value="type.value"
            >
              {{ type.label }}
            </option>
          </select>

        <!-- Cable Core -->
        <FormLabel
          label="Core Count"
          required
        />

          <select
            v-model="draftCable.coreCountId"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">
              Select cable core
            </option>

            <option
              v-for="core in coreCounts"
              :key="core.value"
              :value="core.value"
            >
              {{ core.label }}
            </option>
          </select>

        <!-- Installation Method -->
        <div>
          <FormLabel
            label="Installation Method"
            required
          />

          <select
            v-model="draftCable.installationMethodId"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">
              Select installation method
            </option>

            <option
              v-for="method in installationMethods"
              :key="method.value"
              :value="method.value"
            >
              {{ method.label }}
            </option>
          </select>

          <p class="mt-1 text-[11px] text-slate-400">
            Default installation method for the cable.
          </p>
        </div>

        <!-- Status -->
        <FormLabel
          label="Status"
          required
        />

          <select
            v-model="draftCable.statusId"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">
              Select status
            </option>

            <option
              v-for="status in statuses"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </option>
          </select>

        <!-- Segment Type -->
        <FormLabel
          label="Segment Type"
          required
        />

          <select
            v-model="draftCable.segmentTypeId"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">
              Select segment type
            </option>

            <option
              v-for="segment in segmentTypes"
              :key="segment.value"
              :value="segment.value"
            >
              {{ segment.label }}
            </option>
          </select>

        <!-- Asset Tag -->
        <FormLabel
          label="Asset Tag"
          optional
        />

          <input
            v-model="draftCable.assetTag"
            type="text"
            placeholder="Asset Tag"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />

        <!-- Serial Number -->
        <FormLabel
          label="Serial Number"
          optional
        />

          <input
            v-model="draftCable.serialNumber"
            type="text"
            placeholder="N/A"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />

        <!-- Description -->
        <FormLabel
          label="Description"
          optional
        />

          <textarea
            v-model="draftCable.description"
            rows="3"
            placeholder="Optional description"
            class="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />

        <!-- Purchase Date -->
        <FormLabel
          label="Purchase Date"
          optional
        />

        <input
          v-model="draftCable.purchaseDate"
          type="date"
          class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />

        <!-- Installation Date -->
        <FormLabel
          label="Installation Date"
          optional
        />

        <input
          v-model="draftCable.installationDate"
          type="date"
          class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </div>
    </section>

    <!-- Divider -->
    <div class="border-t border-slate-200" />

    <!-- Cable Route -->
    <section>
      <div class="mb-4">
        <h3 class="text-sm font-semibold text-slate-900">
          Cable Route
        </h3>

        <p class="mt-1 text-xs text-slate-500">
          Choose a Site or Asset Point for the start and end of the cable.
        </p>
      </div>

      <div class="space-y-3">

        <!-- Start Target -->
        <div
          class="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-3"
        >
          <div class="min-w-0">
            <p class="text-xs font-medium text-slate-700">
              Start Target
            </p>

            <p
              v-if="startTarget"
              class="mt-1 truncate text-xs text-slate-500"
            >
              {{ startTarget.name }}
            </p>

            <p
              v-else
              class="mt-1 text-xs text-slate-400"
            >
              Select a Site or Asset Point
            </p>
          </div>

          <button
            type="button"
            class="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition"
            :class="
              cableDrawingStep === 'selecting-start'
                ? 'border border-blue-200 bg-blue-50 text-blue-700'
                : 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
            "
            @click="startSelectingStart"
          >
            {{
              cableDrawingStep === 'selecting-start'
                ? 'Click on map...'
                : startTarget
                  ? 'Change'
                  : 'Select'
            }}
          </button>
        </div>

        <!-- Middle Targets -->
        <div
          class="rounded-lg border border-slate-200 px-3 py-3"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-medium text-slate-700">
                Middle Targets
              </p>

              <p class="mt-1 text-xs text-slate-400">
                Optional Site or Asset targets
              </p>
            </div>
          </div>

          <div
            v-if="middleTargets.length"
            class="mt-3 space-y-2 border-t border-slate-100 pt-3"
          >
            <div
              v-for="(target, index) in middleTargets"
              :key="`${target.type}-${target.id}-${index}`"
              class="flex items-center justify-between gap-3"
            >
              <div class="min-w-0">
                <p class="text-xs text-slate-600">
                  {{ index + 1 }}.
                  {{ target.type === 'SITE' ? 'Site' : 'Asset' }}
                </p>

                <p
                  class="mt-0.5 truncate text-[10px] text-slate-400"
                >
                  {{ target.name }}
                </p>
              </div>

              <div class="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  class="text-xs font-medium text-blue-600 transition hover:text-blue-700"
                  @click="replaceMiddleTarget(index)"
                >
                  {{
                    cableDrawingStep === 'replacing-middle-target'
                    && middleTargetReplacementIndex === index
                      ? 'Click on map...'
                      : 'Change'
                  }}
                </button>

                <button
                  type="button"
                  class="text-xs font-medium text-red-500 transition hover:text-red-600"
                  @click="removeMiddleTarget(index)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <p
            v-else
            class="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400"
          >
            No middle targets added
          </p>
        </div>

        <!-- Sub Points -->
        <div
          class="rounded-lg border border-slate-200 px-3 py-3"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-medium text-slate-700">
                Sub Points
              </p>

              <p class="mt-1 text-xs text-slate-400">
                Optional route guidance
              </p>
            </div>

            <button
              type="button"
              :disabled="!startTarget || !!endTarget"
              class="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
              :class="
                cableDrawingStep === 'adding-sub-point'
                  ? 'border border-blue-200 bg-blue-50 text-blue-700'
                  : 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
              "
              @click="addSubPointMode"
            >
              {{
                cableDrawingStep === 'adding-sub-point'
                  ? 'Click on map...'
                  : '+ Add'
              }}
            </button>
          </div>

          <!-- Sub Point List -->
          <div
            v-if="subPoints.length"
            class="mt-3 space-y-2 border-t border-slate-100 pt-3"
          >
            <div
              v-for="(point, index) in subPoints"
              :key="index"
              class="flex items-center justify-between gap-3"
            >
              <div class="min-w-0">
                <p class="text-xs text-slate-600">
                  Sub Point {{ index + 1 }}
                </p>

                <p class="mt-0.5 truncate text-[10px] text-slate-400">
                  {{ point.latitude.toFixed(6) }},
                  {{ point.longitude.toFixed(6) }}
                </p>
              </div>

              <div class="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  class="text-xs font-medium text-blue-600 transition hover:text-blue-700"
                  @click="replaceSubPoint(index)"
                >
                  {{
                    cableDrawingStep === 'replacing-sub-point'
                    && subPointReplacementIndex === index
                      ? 'Click on map...'
                      : 'Change'
                  }}
                </button>

                <button
                  type="button"
                  class="text-xs font-medium text-red-500 transition hover:text-red-600"
                  @click="removeSubPoint(index)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <p
            v-else
            class="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400"
          >
            No sub points added
          </p>
        </div>

        <!-- End Target -->
        <div
          class="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-3"
        >
          <div class="min-w-0">
            <p class="text-xs font-medium text-slate-700">
              End Target
            </p>

            <p
              v-if="endTarget"
              class="mt-1 truncate text-xs text-slate-500"
            >
              {{ endTarget.name }}
            </p>

            <p
              v-else
              class="mt-1 text-xs text-slate-400"
            >
              Select a Site or Asset Point
            </p>
          </div>

          <button
            type="button"
            :disabled="!startTarget"
            class="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            :class="
              cableDrawingStep === 'selecting-end'
                ? 'border border-blue-200 bg-blue-50 text-blue-700'
                : 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
            "
            @click="startSelectingEnd"
          >
            {{
              cableDrawingStep === 'selecting-end'
                ? 'Click on map...'
                : endTarget
                  ? 'Change'
                  : 'Select'
            }}
          </button>
        </div>

        <!-- Segment Installation Overrides -->
        <div
          v-if="middleTargets.length > 0 && startTarget && endTarget"
          class="rounded-lg border border-slate-200 bg-slate-50/50 p-3"
        >
          <div class="mb-3">
            <p class="text-xs font-semibold text-slate-700">
              Segment Installation Methods
            </p>

            <p class="mt-1 text-[11px] leading-4 text-slate-500">
              Each segment uses the cable's default installation method unless
              you select a different method below.
            </p>
          </div>

          <div class="space-y-3">
            <div
              v-for="(segment, index) in installationSegments"
              :key="`${segment.fromTarget.id}-${segment.toTarget.id}-${index}`"
              class="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div class="mb-2 flex items-start gap-2">
                <span
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700"
                >
                  {{ index + 1 }}
                </span>

                <div class="min-w-0">
                  <p class="text-[11px] font-medium text-slate-500">
                    Segment {{ index + 1 }}
                  </p>

                  <p class="mt-0.5 truncate text-xs font-medium text-slate-700">
                    {{ getTargetName(segment.fromTarget) }}
                    <span class="mx-1 text-slate-400">→</span>
                    {{ getTargetName(segment.toTarget) }}
                  </p>
                </div>
              </div>

              <select
                :value="segment.installationMethodId ?? ''"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                @change="
                  updateSegmentInstallationMethod(
                    index,
                    ($event.target as HTMLSelectElement).value || null,
                  )
                "
              >
                <option value="">
                  Use default installation method
                </option>

                <option
                  v-for="method in installationMethods"
                  :key="method.value"
                  :value="method.value"
                >
                  {{ method.label }}
                </option>
              </select>

              <p class="mt-1.5 text-[10px] text-slate-400">
                {{
                  segment.installationMethodId
                    ? 'This segment uses its own installation method.'
                    : 'This segment uses the cable default.'
                }}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
} from 'vue'
import { storeToRefs } from 'pinia'

import { useMapStore } from '@/stores/map.store'
import { useMapFilters } from '@/composables/useMapFilters'
import FormLabel from '@/components/common/FormLabel.vue'
import type { InstallationSegment } from '@/types/cable'

const mapStore = useMapStore()

const {
  draftCable,
  cableDrawingStep,
  editingCable,
  middleTargetReplacementIndex,
  subPointReplacementIndex,
} = storeToRefs(mapStore)

const {
  provinces,
  sites,
  cableTypes,
  coreCounts,
  installationMethods,
  statuses,
  segmentTypes,
  loadingSites,
  loadFilterOptions,
  loadSitesByProvince,
} = useMapFilters()

const selectedProvinceId = ref('')

const handleProvinceChange = async (
  provinceId: string,
) => {
  selectedProvinceId.value = provinceId

  draftCable.value.siteId = ''

  if (!provinceId) {
    await loadFilterOptions()
    return
  }
  await loadSitesByProvince(provinceId)
}

onMounted(() => {
  loadFilterOptions()
})

const getTargetName = (
  target: InstallationSegment['fromTarget'],
) => {
  if (
    startTarget.value &&
    startTarget.value.id === target.id &&
    startTarget.value.type === target.type
  ) {
    return startTarget.value.name
  }

  const middleTarget = middleTargets.value.find(
    item =>
      item.id === target.id &&
      item.type === target.type,
  )

  if (middleTarget) {
    return middleTarget.name
  }

  if (
    endTarget.value &&
    endTarget.value.id === target.id &&
    endTarget.value.type === target.type
  ) {
    return endTarget.value.name
  }

  return target.id
}

const startTarget = computed(
  () => draftCable.value.startTarget,
)

const middleTargets = computed(
  () => draftCable.value.middleTargets,
)

const subPoints = computed(
  () => draftCable.value.subPoints,
)

const endTarget = computed(
  () => draftCable.value.endTarget,
)

const installationSegments = computed(
  () => draftCable.value.installationSegments,
)

const updateSegmentInstallationMethod = (
  index: number,
  installationMethodId: string | null,
) => {
  mapStore.setCableSegmentInstallationMethod(
    index,
    installationMethodId,
  )
}

const startSelectingStart = () => {
  mapStore.startSelectingCableStart()
}

const addSubPointMode = () => {
  mapStore.startAddingCableSubPoint()
}

const startSelectingEnd = () => {
  mapStore.startSelectingCableEnd()
}

const removeMiddleTarget = (
  index: number,
) => {
  mapStore.removeCableMiddleTarget(index)
}

const removeSubPoint = (
    index: number,
) => {
  mapStore.removeCableSubPoint(index)
}

const replaceMiddleTarget = (
  index: number,
) => {
  mapStore.startReplacingCableMiddleTarget(index)
}

const replaceSubPoint = (
  index: number,
) => {
  mapStore.startReplacingCableSubPoint(index)
}
</script>
