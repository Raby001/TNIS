<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-3 py-4 sm:px-4 sm:py-6"
    @click.self="cancel"
  >
    <div
      class="flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90vh]"
    >
      <!-- Header -->
      <div
        class="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3.5 sm:px-5 sm:py-4"
      >
        <div class="min-w-0 pr-3">
          <h2
            class="text-base font-semibold text-slate-900 sm:text-lg"
          >
            {{
              mapStore.fieldObservationToConvert
                ? 'Convert to Asset Point'
                : 'Create Asset Point'
            }}
          </h2>

          <p
            class="mt-0.5 text-xs leading-relaxed text-slate-500 sm:text-sm"
          >
            {{
              mapStore.fieldObservationToConvert
                ? 'Select the asset type to convert this observation into'
                : 'Select the type of asset you want to create'
            }}
          </p>
        </div>

        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200"
          aria-label="Close"
          @click="cancel"
        >
          <X :size="18" />
        </button>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex min-h-40 items-center justify-center p-5"
      >
        <div class="text-center">
          <div
            class="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
          />

          <p class="mt-3 text-sm text-slate-500">
            Loading asset types...
          </p>
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="p-5"
      >
        <div
          class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {{ error }}
        </div>

        <button
          type="button"
          class="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          @click="loadAssetTypes"
        >
          Retry
        </button>
      </div>

      <!-- Empty -->
      <div
        v-else-if="selectableAssetTypes.length === 0"
        class="flex min-h-40 items-center justify-center p-5"
      >
        <p class="text-sm text-slate-500">
          No asset types are available.
        </p>
      </div>

      <!-- Asset types -->
      <div
        v-else
        class="grid min-h-0 grid-cols-1 gap-2.5 overflow-y-auto p-4 sm:grid-cols-2 sm:p-5"
      >
        <button
          v-for="item in selectableAssetTypes"
          :key="item.id"
          type="button"
          class="group flex min-h-[4.5rem] w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:translate-y-0 active:bg-slate-100 sm:min-h-[5rem] sm:p-3.5"
          @click="selectType(item)"
        >
          <!-- Icon -->
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100 group-hover:text-blue-700 sm:h-11 sm:w-11"
          >
            <component
              :is="getIcon(item)"
              :size="19"
              class="sm:h-5 sm:w-5"
            />
          </span>

          <!-- Label -->
          <span class="min-w-0">
            <span
              class="block truncate text-sm font-semibold text-slate-800 sm:text-[15px]"
            >
              {{ item.name }}
            </span>

            <span
              class="mt-0.5 block text-[11px] text-slate-400 sm:text-xs"
            >
              Point asset
            </span>
          </span>
        </button>
      </div>

      <!-- Footer -->
      <div
        class="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-5"
      >
        <p
          class="text-center text-[11px] leading-relaxed text-slate-500 sm:text-xs"
        >
          {{
            mapStore.fieldObservationToConvert
              ? 'The asset will use the field observation location.'
              : 'After selecting an asset type, click a location on the map.'
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  MapPin,
  Share2,
  CircleDot,
  Network,
  RadioTower,
  Square,
  UtilityPole,
  HouseWifi,
  X,
  ServerCog,
  Split,
} from 'lucide-vue-next'

import {
  ref,
  watch,
  computed,
  type Component,
} from 'vue'

import {
  referenceDataApi,
} from '@/services/api/reference-data.api'
import type { AssetType } from '@/types/reference-data'
import { useMapStore } from '@/stores/map.store'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const mapStore = useMapStore()

const emit = defineEmits<{
  (e: 'select', assetType: AssetType): void
  (e: 'cancel'): void
  (e: 'conversion-select', assetType: AssetType): void
}>()

const assetTypes = ref<AssetType[]>([])
const loading = ref(false)
const error = ref('')

const excludedAssetTypes = new Set([
  'battery bank',
  'device',
  'duct',
  'fiber cable',
  'generator',
  'odf',
  'patch panel',
  'power system',
  'rack',
  'router',
  'network device',
  'optical splitter'
])

const iconMap: Record<string, Component> = {
  tower: RadioTower,
  closure: Share2,
  manhole: CircleDot,
  handhole: Square,
  nap: Network,
  pole: UtilityPole,
  onu: HouseWifi,
  occ: ServerCog,
  lcp: Split
}

const getIcon = (assetType: AssetType): Component => {
  const key = assetType.name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')

  return iconMap[key] ?? MapPin
}

const loadAssetTypes = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await referenceDataApi.getAssetTypes()

    assetTypes.value = response.data
  } catch (err) {
    console.error(
      'Failed to load asset types:',
      err,
    )

    error.value =
      'Failed to load asset types. Please try again.'
  } finally {
    loading.value = false
  }
}

const selectableAssetTypes = computed(() => {
  return assetTypes.value.filter((assetType) => {
    const name = assetType.name
      .trim()
      .toLowerCase()

    return !excludedAssetTypes.has(name)
  })
})

const selectType = (assetType: AssetType) => {
  const observation = mapStore.fieldObservationToConvert

  if (observation) {
    mapStore.openAssetPointForm(
      assetType,
      observation.longitude,
      observation.latitude,
    )

    emit('conversion-select', assetType)

    return
  }

  emit('select', assetType)
}

const cancel = () => {
  emit('cancel')
}

watch(
  () => props.open,
  (open) => {
    if (open && assetTypes.value.length === 0) {
      loadAssetTypes()
    }
  },
)
</script>