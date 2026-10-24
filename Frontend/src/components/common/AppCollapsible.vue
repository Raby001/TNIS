<template>
  <div
    class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-[width] duration-200 ease-in-out"
    :class="[
      compact ? 'app-collapsible--compact' : '',
      isMobile ? 'app-collapsible--mobile' : '',
      !isMobile && compact
        ? (open
            ? 'app-collapsible--open'
            : 'app-collapsible--closed')
        : '',
    ]"
  >
    <!-- Header -->
    <button
      class="app-collapsible__header flex w-full items-center justify-between text-left transition hover:bg-slate-50"
      @click="toggle"
    >
      <div class="flex items-center gap-2">
        <component
          v-if="icon"
          :is="icon"
          :size="compact ? 16 : 18"
        />

        <span
          class="app-collapsible__title font-semibold text-slate-700"
        >
          {{ title }}
        </span>
      </div>

      <ChevronDown
        :size="compact ? 16 : 18"
        class="app-collapsible__chevron transition-transform duration-300"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <!-- Content -->
    <Transition name="collapse">
      <div
        v-show="open"
        class="app-collapsible__content"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  ref,
} from 'vue'

import { ChevronDown } from 'lucide-vue-next'
import type { Component } from 'vue'

interface Props {
  title: string
  icon?: Component
  defaultOpen?: boolean
  compact?: boolean
}

const props = withDefaults(
  defineProps<Props>(),
  {
    defaultOpen: true,
    compact: false,
  },
)

const open = ref(props.defaultOpen)

const isMobile = ref(false)

let mediaQuery: MediaQueryList | null = null

const toggle = () => {
  open.value = !open.value
}

const syncMobileState = () => {
  if (!mediaQuery) return

  isMobile.value = mediaQuery.matches

  open.value = mediaQuery.matches
    ? false
    : props.defaultOpen
}

onMounted(() => {
  if (typeof window === 'undefined') return

  mediaQuery = window.matchMedia(
    '(max-width: 767px)',
  )

  syncMobileState()

  mediaQuery.addEventListener(
    'change',
    syncMobileState,
  )
})

onUnmounted(() => {
  mediaQuery?.removeEventListener(
    'change',
    syncMobileState,
  )
})
</script>

<style scoped>

.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 600px;
}

.app-collapsible--compact {
  width: 190px;
}

.app-collapsible--compact.app-collapsible--open {
  width: 290px;
  max-width: calc(100vw - 2rem);
}

.app-collapsible--compact.app-collapsible--closed {
  width: 190px;
}

.app-collapsible--compact .app-collapsible__header {
  padding: 0.55rem 0.7rem;
}

.app-collapsible--compact .app-collapsible__title {
  font-size: 0.85rem;
}

.app-collapsible--compact .app-collapsible__chevron {
  flex-shrink: 0;
}

.app-collapsible__header {
  padding: 0.75rem 0.9rem;
}

.app-collapsible--mobile {
  width: fit-content;
  min-width: 3rem;
}

.app-collapsible--mobile .app-collapsible__header {
  justify-content: center;
  gap: 0;
  padding: 0.55rem;
}

.app-collapsible--mobile .app-collapsible__title,
.app-collapsible--mobile .app-collapsible__chevron {
  display: none;
}

.app-collapsible--mobile .app-collapsible__content {
  min-width: 13rem;
}

.app-collapsible__content {
  border-top: 1px solid #e2e8f0;
}
</style>