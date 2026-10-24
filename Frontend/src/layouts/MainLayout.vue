<template>
  <div class="flex h-screen overflow-hidden bg-slate-100">
    <!-- Mobile sidebar backdrop -->
    <Transition name="fade">
      <button
        v-if="sidebarOpen"
        type="button"
        aria-label="Close navigation sidebar"
        class="fixed inset-x-0 bottom-0 top-14 z-30 bg-slate-950/35 backdrop-blur-[1px] md:top-16 xl:hidden"
        @click="mapStore.setSidebarOpen(false)"
      />
    </Transition>

    <!-- Sidebar -->
    <AppSidebar/>

    <!-- Main application area -->
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <!-- Navbar -->
      <AppNavbar 
        @coordinate-search="handleCoordinateSearch"
      />

      <!-- Page content -->
      <main class="relative min-h-0 min-w-0 flex-1 overflow-hidden">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'

import AppNavbar from '@/components/layout/navbar/AppNavbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useMapStore } from '@/stores/map.store'

const mapStore = useMapStore()
const { sidebarOpen } = storeToRefs(mapStore)

let mediaQuery: MediaQueryList | null = null

const syncSidebarToViewport = () => {
  if (!mediaQuery) return

  mapStore.setSidebarOpen(mediaQuery.matches)
}

const handleCoordinateSearch = (payload: {
    latitude: number
    longitude: number
}) => {
    console.log(
        '[MainLayout] Coordinate search received:',
        payload,
    )

    mapStore.setCoordinateSearch(payload)
}

onMounted(() => {
  mediaQuery = window.matchMedia('(min-width: 1280px)')

  syncSidebarToViewport()

  mediaQuery.addEventListener('change', syncSidebarToViewport)
})

onUnmounted(() => {
  mediaQuery?.removeEventListener('change', syncSidebarToViewport)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 180ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
