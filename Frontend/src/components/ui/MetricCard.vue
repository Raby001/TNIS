<template>
  <div
    class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    :class="clickable ? 'cursor-pointer' : ''"
    @click="clickable && $emit('click')"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
          {{ label }}
        </p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">
          {{ value }}
        </p>
        <p v-if="hint" class="mt-1 text-xs text-slate-500">
          {{ hint }}
        </p>
      </div>

      <div
        v-if="icon"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        :class="toneClasses.bg"
      >
        <component
          :is="icon"
          class="h-4.5 w-4.5"
          :class="toneClasses.icon"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'

type Tone = 'emerald' | 'blue' | 'violet' | 'amber' | 'slate' | 'red'

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    hint?: string
    icon?: Component
    tone?: Tone
    clickable?: boolean
  }>(),
  {
    tone: 'slate',
    clickable: false,
  }
)

defineEmits<{
  click: []
}>()

const toneMap: Record<Tone, { bg: string; icon: string }> = {
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
  slate: { bg: 'bg-slate-100', icon: 'text-slate-600' },
  red: { bg: 'bg-red-50', icon: 'text-red-600' },
}

const toneClasses = computed(() => toneMap[props.tone])
</script>