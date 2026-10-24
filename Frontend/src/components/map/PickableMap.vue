<template>
  <div
    ref="viewport"
    class="relative h-full w-full"
  >
    <div
      ref="mapContainer"
      class="absolute inset-0 h-full w-full"
    />

    <svg
      v-if="cablePaths.length > 0 || draftPoints.length > 0"
      class="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
      :viewBox="`0 0 ${viewportSize.width} ${viewportSize.height}`"
      preserveAspectRatio="none"
    >

      <g v-if="draftPathD || draftMarkerScreenPoints.length">
        <path
          v-if="draftPathD"
          :d="draftPathD"
          :fill="geometryType === 'Polygon' ? 'rgba(59,130,246,0.2)' : 'none'"
          stroke="#3b82f6"
          stroke-width="2"
          stroke-dasharray="4 4"
        />
        <circle
          v-for="(pt, i) in draftMarkerScreenPoints"
          :key="i"
          :cx="pt.x"
          :cy="pt.y"
          r="5"
          fill="#3b82f6"
          stroke="white"
          stroke-width="2"
        />
      </g>

      <g
        v-for="cable in cablePaths"
        :key="cable.id"
      >
        <path
          :d="cable.d"
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          stroke-linecap="round"
          stroke-linejoin="round"
          :stroke-dasharray="cable.dashArray"
          :stroke-width="cable.casingWidth"
        />
        <path
          :d="cable.d"
          fill="none"
          :stroke="cable.color"
          stroke-linecap="round"
          stroke-linejoin="round"
          :stroke-dasharray="cable.dashArray"
          :stroke-width="cable.lineWidth"
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'

import { useMapStore } from '@/stores/map.store'
import { useMap } from '@/composables/useMap'
import type { Cable, CableCoreCount } from '@/types/cable'
import { getCableColor, getCableLineDash } from '@/utils/cable-style'

type OverlayCable = {
  id: string
  d: string
  color: string
  dashArray: string | undefined
  lineWidth: number
  casingWidth: number
}

type GeometryType = 'Point' | 'LineString' | 'Polygon'

const props = defineProps<{
  pickable?: boolean
  geometryType?: GeometryType
}>()

const emit = defineEmits<{
  geometryPicked: [{ type: GeometryType; coordinates: any }]
}>()

const draftPoints = ref<[number, number][]>([])

const viewport = ref<HTMLDivElement | null>(null)
const { mapContainer } = useMap()
const mapStore = useMapStore()
const { map, cables } = storeToRefs(mapStore)

const viewportSize = reactive({
  width: 0,
  height: 0,
})

const cablePaths = ref<OverlayCable[]>([])
let resizeObserver: ResizeObserver | null = null
let boundMap: MapLibreMap | null = null

const handleResize = () => {
  syncViewportSize()
  updateOverlay()
}

const pathForCable = (cable: Cable) => {
  const mapInstance = map.value

  if (!mapInstance || viewportSize.width === 0 || viewportSize.height === 0) {
    return null
  }

  const route: [number, number][] = cable.route.length >= 2
    ? cable.route
    : cable.startTarget && cable.endTarget
      ? [
          [
            cable.startTarget.longitude,
            cable.startTarget.latitude,
          ],
          [
            cable.endTarget.longitude,
            cable.endTarget.latitude,
          ],
        ]
      : []

  const projected = route
    .map(([longitude, latitude]) => mapInstance.project([longitude, latitude]))

  if (projected.length < 2) return null

  const d = projected
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')

  const coreCount = (cable as Partial<{ coreCountId: Parameters<typeof getCableColor>[0] }>).coreCountId ?? '2C'
  const lineType = (cable as Partial<{ lineType: Parameters<typeof getCableLineDash>[0] }>).lineType ?? 'underground'

  return {
    id: cable.id,
    d,
    color: getCableColor(cable.coreCountId as CableCoreCount),
    dashArray: getCableLineDash(
      cable.installationMethodId.toLowerCase().includes('underground')
        ? 'underground'
        : 'overhead',
    ),
    lineWidth: 2,
    casingWidth: 3,
  }
}

const draftMarkerScreenPoints = ref<{ x: number; y: number }[]>([])
const draftPathD = ref<string | null>(null)

function updateDraftShape() {
  const mapInstance = map.value
  if (!mapInstance || draftPoints.value.length === 0) {
    draftMarkerScreenPoints.value = []
    draftPathD.value = null
    return
  }

  draftMarkerScreenPoints.value = draftPoints.value.map(([lng, lat]) => {
    const p = mapInstance.project([lng, lat])
    return { x: p.x, y: p.y }
  })

  const type = props.geometryType ?? 'Point'
  const hasEnoughPoints =
    (type === 'LineString' && draftPoints.value.length >= 2) ||
    (type === 'Polygon' && draftPoints.value.length >= 3)

  if (!hasEnoughPoints) {
    draftPathD.value = null
    return
  }

  const closed = type === 'Polygon'
    ? [...draftMarkerScreenPoints.value, draftMarkerScreenPoints.value[0]!]
    : draftMarkerScreenPoints.value

  draftPathD.value = closed.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`).join(' ')
}

const updateOverlay = () => {
  cablePaths.value = cables.value
    .map((cable: Cable) => pathForCable(cable))
    .filter(
      (path: OverlayCable | null): path is OverlayCable =>
        path !== null,
    )
}

const syncViewportSize = () => {
  const element = viewport.value
  if (!element) return

  viewportSize.width = element.clientWidth
  viewportSize.height = element.clientHeight
}

function handleMapClick(e: MapMouseEvent) {
  if (!props.pickable) return
  const { lng, lat } = e.lngLat

  if (props.geometryType === 'Point') {
    draftPoints.value = [[lng, lat]] // Point mode: each click replaces the previous one
  } else {
    draftPoints.value = [...draftPoints.value, [lng, lat]] // Line/Polygon: accumulate
  }

  updateDraftShape()
  emitGeometry()
}

function emitGeometry() {
  const type = props.geometryType ?? 'Point'
  if (type === 'Point' && draftPoints.value.length === 1) {
    emit('geometryPicked', { type: 'Point', coordinates: draftPoints.value[0] })
  } else if (type === 'LineString' && draftPoints.value.length >= 2) {
    emit('geometryPicked', { type: 'LineString', coordinates: draftPoints.value })
  } else if (type === 'Polygon' && draftPoints.value.length >= 3) {
    const ring = [...draftPoints.value, draftPoints.value[0]]
    emit('geometryPicked', { type: 'Polygon', coordinates: [ring] })
  }
}

function undoLastPoint() {
  draftPoints.value = draftPoints.value.slice(0, -1)
  updateDraftShape()
  emitGeometry()
}

function clearDraft() {
  draftPoints.value = []
  updateDraftShape()
}

function flyToLocation(center: [number, number], zoom: number) {
  map.value?.flyTo({ center, zoom })
}

defineExpose({ undoLastPoint, clearDraft, flyToLocation})

const bindMap = (instance: MapLibreMap | null) => {
  if (boundMap) {
    boundMap.off('move', updateOverlay)
    boundMap.off('zoom', updateOverlay)
    boundMap.off('rotate', updateOverlay)
    boundMap.off('pitch', updateOverlay)
    boundMap.off('resize', handleResize)
    boundMap.off('load', updateOverlay)
    boundMap = null
  }

  if (!instance) {
    cablePaths.value = []
    return
  }

  instance.on('move', updateOverlay)
  instance.on('zoom', updateOverlay)
  instance.on('rotate', updateOverlay)
  instance.on('pitch', updateOverlay)
  instance.on('resize', handleResize)
  instance.on('load', updateOverlay)
  instance.on('click', handleMapClick)
  boundMap = instance

  updateOverlay()
  updateDraftShape()
}

watch(
  map,
  (instance: MapLibreMap | null) => {
    bindMap(instance)
    syncViewportSize()
    updateOverlay()
  },
  { immediate: true },
)

watch(
  cables,
  () => {
    updateOverlay()
  },
  { deep: true },
)

onMounted(() => {
  syncViewportSize()

  resizeObserver = new ResizeObserver(() => {
    syncViewportSize()
    updateOverlay()
  })

  if (viewport.value) {
    resizeObserver.observe(viewport.value)
  }
})

onUnmounted(() => {
  if (boundMap) {
    boundMap.off('move', updateOverlay)
    boundMap.off('zoom', updateOverlay)
    boundMap.off('rotate', updateOverlay)
    boundMap.off('pitch', updateOverlay)
    boundMap.off('resize', handleResize)
    boundMap.off('load', updateOverlay)
  }

  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>
