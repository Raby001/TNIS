<template>
  <svg
    class="pointer-events-none absolute inset-0 z-10 h-full w-full"
    :viewBox="`0 0 ${size.width} ${size.height}`"
    preserveAspectRatio="none"
  >
    <!-- Normal cable lines -->
    <path
      v-for="path in normalPaths"
      :key="path.id"
      :d="path.d"
      fill="none"
      :stroke="path.color"
      :stroke-dasharray="path.dashArray"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Normal cable installation markers -->
    <g
      v-for="marker in normalMarkers"
      :key="marker.id"
    >
      <!-- Underground triangle -->
      <polygon
        v-if="marker.type === 'triangle'"
        :points="getTrianglePoints(marker)"
        :fill="marker.color"
        stroke="white"
        stroke-width="1"
      />

      <!-- In-pipe square -->
      <rect
        v-else-if="marker.type === 'square'"
        x="-4"
        y="-4"
        width="8"
        height="8"
        rx="1"
        :fill="marker.color"
        stroke="white"
        stroke-width="1"
        :transform="`
          translate(${marker.x} ${marker.y})
          rotate(${marker.angle})
        `"
      />
    </g>

    <!-- Selected cable -->
    <path
      v-if="selectedPath"
      :key="`${selectedPath.id}-${animationKey}`"
      :d="selectedPath.d"
      fill="none"
      :stroke="selectedPath.color"
      :stroke-dasharray="
        selectedPath.markerType === 'none'
          ? '10 10'
          : undefined
      "
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      :class="{
        'cable-selected':
          selectedPath.markerType === 'none',
      }"
    />

    <!-- Selected underground cable markers -->
    <g
      v-if="
        selectedPath &&
        selectedPath.markerType === 'triangle'
      "
    >
      <polygon
        v-for="index in ANIMATED_MARKER_COUNT"
        :key="`triangle-${selectedPath.id}-${index}`"
        points="0,-6 -5,5 5,5"
        :fill="selectedPath.color"
        stroke="white"
        stroke-width="1"
      >
        <animateMotion
          :path="selectedPath.d"
          :dur="`${ANIMATED_MARKER_DURATION}s`"
          :begin="`-${(
            (index - 1) *
            ANIMATED_MARKER_DURATION /
            ANIMATED_MARKER_COUNT
          ).toFixed(2)}s`"
          repeatCount="indefinite"
          rotate="auto"
        />
      </polygon>
    </g>

    <!-- Selected in-pipe cable markers -->
    <g
      v-if="
        selectedPath &&
        selectedPath.markerType === 'square'
      "
    >
      <rect
        v-for="index in ANIMATED_MARKER_COUNT"
        :key="`square-${selectedPath.id}-${index}`"
        x="-4"
        y="-4"
        width="8"
        height="8"
        rx="1"
        :fill="selectedPath.color"
        stroke="white"
        stroke-width="1"
      >
        <animateMotion
          :path="selectedPath.d"
          :dur="`${ANIMATED_MARKER_DURATION}s`"
          :begin="`-${(
            (index - 1) *
            ANIMATED_MARKER_DURATION /
            ANIMATED_MARKER_COUNT
          ).toFixed(2)}s`"
          repeatCount="indefinite"
          rotate="auto"
        />
      </rect>
    </g>

    <!-- Draft cable -->
    <path
      v-if="draftPath"
      :d="draftPath.d"
      fill="none"
      :stroke="draftPath.color"
      :stroke-dasharray="draftPath.dashArray"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Draft sub-points -->
    <circle
      v-for="point in subPointMarkers"
      :key="point.id"
      :cx="point.x"
      :cy="point.y"
      r="3"
      fill="#64748b"
      class="pointer-events-none"
    />
  </svg>
</template>

<script setup lang="ts">
import {
  computed,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue'

import type { Map as MapLibreMap } from 'maplibre-gl'

import type {
  Cable,
  CablePoint,
} from '@/types/cable'

import type {
  CableMarker,
  CablePath,
  ProjectedPoint,
} from '@/types/cable-overlay'

import {
  ANIMATED_MARKER_COUNT,
  ANIMATED_MARKER_DURATION,
  createCableMarkers,
  distanceToSegment,
  getTrianglePoints,
} from '@/utils/cable-overlay'

import {
  getCableInstallationMarker,
  getCableLineDash,
} from '@/utils/cable-style'

const props = defineProps<{
  map: MapLibreMap | null
  cables: Cable[]
  draftRoute: [number, number][]
  draftSubPoints: CablePoint[]
  selectedCableId: string | null
}>()

const paths = ref<CablePath[]>([])
const subPointMarkers = ref<ProjectedPoint[]>([])
const animationKey = ref(0)
const cableMarkers = ref<CableMarker[]>([])

let animationFrameId: number | null = null

const selectedPath = computed(() => {
  if (!props.selectedCableId) {
    return null
  }

  return (
    paths.value.find(
      (path) =>
        path.cableId === props.selectedCableId,
    ) ?? null
  )
})

const normalPaths = computed(() => {
  return paths.value.filter(
    (path) =>
      path.cableId !== props.selectedCableId &&
      path.cableId !== '__draft-cable__',
  )
})

const normalMarkers = computed(() => {
  return cableMarkers.value.filter(
    (marker) =>
      marker.cableId !== props.selectedCableId,
  )
})

const draftPath = computed(() => {
  return (
    paths.value.find(
      (path) =>
        path.cableId === '__draft-cable__',
    ) ?? null
  )
})

const size = reactive({
  width: 0,
  height: 0,
})

const createProjectedPath = (
  map: MapLibreMap,
  cableId: string,
  coordinates: [number, number][],
  id: string,
  color: string,
  lineStyle: string,
  isSegment: boolean,
): CablePath | null => {
  if (coordinates.length < 2) {
    return null
  }

  const projected: ProjectedPoint[] =
    coordinates.map(
      ([longitude, latitude], index) => {
        const point = map.project([
          longitude,
          latitude,
        ])

        return {
          id: `${id}-point-${index}`,
          x: point.x,
          y: point.y,
        }
      },
    )

  const d = projected
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`,
    )
    .join(' ')

  return {
    id,
    cableId,
    d,
    color,
    dashArray: getCableLineDash(lineStyle),
    markerType: getCableInstallationMarker(
      lineStyle,
    ),
    projectedPoints: projected,
    lineStyle,
    isSegment,
  }
}

const updatePaths = () => {
  const map = props.map

  if (!map) {
    paths.value = []
    cableMarkers.value = []
    subPointMarkers.value = []
    return
  }

  const canvas = map.getCanvas()

  size.width = canvas.clientWidth
  size.height = canvas.clientHeight

  const savedPaths: CablePath[] = []

  for (const cable of props.cables) {
    const color = cable.color || '#2563eb'

    // 1. Draw the full cable route first.
    if (cable.route.length >= 2) {
      const routePath = createProjectedPath(
        map,
        cable.id,
        cable.route,
        `${cable.id}-route`,
        color,
        cable.lineStyle || '',
        false,
      )

      if (routePath) {
        savedPaths.push(routePath)
      }
    }

    // 2. Draw installation segments on top of the full route.
    for (const segment of cable.installationSegments) {
      if (
        !segment.geometry ||
        segment.geometry.coordinates.length < 2
      ) {
        continue
      }

      const segmentPath = createProjectedPath(
        map,
        cable.id,
        segment.geometry.coordinates,
        `${cable.id}-segment-${segment.id}`,
        color,
        segment.installationMethod.lineStyle,
        true,
      )

      if (segmentPath) {
        savedPaths.push(segmentPath)
      }
    }

    // 3. Fallback if there is no route.
    if (
      cable.route.length < 2 &&
      cable.startTarget !== null &&
      cable.endTarget !== null
    ) {
      const coordinates: [number, number][] = [
        [
          cable.startTarget.longitude,
          cable.startTarget.latitude,
        ],
        [
          cable.endTarget.longitude,
          cable.endTarget.latitude,
        ],
      ]

      const fallbackPath = createProjectedPath(
        map,
        cable.id,
        coordinates,
        `${cable.id}-fallback`,
        color,
        cable.lineStyle || '',
        false,
      )

      if (fallbackPath) {
        savedPaths.push(fallbackPath)
      }
    }
  }

  const savedMarkers = savedPaths.flatMap(
      (path) =>
          createCableMarkers(
              path.cableId,
              path.id,
              path.color,
              path.markerType,
              path.projectedPoints,
          ),
  )

const draftPath =
  props.draftRoute.length >= 2
    ? (() => {
        const projected: ProjectedPoint[] =
          props.draftRoute.map(
            ([longitude, latitude], index) => {
              const point = map.project([
                longitude,
                latitude,
              ])

              return {
                id: `draft-point-${index}`,
                x: point.x,
                y: point.y,
              }
            },
          )

        const d = projected
          .map(
            (point, index) =>
              `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`,
          )
          .join(' ')

        return {
          id: '__draft-cable__',
          cableId: '__draft-cable__',
          d,
          color: '#51545c',
          dashArray: undefined,
          markerType: 'none' as const,
          projectedPoints: projected,

          lineStyle: '',
          isSegment: false,
        }
      })()
    : null

  paths.value = draftPath
    ? [
        ...savedPaths,
        draftPath,
      ]
    : savedPaths

  cableMarkers.value = savedMarkers

  subPointMarkers.value =
    props.draftSubPoints.map(
      (point, index) => {
        const projected =
          map.project([
            point.longitude,
            point.latitude,
          ])

        return {
          id: `sub-point-${index}`,
          x: projected.x,
          y: projected.y,
        }
      },
    )
}

const findCableAtPoint = (
    x: number,
    y: number,
): string | null => {
    const tolerance = 8

    let closestCableId: string | null = null
    let closestDistance = Infinity

    for (const path of paths.value) {
        if (path.cableId === '__draft-cable__') {
            continue
        }

        const commands = path.d.match(/[ML][^ML]+/g)

        if (!commands) {
            continue
        }

        let previousPoint: {
            x: number
            y: number
        } | null = null

        for (const command of commands) {
            const values = command
                .slice(1)
                .trim()
                .split(/\s+/)
                .map(Number)

            if (
                values.length < 2 ||
                values.some(Number.isNaN)
            ) {
                continue
            }

            const xValue = values[0]
            const yValue = values[1]

            if (xValue === undefined || yValue === undefined) {
                continue
            }

            const currentPoint = {
                x: xValue,
                y: yValue,
            }

            if (previousPoint) {
                const distance = distanceToSegment(
                    x,
                    y,
                    previousPoint.x,
                    previousPoint.y,
                    currentPoint.x,
                    currentPoint.y,
                )

                if (
                    distance <= tolerance &&
                    distance < closestDistance
                ) {
                    closestDistance = distance
                    closestCableId = path.cableId
                }
            }

            previousPoint = currentPoint
        }
    }

    return closestCableId
}

defineExpose({
    findCableAtPoint,
})

const handleMapChange = () => {
  if (animationFrameId !== null) {
    return
  }

  animationFrameId = requestAnimationFrame(() => {
    animationFrameId = null
    updatePaths()
  })
}

const bindMapEvents = (
  map: MapLibreMap,
) => {
  map.on(
    'move',
    handleMapChange,
  )

  map.on(
    'resize',
    handleMapChange,
  )

  map.on(
    'rotate',
    handleMapChange,
  )

  map.on(
    'pitch',
    handleMapChange,
  )
}

const unbindMapEvents = (
  map: MapLibreMap,
) => {
  map.off(
    'move',
    handleMapChange,
  )

  map.off(
    'resize',
    handleMapChange,
  )

  map.off(
    'rotate',
    handleMapChange,
  )

  map.off(
    'pitch',
    handleMapChange,
  )
}

watch(
  () => props.map,
  (map, previousMap) => {
    if (previousMap) {
      unbindMapEvents(previousMap)
    }

    if (!map) {
      paths.value = []
      return
    }

    bindMapEvents(map)
    updatePaths()
  },
  {
    immediate: true,
  },
)

watch(
  () => props.cables,
  () => {
    updatePaths()
  },
  {
    deep: true,
  },
)

watch(
  () => props.draftRoute,
  () => {
    updatePaths()
  },
  {
    deep: true,
  },
)

watch(
  () => props.draftSubPoints,
  () => {
    updatePaths()
  },
  {
    deep: true,
  },
)

watch(
  () => props.selectedCableId,
  () => {
    animationKey.value++

    updatePaths()
  },
)

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  if (props.map) {
    unbindMapEvents(props.map)
  }
})
</script>
