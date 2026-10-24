<template>
  <header
    class="relative z-[1000] flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-3 shadow-sm shadow-slate-900/5 backdrop-blur md:h-16 md:px-4"
  >
    <!-- Navbar row -->
    <div
      class="grid h-12 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-2.5 sm:h-14 sm:gap-3 sm:px-3 md:h-16 md:px-4 xl:gap-4"
    >
      <!-- Left section -->
      <div
        class="flex min-w-0 items-center gap-1.5 sm:gap-2 md:gap-3"
      >
        <button
          type="button"
          aria-label="Toggle navigation sidebar"
          class="shrink-0 rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:p-2 xl:hidden"
          @click="mapStore.toggleSidebar()"
        >
          <Menu :size="19" />
        </button>

        <!-- Page title -->
        <div class="min-w-0">
          <h1
            class="max-w-[58px] truncate text-sm font-semibold text-slate-900 sm:max-w-[120px] sm:text-base md:max-w-[140px] md:text-lg lg:max-w-[180px] xl:max-w-none"
          >
            {{ pageTitle }}
          </h1>

          <p class="hidden truncate text-xs text-slate-500 xl:block">
            {{ pageDescription }}
          </p>
        </div>
      </div>

      <!-- Center search -->
      <div
        v-if="pageShowsSearch"
        class="flex min-w-0 justify-center px-0.5 sm:px-1"
      >
        <SearchBox
          class="w-full max-w-[155px] sm:max-w-[190px] md:max-w-[230px] lg:max-w-[280px] xl:max-w-[360px]"
          @coordinate-search="handleCoordinateSearch"
        />
      </div>

      <!-- Right section -->
      <div
        class="flex shrink-0 items-center justify-end gap-1 sm:gap-2 md:gap-3"
      >

        <UserMenu />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu } from 'lucide-vue-next'
import { useMapStore } from '@/stores/map.store'

import SearchBox from '@/components/layout/navbar/SearchBox.vue'
import UserMenu from '@/components/layout/navbar/UserMenu.vue'

import { useNavigation } from '@/composables/useNavigations'

const emit = defineEmits<{
  'coordinate-search': [
    payload: {
      latitude: number
      longitude: number
    },
  ]
}>()

const {
  pageTitle,
  pageDescription,
  pageShowsSearch,
} = useNavigation()

const mapStore = useMapStore()

const handleCoordinateSearch = (payload: {
  latitude: number
  longitude: number
}) => {
  console.log(
    '[AppNavbar] Coordinate search received:',
    payload,
  )

  emit('coordinate-search', payload)
}
</script>
