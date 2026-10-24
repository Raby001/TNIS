<template>
  <div ref="mapContainer" class="h-full w-full" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const props = withDefaults(
  defineProps<{
    center?: [number, number]
    zoom?: number
  }>(),
  {
    center: () => [104.9, 11.9], 
    zoom: 5.7, 
  }
)

const mapContainer = ref<HTMLDivElement | null>(null)
let map: maplibregl.Map | null = null

onMounted(() => {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: `https://api.maptiler.com/maps/satellite/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
    center: props.center,
    zoom: props.zoom,
    interactive: false, 
    attributionControl: false,
  })
})

onBeforeUnmount(() => {
  map?.remove()
})
</script>