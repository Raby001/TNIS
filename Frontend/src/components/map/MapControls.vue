<template>
  <div
    class="absolute right-3 top-3 z-30 flex flex-col items-end gap-3"
  >
    <!-- Navigation controls -->
    <div
      class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-900/10 backdrop-blur"
    >
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        title="Zoom in"
        @click="mapStore.zoomIn()"
      >
        <Plus :size="17" />
      </button>

      <div class="mx-2 h-px bg-slate-200/80" />

      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        title="Zoom out"
        @click="mapStore.zoomOut()"
      >
        <Minus :size="17" />
      </button>

      <div class="mx-2 h-px bg-slate-200/80" />

      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        title="Locate me"
        @click="mapStore.locateUser()"
      >
        <LocateFixed :size="17" />
      </button>
    </div>

    <!-- Map layer switcher -->
    <div class="relative">
      <!-- Main button -->
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/95 text-slate-600 shadow-lg shadow-slate-900/10 backdrop-blur transition hover:bg-slate-100 hover:text-slate-900"
        title="Change map layer"
        @click="layerMenuOpen = !layerMenuOpen"
      >
        <Satellite
          v-if="baseMap === 'satellite'"
          :size="18"
        />

        <Map
          v-else
          :size="18"
        />
      </button>

      <!-- Layer menu -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-95 opacity-0"
      >
        <div
          v-if="layerMenuOpen"
          class="absolute right-0 top-12 w-36 overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur"
        >
          <!-- Map -->
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition"
            :class="
              baseMap === 'osm'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            "
            @click="setBaseMap('osm')"
          >
            <Map :size="15" />
            <span>Map</span>
          </button>

          <!-- Satellite -->
          <button
            type="button"
            class="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition"
            :class="
              baseMap === 'satellite'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            "
            @click="setBaseMap('satellite')"
          >
            <Satellite :size="15" />
            <span>Satellite</span>
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  LocateFixed,
  Map,
  Minus,
  Plus,
  Satellite,
} from 'lucide-vue-next'

import { ref } from 'vue'

import { useMapStore } from '@/stores/map.store'
import { mapService } from '@/services'

const mapStore = useMapStore()

const baseMap =
  ref<'osm' | 'satellite'>('osm')

const layerMenuOpen = ref(false)

const setBaseMap = (
  type: 'osm' | 'satellite',
) => {
  baseMap.value = type

  mapService.setBaseMap(type)

  layerMenuOpen.value = false
}
</script>