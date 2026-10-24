<template>
    <div
        class="relative w-full min-w-0 max-w-[36rem] xl:min-w-[20rem]"
    >
        <AppInput
            v-model="keyword"
            placeholder="Search with keyword..."
            class="text-sm"
            @keyup.enter="handleCoordinateSearch"
        >
            <template #prefix>
                <Search
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    :size="17"
                />
            </template>
        </AppInput>

        <!-- Clear search -->
        <button
            v-if="keyword.trim()"
            type="button"
            class="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear search"
            @click="handleClear"
        >
            <X :size="15" />
        </button>

        <!-- Coordinate search -->
        <div
        v-if="isCoordinateSearch"
        class="absolute left-0 right-0 top-full z-[3000] mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        >
            <button
                type="button"
                class="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-slate-50"
                @click="handleCoordinateSearch"
            >
                <div
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600"
                >
                    <Search :size="16" />
                </div>

                <div class="min-w-0 flex-1">
                    <div class="text-sm font-semibold text-slate-800">
                        Go to coordinate
                    </div>

                    <div class="mt-0.5 truncate text-xs text-slate-500">
                        {{ coordinate?.latitude }}, {{ coordinate?.longitude }}
                    </div>
                </div>
            </button>
        </div>

        <!-- Search results -->
        <div
            v-if="showDropdown && !isCoordinateSearch"
            class="absolute left-0 right-0 top-full z-[3000] mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        >
            <!-- Loading -->
            <div
                v-if="searchLoading"
                class="px-3 py-3 text-xs text-slate-500"
            >
                Searching...
            </div>

            <!-- Results -->
            <div
                v-else-if="searchResults.length > 0"
                class="max-h-80 overflow-y-auto py-1"
            >
                <button
                    v-for="feature in searchResults"
                    :key="getFeatureKey(feature)"
                    type="button"
                    class="flex w-full items-start gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50"
                    @click="handleSelect(feature)"
                >
                    <div class="min-w-0 flex-1">
                        <div
                            class="truncate text-sm font-medium text-slate-800"
                        >
                            {{ getFeatureName(feature) }}
                        </div>

                        <div
                            class="mt-0.5 truncate text-xs text-slate-500"
                        >
                            {{ getFeatureType(feature) }}

                            <span
                                v-if="getFeatureCode(feature)"
                            >
                                · {{ getFeatureCode(feature) }}
                            </span>
                        </div>
                    </div>
                </button>
            </div>

            <!-- No results -->
            <div
                v-else
                class="px-3 py-3 text-xs text-slate-500"
            >
                No matching network items.
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
  computed,
} from 'vue'

import { storeToRefs } from 'pinia'

import {
  Search,
  X,
} from 'lucide-vue-next'

import AppInput from '@/components/common/AppInput.vue'
import { useMapStore } from '@/stores/map.store'

import type { MapFeature } from '@/types/map-feature'
import { parseCoordinate } from '@/utils/coordinates'

const mapStore = useMapStore()

const {
  searchResults,
  searchLoading,
} = storeToRefs(mapStore)

const emit = defineEmits<{
  (e: 'coordinateSearch', payload: {
    latitude: number
    longitude: number
  }): void
}>()

const keyword = computed({
  get: () =>
    mapStore.searchKeyword,

  set: (value: string) => {
    mapStore.setSearchKeyword(value)
  },
})

const coordinate = computed(() => {
  return parseCoordinate(keyword.value)
})

const isCoordinateSearch = computed(() => {
  return coordinate.value !== null
})

const showDropdown = computed(() => {
  return (
    keyword.value.trim().length > 0 &&
    !isCoordinateSearch.value
  )
})

const getFeatureKey = (
  feature: MapFeature,
) => {
  return String(
    feature.properties.assetId ??
    feature.properties.id ??
    `${feature.properties.type}-${feature.properties.name}`,
  )
}

const getFeatureName = (
  feature: MapFeature,
) => {
  return (
    feature.properties.name ||
    'Unnamed'
  )
}

const getFeatureType = (
  feature: MapFeature,
) => {
  const type =
    feature.properties.type

  if (!type) {
    return 'Network Item'
  }

  return String(type)
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (letter: string) =>
      letter.toUpperCase(),
    )
}

const getFeatureCode = (
  feature: MapFeature,
) => {
  const code =
    feature.properties.code

  return code
    ? String(code)
    : ''
}

const handleSelect = (
  feature: MapFeature,
) => {
  mapStore.selectSearchResult(feature)
}

const handleCoordinateSearch = () => {
  if (!coordinate.value) {
    return
  }

  emit('coordinateSearch', coordinate.value)

  mapStore.clearSearch()
}

const handleClear = () => {
  mapStore.clearSearch()
}
</script>
