<template>
  <div
    class="absolute bottom-3 left-3 z-20 md:bottom-4 md:left-4"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="relative">

      <!-- Expanded tools -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="translate-y-2 opacity-0 scale-95"
        enter-to-class="translate-y-0 opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="translate-y-0 opacity-100 scale-100"
        leave-to-class="translate-y-2 opacity-0 scale-95"
      >
        <div
          v-if="isDesktopMenuOpen"
          class="
            absolute bottom-full left-0 mb-2
            flex flex-col gap-1.5
            rounded-2xl
            border border-slate-200/80
            bg-white/95
            p-1.5
            shadow-xl shadow-slate-900/15
            backdrop-blur
          "
        >
          <button
            v-for="tool in desktopOtherTools"
            :key="tool.id"
            type="button"
            :title="tool.label"
            class="
              group relative
              flex
              h-10 w-10
              items-center justify-center
              rounded-xl
              text-slate-600
              transition-all duration-150
              hover:bg-slate-100
              hover:text-slate-900
              active:scale-95
            "
            @click="setDesktopTool(tool.id)"
          >
            <component
              :is="tool.icon"
              :size="18"
              :stroke-width="2"
            />

            <!-- Tooltip - desktop only -->
            <span
              class="
                pointer-events-none
                absolute left-full ml-2
                hidden md:block
                whitespace-nowrap
                rounded-lg
                bg-slate-900
                px-2.5 py-1.5
                text-[11px] font-medium
                text-white
                opacity-0
                shadow-lg
                transition-opacity duration-150
                group-hover:opacity-100
              "
            >
              {{ tool.label }}
            </span>
          </button>
        </div>
      </Transition>

      <!-- Current active tool -->
      <button
        type="button"
        class="
          group relative
          flex
          h-11 w-11
          items-center justify-center
          rounded-xl
          border border-slate-200/80
          bg-white/95
          text-slate-700
          shadow-lg shadow-slate-900/10
          backdrop-blur
          transition-all duration-150
          hover:bg-slate-100
          hover:text-slate-900
          hover:shadow-xl
          active:scale-95
          md:h-11 md:w-11
        "
        :class="{
          'bg-slate-900 text-black hover:bg-slate-800 hover:text-white':
            activeToolConfig.id !== 'navigate',
        }"
        :aria-label="activeToolConfig.label"
        :title="activeToolConfig.label"
        @click="toggleDesktopMenu"
      >
        <component
          :is="activeToolConfig.icon"
          :size="18"
          :stroke-width="2"
        />

        <!-- Active indicator -->
        <span
          class="
            absolute bottom-1 right-1
            h-1.5 w-1.5
            rounded-full
            bg-sky-500
          "
          :class="{
            'bg-white': activeToolConfig.id !== 'navigate',
          }"
        />

        <!-- Current tool tooltip -->
        <span
          class="
            pointer-events-none
            absolute left-full ml-2
            hidden md:block
            whitespace-nowrap
            rounded-lg
            bg-slate-900
            px-2.5 py-1.5
            text-[11px] font-medium
            text-white
            opacity-0
            shadow-lg
            transition-opacity duration-150
            group-hover:opacity-100
          "
        >
          {{ activeToolConfig.label }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Cable,
  MapPinHouse,
  MapPinPlus,
  MapPinned,
  MousePointer2,
} from 'lucide-vue-next'

import {
  computed,
  ref,
  type Component,
} from 'vue'

import {
  useMapStore,
  type MapTool,
} from '@/stores/map.store'

import { useMap } from '@/composables/useMap'
import { useMapPermissions } from '@/composables/useMapPermissions'

const mapStore = useMapStore()

const { startCableDrawing } = useMap()
const { canManage } = useMapPermissions()

interface MapToolDefinition {
  id: MapTool
  label: string
  icon: Component
}

const tools: MapToolDefinition[] = [
  {
    id: 'navigate',
    label: 'Pan',
    icon: MousePointer2,
  },
  {
    id: 'create-site',
    label: 'Create Site',
    icon: MapPinHouse,
  },
  {
    id: 'create-field-observation',
    label: 'Mark Temp Point',
    icon: MapPinned,
  },
  {
    id: 'create-asset-point',
    label: 'Create Asset Point',
    icon: MapPinPlus,
  },
  {
    id: 'draw-cable',
    label: 'Draw Cable',
    icon: Cable,
  },
]

const isDesktopMenuOpen = ref(false)

const defaultTool = tools.find(
  tool => tool.id === 'navigate',
)!

const activeToolConfig = computed(() => {
  return (
    tools.find(
      tool => tool.id === mapStore.activeTool,
    ) ?? defaultTool
  )
})

const desktopOtherTools = computed(() => {
  return availableTools.value.filter(
    tool => tool.id !== activeToolConfig.value.id,
  )
})

const availableTools = computed(() => {
  if (canManage.value) return tools

  return tools.filter(tool => tool.id === 'navigate')
})

const setTool = async (tool: MapTool) => {
  if (tool !== 'navigate' && !canManage.value) return

  if (tool === 'draw-cable') {
    await startCableDrawing()
    return
  }

  mapStore.setActiveTool(tool)
}

const setDesktopTool = async (
  tool: MapTool,
) => {
  await setTool(tool)

  isDesktopMenuOpen.value = false
}

const toggleDesktopMenu = () => {
  isDesktopMenuOpen.value =
    !isDesktopMenuOpen.value
}

const handleMouseEnter = () => {
  isDesktopMenuOpen.value = true
}

const handleMouseLeave = () => {
  isDesktopMenuOpen.value = false
}
</script>
