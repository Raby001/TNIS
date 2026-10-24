<template>
  <div class="flex min-w-0 items-center gap-3">
    <!-- Line -->
    <svg
      v-if="variant === 'line'"
      width="40"
      height="14"
      viewBox="0 0 40 14"
      class="w-10 shrink-0 overflow-visible"
    >
      <!-- Base line -->
      <line
        x1="1"
        y1="7"
        x2="39"
        y2="7"
        :stroke="color"
        :stroke-dasharray="dashArray"
        stroke-width="2"
        stroke-linecap="round"
      />

      <!-- Underground triangle -->
      <polygon
        v-if="props.marker === 'triangle'"
        points="20,1 14,12 26,12"
        :fill="color"
        stroke="white"
        stroke-width="0.8"
      />

      <!-- In-pipe square -->
      <rect
        v-else-if="props.marker === 'square'"
        x="16"
        y="3"
        width="8"
        height="8"
        rx="1"
        :fill="color"
        stroke="white"
        stroke-width="0.8"
      />
    </svg>

    <!-- Color swatch -->
    <div
      v-else-if="variant === 'swatch'"
      class="h-3.5 w-3.5 shrink-0 rounded-sm border border-white shadow-sm"
      :style="{ backgroundColor: color }"
    />

    <!-- Icon -->
    <span
      v-else-if="variant === 'icon'"
      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
      :style="{ backgroundColor: color }"
    >
      <component
        v-if="icon"
        :is="icon"
        :size="14"
        :stroke-width="2.4"
      />
    </span>

    <span
      :class="[
        'text-xs font-medium text-slate-700',
        variant === 'icon'
          ? 'break-words leading-4'
          : 'truncate',
      ]"
    >
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  type Component,
} from 'vue'

interface Props {
  label: string
  color: string

  type?:
    | 'solid'
    | 'dashed'
    | 'dotted'
    | 'dashdot'

  marker?:
    | 'none'
    | 'triangle'
    | 'square'

  variant?:
    | 'line'
    | 'swatch'
    | 'icon'

  icon?: Component
}

const props = withDefaults(
  defineProps<Props>(),
  {
    type: 'solid',
    marker: 'none',
    variant: 'line',
    icon: undefined,
  },
)

const dashArray = computed(() => {
  switch (props.type) {
    case 'dashed':
      return '8 6'

    case 'dotted':
      return '2 6'

    case 'dashdot':
      return '8 4 2 4'

    case 'solid':
    default:
      return undefined
  }
})
</script>